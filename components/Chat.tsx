"use client";

import { useEffect, useRef, useState } from "react";
import type { KnowledgeLevel } from "@/lib/prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  level: KnowledgeLevel;
  pendingPassage?: string | null;
  onPassageConsumed?: () => void;
}

export default function Chat({ level, pendingPassage, onPassageConsumed }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUpRef = useRef(false);

  // Smart scroll: only pull to bottom if user hasn't scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // When a passage is sent from the reader, pre-fill the textarea
  useEffect(() => {
    if (!pendingPassage) return;
    setInput(`"${pendingPassage}"\n`);
    setMobileOpen(true);
    setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
      ta.focus();
      ta.selectionStart = ta.selectionEnd = ta.value.length;
    }, 0);
    onPassageConsumed?.();
  }, [pendingPassage]);

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }

  function handleScrollContainer() {
    const el = scrollContainerRef.current;
    if (!el) return;
    userScrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 60;
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || isStreaming) return;

    // Always scroll to bottom when user sends a new message
    userScrolledUpRef.current = false;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsStreaming(true);

    // Add placeholder for the streaming assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, level }),
      });

      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const sseLines = chunk.split("\n");

        for (const sseLine of sseLines) {
          if (!sseLine.startsWith("data: ")) continue;
          const data = sseLine.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + delta,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const lastMsg = messages[messages.length - 1];
  const showTypingIndicator =
    isStreaming && lastMsg?.role === "assistant" && lastMsg.content === "";

  return (
    <>
      {/* Mobile toggle button — only visible on small screens */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Open discussion panel"
        className="chat-toggle-mobile"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#1c1b18",
          border: "1px solid #2a2820",
          color: "#c9a84c",
          fontSize: "20px",
          cursor: "pointer",
          display: "none", // shown via CSS on mobile
          alignItems: "center",
          justifyContent: "center",
          zIndex: 35,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        ✦
      </button>

      {/* Chat panel */}
      <div
        className={`chat-panel${mobileOpen ? " chat-panel--open" : ""}`}
        aria-label="Discussion panel"
        role="complementary"
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 20px 16px",
            borderBottom: "1px solid #2a2820",
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#4a4540",
              margin: 0,
            }}
          >
            Discussion
          </p>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close discussion panel"
            className="chat-close-mobile"
            style={{
              background: "transparent",
              border: "none",
              color: "#4a4540",
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
              padding: 0,
              display: "none", // shown via CSS on mobile
            }}
          >
            ×
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScrollContainer}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
          }}
        >
          {messages.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#4a4540",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: "40px",
                margin: "40px 0 0",
              }}
            >
              Ask about what you&rsquo;re reading…
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: "14px",
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "88%",
                  padding: msg.role === "user" ? "9px 13px" : "0",
                  borderRadius:
                    msg.role === "user" ? "12px 12px 2px 12px" : "0",
                  background: msg.role === "user" ? "#1c1b18" : "transparent",
                  border:
                    msg.role === "user" ? "1px solid #2a2820" : "none",
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "14px",
                  lineHeight: 1.72,
                  color: msg.role === "user" ? "#f0ebe2" : "#d4cfc6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
                {isStreaming &&
                  i === messages.length - 1 &&
                  msg.role === "assistant" &&
                  msg.content.length > 0 && (
                    <span
                      className="annotation-cursor"
                      aria-hidden="true"
                    />
                  )}
              </div>
            </div>
          ))}

          {showTypingIndicator && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  fontFamily:
                    "var(--font-cormorant), Georgia, serif",
                  fontSize: "18px",
                  fontStyle: "italic",
                  color: "#4a4540",
                  margin: 0,
                  letterSpacing: "0.1em",
                }}
                className="annotation-loading"
              >
                · · ·
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid #2a2820",
            flexShrink: 0,
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about what you're reading…"
            rows={1}
            disabled={isStreaming}
            className="chat-input"
            style={{
              flex: 1,
              background: "#141412",
              border: "1px solid #2a2820",
              borderRadius: "8px",
              padding: "9px 12px",
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#f0ebe2",
              resize: "none",
              outline: "none",
              caretColor: "#c9a84c",
              overflow: "hidden",
              transition: "border-color 0.15s ease",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            style={{
              background:
                input.trim() && !isStreaming ? "#c9a84c" : "#2a2820",
              border: "none",
              borderRadius: "8px",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:
                input.trim() && !isStreaming ? "pointer" : "default",
              transition: "background 0.15s ease",
              flexShrink: 0,
              color:
                input.trim() && !isStreaming ? "#0d0d0e" : "#4a4540",
              fontSize: "15px",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
