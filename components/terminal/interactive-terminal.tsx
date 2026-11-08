"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, TerminalSquare } from "lucide-react";

import {
  TERMINAL_SUGGESTIONS,
  runCommand,
  type TerminalContext,
  type TerminalLine,
} from "@/lib/terminal-commands";
import { cn } from "@/lib/utils";

let counter = 0;
function nextId() {
  counter += 1;
  return `l${counter}`;
}

function line(text: string, type: TerminalLine["type"], href?: string): TerminalLine {
  return { id: nextId(), type, text, href };
}

const BANNER: TerminalLine[] = [
  line("muntasir-shell 1.0 — read-only analyst console", "accent"),
  line("connected to portfolio://command-center", "muted"),
  line("type `help` for commands, `whoami` to start", "muted"),
];

export function InteractiveTerminal({ context }: { context: TerminalContext }) {
  const router = useRouter();
  const [lines, setLines] = React.useState<TerminalLine[]>(BANNER);
  const [value, setValue] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [lines]);

  const submit = React.useCallback(
    (raw: string) => {
      const command = raw.trim();
      if (!command) return;

      if (command.toLowerCase() === "clear") {
        setLines([]);
        setHistory((h) => [...h, command]);
        setHistoryIndex(null);
        setValue("");
        return;
      }

      const result = runCommand(command, context);

      setLines((prev) => [
        ...prev,
        line(command, "input"),
        ...result.lines.map((l) => line(l.text, l.type, l.href)),
      ]);
      setHistory((h) => [...h, command]);
      setHistoryIndex(null);
      setValue("");

      if (result.scrollTo) {
        if (result.scrollTo.startsWith("#")) {
          document
            .querySelector(result.scrollTo)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          router.push(result.scrollTo);
        }
      }
    },
    [context, router],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit(value);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next] ?? "");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next] ?? "");
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#05080a] shadow-2xl shadow-black/20">
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
          <span className="ml-2 flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.12em] text-white/40 uppercase">
            <TerminalSquare className="size-3" />
            analyst@portfolio:~
          </span>
        </div>
        <span className="hidden font-mono text-[0.58rem] tracking-[0.14em] text-white/25 uppercase sm:block">
          read-only
        </span>
      </div>

      {/* buffer */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="h-[300px] cursor-text overflow-y-auto px-4 py-3 font-mono text-[0.72rem] leading-relaxed sm:h-[340px] sm:text-[0.78rem]"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {lines.map((entry) => (
          <div key={entry.id} className="whitespace-pre-wrap">
            {entry.type === "input" ? (
              <p className="text-white/90">
                <span className="text-[#35f08e]">➜</span>{" "}
                <span className="text-[#5fd7ff]">~</span>{" "}
                <span>{entry.text}</span>
              </p>
            ) : entry.href ? (
              <a
                href={entry.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-white/60 underline decoration-white/20 underline-offset-2 hover:text-[#35f08e]"
              >
                {entry.text}
              </a>
            ) : (
              <p
                className={cn(
                  entry.type === "output" && "text-white/70",
                  entry.type === "accent" && "text-[#35f08e]",
                  entry.type === "muted" && "text-white/35",
                  entry.type === "error" && "text-[#ff6b63]",
                )}
              >
                {entry.text}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* prompt */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
        className="flex items-center gap-2 border-t border-white/10 bg-black/40 px-4 py-3"
      >
        <span className="font-mono text-[0.78rem] text-[#35f08e]">➜</span>
        <span className="font-mono text-[0.78rem] text-[#5fd7ff]">~</span>
        <label htmlFor="terminal-input" className="sr-only">
          Terminal command
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={64}
          placeholder="try `help`"
          className="min-w-0 flex-1 bg-transparent font-mono text-[0.78rem] text-white placeholder:text-white/25 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Run command"
          className="grid size-7 place-items-center rounded border border-white/10 text-white/40 transition-colors hover:border-[#35f08e]/40 hover:text-[#35f08e]"
        >
          <CornerDownLeft className="size-3.5" />
        </button>
      </form>

      {/* quick chips */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/10 bg-black/20 px-4 py-2.5">
        {TERMINAL_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              submit(suggestion);
              inputRef.current?.focus();
            }}
            className="rounded border border-white/10 px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.08em] text-white/45 uppercase transition-colors hover:border-[#35f08e]/40 hover:text-[#35f08e]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
