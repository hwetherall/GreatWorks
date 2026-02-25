"use client";

import { useEffect, useState } from "react";
import type { KnowledgeLevel } from "@/lib/prompts";

interface PrimerProps {
  level: KnowledgeLevel;
}

export default function Primer({ level }: PrimerProps) {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrimer() {
      setIsStreaming(true);
      setText("");
      setError(null);

      try {
        const res = await fetch(`/api/primer?level=${level}`);

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

        while (!cancelled) {
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
              if (delta && !cancelled) {
                setText((prev) => prev + delta);
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load primer."
          );
        }
      } finally {
        if (!cancelled) setIsStreaming(false);
      }
    }

    fetchPrimer();
    return () => {
      cancelled = true;
    };
  }, [level]);

  return (
    <section style={{ marginBottom: "72px" }}>
      {/* "Before You Begin" label */}
      <p
        style={{
          fontFamily:
            "var(--font-cormorant), Georgia, 'Times New Roman', serif",
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#4a4540",
          margin: "0 0 24px",
        }}
      >
        Before You Begin
      </p>

      {error ? (
        <p
          style={{
            fontFamily: "var(--font-lora), Georgia, serif",
            fontSize: "15px",
            lineHeight: 1.75,
            color: "#8a847a",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : isStreaming && text.length === 0 ? (
        <p
          style={{
            fontFamily:
              "var(--font-cormorant), Georgia, 'Times New Roman', serif",
            fontSize: "20px",
            fontStyle: "italic",
            color: "#4a4540",
            margin: 0,
          }}
          className="annotation-loading"
        >
          Preparing your introduction…
        </p>
      ) : (
        <p
          style={{
            fontFamily:
              "var(--font-lora), Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            lineHeight: 1.85,
            color: "#f0ebe2",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
          {isStreaming && (
            <span className="annotation-cursor" aria-hidden="true" />
          )}
        </p>
      )}

      {/* Divider after primer has loaded */}
      {!isStreaming && text && (
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right, #2a2820, transparent)",
            marginTop: "48px",
          }}
        />
      )}
    </section>
  );
}
