// Floating assistant chat — mounted inside the authenticated workspace layout.
// Sends full conversation history to /api/assistant on each turn.

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SEED: Msg[] = [
  {
    role: "assistant",
    content:
      "Hi — I'm the **TaxSailor Assistant**. Ask me anything about the workspace, our pricing tiers, or general cross-border tax concepts. I'm not a licensed advisor, so for anything binding, book a call via /contact.",
  },
];

export function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-medium text-white shadow-xl transition-colors hover:bg-teal"
          aria-label="Open assistant"
        >
          <MessageCircle className="size-4" /> Ask TaxSailor
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 flex h-[560px] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-md border border-navy/15 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-navy/10 bg-navy px-4 py-3 text-white">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-teal">Assistant</p>
              <p className="font-serif text-sm">TaxSailor helper</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-ghost/40 px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : ""}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-md bg-navy px-3 py-2 text-sm text-white"
                      : "max-w-[95%] text-sm text-navy [&_a]:text-teal [&_a]:underline [&_code]:rounded [&_code]:bg-navy/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-navy [&_strong]:font-semibold"
                  }
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-navy/60">
                <Loader2 className="size-3 animate-spin" /> Thinking…
              </div>
            )}
            {error && (
              <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
          </div>
          <div className="border-t border-navy/10 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about your workspace…"
                rows={1}
                className="min-h-[40px] max-h-32 flex-1 resize-none rounded-sm border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-teal"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="grid size-10 place-items-center rounded-sm bg-navy text-white transition-colors hover:bg-teal disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
