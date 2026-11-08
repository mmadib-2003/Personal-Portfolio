/**
 * Minimal stand-in for the Vercel AI Gateway.
 *
 * It speaks the same shape the `@ai-sdk/gateway` provider expects: an SSE
 * stream of `LanguageModelV4StreamPart` frames. That lets the *real* route
 * handler, agent, prompt and tools run end-to-end without network access.
 *
 *   node scripts/mock-gateway.mjs [port]
 *
 * Point the app at it with AI_GATEWAY_BASE_URL=http://127.0.0.1:4010 and any
 * non-empty AI_GATEWAY_API_KEY.
 */
import http from "node:http";

const PORT = Number(process.argv[2] ?? process.env.MOCK_PORT ?? 4010);

function frame(res, parts) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  for (const part of parts) res.write(`data: ${JSON.stringify(part)}\n\n`);
  res.end();
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ mock: true }));
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  let payload = {};
  try {
    payload = JSON.parse(body);
  } catch {
    res.writeHead(400).end("bad json");
    return;
  }

  const auth = String(req.headers.authorization ?? "");
  const prompt = payload.prompt ?? [];
  const tools = payload.tools ?? [];
  const toolNames = tools.map((t) => t?.name);
  const hasToolResult = prompt.some((m) => m.role === "tool");
  const systemPrompt = JSON.stringify(prompt[0]?.content ?? "");
  const userPrompt = JSON.stringify(prompt.at(-1)?.content ?? "");

  console.log(
    `[mock] ${req.method} ${req.url} auth=${auth.slice(0, 14) || "none"} tools=${toolNames.length} turns=${prompt.length} hasToolResult=${hasToolResult}`,
  );
  console.log(`[mock] system prompt (${systemPrompt.length} chars): ${systemPrompt.slice(0, 90)}…`);

  // Only the documented test key is accepted, so the route's auth-failure
  // path can be exercised deliberately (set AI_GATEWAY_API_KEY to anything
  // else and the mock answers 401, like the real Gateway does).
  if (auth !== "Bearer mock-local-key") {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(
      JSON.stringify({ error: { message: "No authentication provided", type: "authentication_error" } }),
    );
    return;
  }

  // Turn 1 — the model decides to call a tool.
  if (toolNames.length > 0 && !hasToolResult) {
    console.log("[mock] -> tool call: query_projects");
    frame(res, [
      { type: "stream-start", warnings: [] },
      { type: "tool-input-start", id: "call_1", toolName: "query_projects" },
      { type: "tool-input-delta", id: "call_1", delta: '{"query":"python"}' },
      { type: "tool-input-end", id: "call_1" },
      {
        type: "tool-call",
        toolCallId: "call_1",
        toolName: "query_projects",
        input: JSON.stringify({ query: "python" }),
      },
      {
        type: "finish",
        finishReason: { unified: "tool-calls", raw: "tool_calls" },
        usage: { inputTokens: 120, outputTokens: 18, totalTokens: 138 },
      },
    ]);
    return;
  }

  // Turn 2 — answer in prose, echoing whether the tool actually ran.
  const sawTool = hasToolResult ? "with tool data" : "without tool data";
  console.log(`[mock] -> text answer (${sawTool})`);
  frame(res, [
    { type: "stream-start", warnings: [] },
    { type: "text-start", id: "txt_1" },
    { type: "text-delta", id: "txt_1", delta: "Muntasir's Python work sits in " },
    {
      type: "text-delta",
      id: "txt_1",
      delta: "Log Enrichment Scripts and the Packet Triage Lab",
    },
    { type: "text-delta", id: "txt_1", delta: ` (${sawTool}).` },
    { type: "text-end", id: "txt_1" },
    {
      type: "finish",
      finishReason: { unified: "stop", raw: "stop" },
      usage: { inputTokens: 260, outputTokens: 32, totalTokens: 292 },
    },
  ]);
  void userPrompt;
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[mock] AI Gateway stand-in listening on http://0.0.0.0:${PORT}`);
});
