"use client";

import { useEffect, useState } from "react";
import { BOOK_1_SECTIONS } from "@/lib/sections";
import { KNOWLEDGE_LEVEL_SHORT } from "@/lib/prompts";
import type { KnowledgeLevel } from "@/lib/prompts";

interface AnnotationEntry {
  id: string;
  line_start: number | null;
  line_end: number | null;
  passage: string;
  knowledge_level: string;
  annotation_content: string;
  created_at: string | null;
}

interface AnnotationHistoryProps {
  annotationVersion: number;
}

function getSectionLabel(lineStart: number | null): string {
  if (lineStart === null) return "";
  const section = BOOK_1_SECTIONS.find(
    (s) => lineStart >= s.lineStart && lineStart <= s.lineEnd
  );
  return section ? `${section.romanNumeral} — ${section.title}` : "";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  return "earlier";
}

function truncatePassage(text: string, maxLen = 90): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export default function AnnotationHistory({
  annotationVersion,
}: AnnotationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<AnnotationEntry[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/annotations");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setEntries(data);
      } catch {
        // Keep panel usable on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [annotationVersion]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const count = entries.length;

  return (
    <>
      {/* Trigger button — bottom left */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close reading journal" : "Open reading journal"}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          width: "156px",
          zIndex: 35,
          background: "#1c1b18",
          border: "1px solid #2a2820",
          borderRadius: "3px",
          padding: "8px 14px 9px",
          cursor: "pointer",
          color: "#8a847a",
          fontFamily:
            "var(--font-cormorant), Georgia, 'Times New Roman', serif",
          fontSize: "14px",
          letterSpacing: "0.04em",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          transition: "border-color 0.2s ease, color 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a4540";
          (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2820";
          (e.currentTarget as HTMLButtonElement).style.color = "#8a847a";
        }}
      >
        <span>Your Insights</span>
        {count > 0 && (
          <span
            style={{
              background: "rgba(201, 168, 76, 0.15)",
              color: "#c9a84c",
              borderRadius: "2px",
              padding: "1px 6px",
              fontSize: "12px",
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
            }}
          >
            {count}
          </span>
        )}
      </button>

      {/* Drawer panel */}
      <div
        aria-label="Reading journal"
        style={{
          position: "fixed",
          bottom: isOpen ? "68px" : "-520px",
          left: "24px",
          width: "320px",
          maxWidth: "calc(100vw - 48px)",
          maxHeight: "480px",
          background: "#141412",
          border: "1px solid #2a2820",
          borderRadius: "4px",
          zIndex: 34,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          transition: "bottom 0.35s ease",
          overflow: "hidden",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: "1px solid #2a2820",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#4a4540",
              margin: 0,
            }}
          >
            Reading Journal
          </p>
        </div>

        {/* Scrollable entries */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "4px 0 8px",
          }}
        >
          {isLoading && entries.length === 0 ? (
            <p
              style={{
                fontFamily:
                  "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                fontSize: "16px",
                fontStyle: "italic",
                color: "#4a4540",
                margin: "20px 18px",
              }}
            >
              Loading…
            </p>
          ) : entries.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#4a4540",
                margin: "20px 18px",
                fontStyle: "italic",
              }}
            >
              Enrich a passage to begin your reading journal.
            </p>
          ) : (
            entries.map((entry, i) => {
              const isExpanded = expandedIds.has(entry.id);
              const sectionLabel = getSectionLabel(entry.line_start);
              const levelLabel =
                KNOWLEDGE_LEVEL_SHORT[
                  entry.knowledge_level as KnowledgeLevel
                ] ?? entry.knowledge_level;

              return (
                <div
                  key={entry.id}
                  style={{
                    padding: "14px 18px",
                    borderBottom:
                      i < entries.length - 1 ? "1px solid #1c1b18" : "none",
                  }}
                >
                  {/* Passage quote */}
                  <p
                    style={{
                      fontFamily:
                        "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                      fontSize: "15px",
                      fontStyle: "italic",
                      color: "#c9a84c",
                      margin: "0 0 6px",
                      lineHeight: 1.5,
                      opacity: 0.85,
                    }}
                  >
                    &ldquo;{truncatePassage(entry.passage)}&rdquo;
                  </p>

                  {/* Meta: section + level + time */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "8px",
                    }}
                  >
                    {sectionLabel && (
                      <span
                        style={{
                          fontFamily:
                            "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#4a4540",
                        }}
                      >
                        {sectionLabel}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--font-lora), Georgia, serif",
                        fontSize: "11px",
                        color: "#4a4540",
                        marginLeft: "auto",
                      }}
                    >
                      {levelLabel} · {timeAgo(entry.created_at)}
                    </span>
                  </div>

                  {/* Annotation content */}
                  <p
                    style={{
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      color: "#8a847a",
                      margin: "0 0 4px",
                      overflow: isExpanded ? "visible" : "hidden",
                      display: isExpanded ? "block" : "-webkit-box",
                      WebkitLineClamp: isExpanded ? undefined : 3,
                      WebkitBoxOrient: isExpanded ? undefined : "vertical",
                    }}
                  >
                    {entry.annotation_content}
                  </p>

                  {/* Read more toggle */}
                  {entry.annotation_content.length > 180 && (
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#4a4540",
                        fontFamily:
                          "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                        fontSize: "12px",
                        letterSpacing: "0.06em",
                        padding: 0,
                        marginTop: "2px",
                      }}
                    >
                      {isExpanded ? "show less" : "read more"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
