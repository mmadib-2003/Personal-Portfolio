"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowUp,
  Bot,
  Loader2,
  Minimize2,
  Sparkles,
  User,
  X,
} from "lucide-react";

import type { PortfolioProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const STARTERS = [
  "What SOC projects has Muntasir built?",
  "How strong is he with Wireshark?",
  "Show me his GitHub repositories",
  "Is he available for an internship?",
];

/**
 * Floating streaming chat — the "SOC Assistant".
 *
 * Streaming comes from /api/chat via the AI SDK's UI message protocol, so
 * tool calls resolve server-side and tokens render as they arrive. The panel
 * is fully keyboard accessible and traps nothing: Escape closes it.
 */
export function ChatWidget({ profile }: { profile: PortfolioProfile }) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const transport = React.useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  // Derived, not stored: the endpoint answers 503 when the Gateway key is
  // missing, and the SDK surfaces that message on `error`.
  const unavailable = React.useMemo(() => {
    if (!error) return null;
    const message = `${error.message ?? ""}`;
    if (message.includes("503") || /unconfigured|not configured/i.test(message)) {
      return "The AI assistant is not enabled on this deployment yet. You can still reach Muntasir directly.";
    }
    return null;
  }, [error]);

  const busy = status === "submitted" || status === "streaming";

  React.useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, status]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy || unavailable) return;
    sendMessage({ text: trimmed.slice(0, 1200) });
    setInput("");
  };

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="soc-assistant-panel"
        className={cn(
          "group fixed right-4 bottom-4 z-50 flex items-center gap-2.5 rounded-full border border-primary/40 bg-card px-4 py-3 shadow-lg shadow-black/20 transition-all hover:border-primary/70 hover:shadow-[0_0_32px_-6px_var(--glow)] sm:right-6 sm:bottom-6",
          open && "pointer-events-none opacity-0",
        )}
      >
        <span className="relative grid size-7 place-items-center rounded-full bg-primary/15">
          <Bot className="size-4 text-primary" />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border-2 border-card bg-primary" />
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="font-mono text-[0.7rem] font-semibold tracking-wide">
            SOC Assistant
          </span>
          <span className="mt-0.5 font-mono text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase">
            ask about muntasir
          </span>
        </span>
      </button>

      {/* panel */}
      <div
        id="soc-assistant-panel"
        role="dialog"
        aria-modal="false"
        aria-label="SOC Assistant chat"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-3 bottom-3 z-50 flex max-h-[min(78vh,620px)] origin-bottom-right flex-col overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-200 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[400px]",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md border border-primary/30 bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </span>
            <div className="leading-tight">
              <p className="font-mono text-[0.75rem] font-semibold">SOC Assistant</p>
              <p className="font-mono text-[0.55rem] tracking-[0.14em] text-muted-foreground uppercase">
                grounded on portfolio data + github
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* transcript */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-3.5">
                <p className="text-[0.82rem] leading-relaxed text-foreground/90">
                  Hi — I&apos;m Muntasir&apos;s SOC Assistant. I can answer questions
                  about his projects, skills, write-ups and GitHub activity using the
                  portfolio&apos;s live data.
                </p>
                <p className="mt-2 font-mono text-[0.6rem] tracking-[0.1em] text-muted-foreground uppercase">
                  try one of these
                </p>
              </div>
              <div className="grid gap-1.5">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => send(starter)}
                    disabled={Boolean(unavailable)}
                    className="rounded border border-border px-3 py-2 text-left text-[0.78rem] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => {
            const text = message.parts
              .filter(
                (part): part is { type: "text"; text: string } =>
                  part.type === "text" && typeof (part as { text?: unknown }).text === "string",
              )
              .map((part) => part.text)
              .join("\n");

            const tools = message.parts.filter((part) =>
              part.type.startsWith("tool-"),
            );

            if (!text && tools.length === 0) return null;

            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded border",
                    isUser
                      ? "border-border bg-secondary text-muted-foreground"
                      : "border-primary/30 bg-primary/10 text-primary",
                  )}
                  aria-hidden
                >
                  {isUser ? <User className="size-3" /> : <Bot className="size-3" />}
                </span>
                <div
                  className={cn(
                    "min-w-0 max-w-[85%] rounded-lg px-3 py-2 text-[0.82rem] leading-relaxed",
                    isUser
                      ? "bg-secondary text-secondary-foreground"
                      : "border border-border bg-background/60",
                  )}
                >
                  {tools.length > 0 ? (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {tools.map((tool, index) => (
                        <span
                          key={`${message.id}-tool-${index}`}
                          className="inline-flex items-center gap-1 rounded border border-primary/25 bg-primary/8 px-1.5 py-0.5 font-mono text-[0.55rem] tracking-[0.1em] text-primary uppercase"
                        >
                          <Loader2 className="size-2.5 animate-spin" />
                          {tool.type.replace("tool-", "").replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {text ? (
                    <p className="whitespace-pre-wrap break-words">{text}</p>
                  ) : null}
                </div>
              </div>
            );
          })}

          {status === "submitted" ? (
            <div className="flex items-center gap-2 pl-9 font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
              <Loader2 className="size-3 animate-spin" />
              analyst is checking the logs…
            </div>
          ) : null}

          {unavailable ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[0.78rem] leading-relaxed text-amber-600 dark:text-amber-400">
              {unavailable}{" "}
              <a
                href={`mailto:${profile.email}`}
                className="underline underline-offset-2"
              >
                {profile.email}
              </a>
            </div>
          ) : null}

          {error && !unavailable ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-[0.78rem] leading-relaxed text-destructive">
              Something went wrong reaching the assistant. You can retry, or email{" "}
              <a href={`mailto:${profile.email}`} className="underline underline-offset-2">
                {profile.email}
              </a>
              .
            </div>
          ) : null}
        </div>

        {/* composer */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="border-t border-border bg-secondary/20 p-2.5"
        >
          <div className="flex items-end gap-2 rounded-lg border border-border bg-background/70 p-1.5 focus-within:border-primary/50">
            <label htmlFor="chat-input" className="sr-only">
              Message the SOC Assistant
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 1200))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              placeholder={
                unavailable ? "Assistant offline — email Muntasir" : "Ask about skills, projects, repos…"
              }
              disabled={Boolean(unavailable)}
              className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.82rem] placeholder:text-muted-foreground/70 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={busy || !input.trim() || Boolean(unavailable)}
              aria-label="Send message"
              className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 px-1 font-mono text-[0.55rem] tracking-[0.08em] text-muted-foreground/70 uppercase">
            {input.length}/1200 · enter to send · esc to close
          </p>
        </form>
      </div>

      {/* collapse affordance while open */}
      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Minimise chat"
          className="fixed right-4 bottom-4 z-40 hidden size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-lg sm:right-6 sm:bottom-6 lg:flex"
        >
          <Minimize2 className="size-4" />
        </button>
      ) : null}
    </>
  );
}
