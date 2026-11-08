"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { createAdminServerClient, createPublicServerClient } from "@/lib/supabase/server";
import {
  clientKeyFromHeaders,
  contactFormSchema,
  createRateLimiter,
  looksLikeSpam,
  sanitizeContactInput,
} from "@/lib/security";

export interface ContactState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
}

export const initialContactState: ContactState = { status: "idle", message: "" };

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/**
 * Server Action: submit a contact message.
 *
 * The write goes through the service-role client so the insert path never
 * depends on the anon key, and every field is validated + sanitized first.
 * Contact rows have no public SELECT policy, so nothing is readable back.
 */
export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const headerList = await headers();
  const gate = limiter.check(clientKeyFromHeaders(headerList));

  if (!gate.allowed) {
    return {
      status: "error",
      message: `Too many submissions. Please try again in ${gate.retryAfter}s, or email directly.`,
    };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    company: String(formData.get("company") ?? ""),
  };

  const parsed = contactFormSchema.safeParse(raw);

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: {
        name: flattened.name?.[0],
        email: flattened.email?.[0],
        subject: flattened.subject?.[0],
        message: flattened.message?.[0],
      },
    };
  }

  // Honeypot tripped — pretend success so bots learn nothing.
  if (parsed.data.company && parsed.data.company.length > 0) {
    return { status: "success", message: "Message dispatched." };
  }

  if (looksLikeSpam(parsed.data.message, parsed.data.name)) {
    return {
      status: "error",
      message:
        "That message was flagged by the spam filter. Please email mmadib2001@gmail.com directly.",
    };
  }

  const clean = sanitizeContactInput(parsed.data);
  const allowlisted = clean.email.match(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i)
    ? clean.email
    : null;

  if (!allowlisted) {
    return {
      status: "error",
      message: "Please use a valid email address.",
      fieldErrors: { email: "That email address does not look valid." },
    };
  }

  const writer = createAdminServerClient() ?? createPublicServerClient();

  if (!writer) {
    return {
      status: "error",
      message:
        "The dispatch channel is not configured on this deployment. Please email mmadib2001@gmail.com directly.",
    };
  }

  const { error } = await writer.from("contact_messages").insert({
    name: clean.name,
    email: allowlisted,
    subject: clean.subject,
    message: clean.message,
    user_agent: headerList.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (error) {
    console.error("[contact] insert failed", error.message);
    return {
      status: "error",
      message:
        "The message could not be stored. Please email mmadib2001@gmail.com directly.",
    };
  }

  return {
    status: "success",
    message: "Message received. Muntasir will get back to you within a day.",
  };
}
