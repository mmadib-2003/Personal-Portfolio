"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2, MessageCircle, Send, TriangleAlert } from "lucide-react";

import { submitContactMessage, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import type { PortfolioProfile } from "@/lib/types";

const INITIAL: ContactState = { status: "idle", message: "" };

export function ContactDispatch({ profile }: { profile: PortfolioProfile }) {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    INITIAL,
  );
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form
        ref={formRef}
        action={formAction}
        className="rounded-xl border border-border bg-card/60 p-5 sm:p-7"
        noValidate
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="label-mono text-[0.55rem]">dispatch form · encrypted at rest</p>
          <span className="font-mono text-[0.55rem] tracking-[0.12em] text-muted-foreground/60 uppercase">
            POST /contact
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="name"
            label="Your name"
            placeholder="Alex Rivera"
            autoComplete="name"
            required
            error={state.fieldErrors?.name}
          />
          <Field
            id="email"
            label="Work email"
            type="email"
            placeholder="alex@company.com"
            autoComplete="email"
            required
            error={state.fieldErrors?.email}
          />
        </div>

        <div className="mt-4">
          <Field
            id="subject"
            label="Subject"
            placeholder="SOC internship — Summer 2026"
            error={state.fieldErrors?.subject}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="message"
            className="mb-1.5 block font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground uppercase"
          >
            Message <span className="text-primary">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={4000}
            placeholder="Tell me about the role, the team and the defensive stack you run."
            className="w-full resize-y rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
          />
          {state.fieldErrors?.message ? (
            <p className="mt-1.5 font-mono text-[0.62rem] text-destructive">
              {state.fieldErrors.message}
            </p>
          ) : null}
        </div>

        {/* honeypot — hidden from humans and assistive tech */}
        <div className="hidden" aria-hidden>
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending} size="lg">
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {pending ? "Dispatching…" : "Dispatch message"}
          </Button>
          <p className="font-mono text-[0.58rem] tracking-[0.08em] text-muted-foreground/70 uppercase">
            typically answered within 24h
          </p>
        </div>

        {state.message ? (
          <p
            role="status"
            className={
              state.status === "success"
                ? "mt-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-[0.8rem] text-primary"
                : "mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[0.8rem] text-destructive"
            }
          >
            {state.status === "success" ? (
              <Check className="mt-0.5 size-3.5 shrink-0" />
            ) : (
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            )}
            {state.message}
          </p>
        ) : null}
      </form>

      <aside className="flex flex-col gap-3">
        <ChannelLink
          href={`mailto:${profile.email}`}
          label="Email"
          value={profile.email}
          hint="fastest channel"
        />
        <ChannelLink
          href={`https://wa.me/${profile.whatsapp}`}
          label="WhatsApp"
          value={profile.phone}
          hint="direct line"
          icon={<MessageCircle className="size-3.5" />}
        />
        <ChannelLink
          href={profile.linkedinUrl}
          label="LinkedIn"
          value="muntasir-adib"
          hint="professional profile"
        />
        <div className="mt-auto rounded-xl border border-border bg-card/40 p-4">
          <p className="label-mono text-[0.55rem]">availability</p>
          <p className="mt-2 text-[0.83rem] leading-relaxed text-muted-foreground">
            {profile.availability}
          </p>
          <p className="mt-3 font-mono text-[0.6rem] tracking-[0.1em] text-muted-foreground/70 uppercase">
            {profile.location}
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground uppercase"
      >
        {label}
        {props.required ? <span className="text-primary"> *</span> : null}
      </label>
      <input
        id={id}
        name={id}
        className="h-10 w-full rounded-md border border-border bg-background/60 px-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        {...props}
      />
      {error ? (
        <p className="mt-1.5 font-mono text-[0.62rem] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function ChannelLink({
  href,
  label,
  value,
  hint,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase">
          {icon}
          {label}
        </span>
        <span className="mt-1 block truncate text-[0.82rem] text-foreground/90 group-hover:text-primary">
          {value}
        </span>
        <span className="font-mono text-[0.55rem] text-muted-foreground/60">
          {hint}
        </span>
      </span>
      <Send className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
    </a>
  );
}
