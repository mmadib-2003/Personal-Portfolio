import * as React from "react";

/**
 * Minimal, dependency-free Markdown renderer for the write-up bodies.
 *
 * Deliberately narrow: headings, paragraphs, ordered/unordered lists, bold,
 * inline code and links. Anything unrecognised stays literal text, so a stray
 * HTML tag in the database can never become live markup.
 */

type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/** Renders inline bold/code/code-spans without dangerouslySetInnerHTML. */
function Inline({ text }: { text: string }) {
  const safe = escapeHtml(text);
  const pieces = safe.split(INLINE);

  return (
    <>
      {pieces.map((piece, index) => {
        if (piece.startsWith("**") && piece.endsWith("**") && piece.length > 4) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {piece.slice(2, -2)}
            </strong>
          );
        }
        if (piece.startsWith("`") && piece.endsWith("`") && piece.length > 2) {
          return (
            <code
              key={index}
              className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
            >
              {piece.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={index}>{piece}</React.Fragment>;
      })}
    </>
  );
}

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "h3", text: line.slice(4) });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "h2", text: line.slice(3) });
      continue;
    }

    const unordered = /^[-*]\s+(.*)$/.exec(line);
    if (unordered) {
      flushParagraph();
      if (!list || list.kind !== "ul") {
        flushList();
        list = { kind: "ul", items: [] };
      }
      list.items.push(unordered[1]);
      continue;
    }

    const ordered = /^\d+\.\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (!list || list.kind !== "ol") {
        flushList();
        list = { kind: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function Markdown({ content }: { content: string }) {
  const blocks = React.useMemo(() => parse(content), [content]);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.kind === "h2") {
          return (
            <h2
              key={index}
              className="mt-9 border-l-2 border-primary pl-3 font-display text-xl font-semibold tracking-tight text-foreground"
            >
              <Inline text={block.text} />
            </h2>
          );
        }

        if (block.kind === "h3") {
          return (
            <h3 key={index} className="mt-6 font-mono text-sm font-semibold text-foreground">
              <Inline text={block.text} />
            </h3>
          );
        }

        if (block.kind === "ul") {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex gap-2.5 text-[0.93rem] leading-relaxed text-muted-foreground"
                >
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                  <span>
                    <Inline text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "ol") {
          return (
            <ol key={index} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex gap-3 text-[0.93rem] leading-relaxed text-muted-foreground"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[0.6rem] text-primary">
                    {itemIndex + 1}
                  </span>
                  <span>
                    <Inline text={item} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="text-[0.95rem] leading-[1.8] text-muted-foreground">
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
