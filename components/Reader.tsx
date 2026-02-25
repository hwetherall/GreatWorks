"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { book1 } from "@/lib/paradise-lost";
import type { KnowledgeLevel } from "@/lib/prompts";
import { BOOK_1_SECTIONS } from "@/lib/sections";
import SectionCard from "./SectionCard";

interface ReaderProps {
  level: KnowledgeLevel;
  activeLines: { start: number; end: number } | null;
  onAnnotateRequest: (
    passage: string,
    lineRange: string,
    lines: { start: number; end: number }
  ) => void;
  completedSections: Set<string>;
  onSectionComplete: (sectionId: string) => void;
}

interface TriggerState {
  text: string;
  lineRange: string;
  lines: { start: number; end: number };
  viewportX: number;
  viewportY: number;
}

interface VocabCard {
  lineNumber: number;
  word: string;
  definition: string;
  etymology: string;
}

interface VocabHoverState {
  card: VocabCard;
  viewportX: number;
  viewportY: number;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
}

function getLineRangeFromSelection(
  selection: Selection
): { start: number; end: number } | null {
  if (!selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  const lineSpans = document.querySelectorAll("[data-line]");
  const covered: number[] = [];
  lineSpans.forEach((span) => {
    if (range.intersectsNode(span)) {
      const n = parseInt(span.getAttribute("data-line") || "", 10);
      if (!isNaN(n)) covered.push(n);
    }
  });
  if (covered.length === 0) return null;
  return { start: Math.min(...covered), end: Math.max(...covered) };
}

export default function Reader({
  level,
  activeLines,
  onAnnotateRequest,
  completedSections,
  onSectionComplete,
}: ReaderProps) {
  const { lines } = book1;
  const [trigger, setTrigger] = useState<TriggerState | null>(null);
  const [vocabByLine, setVocabByLine] = useState<Map<number, Map<string, VocabCard>>>(
    new Map()
  );
  const [hoveredVocab, setHoveredVocab] = useState<VocabHoverState | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVocabCards() {
      try {
        const res = await fetch("/api/vocab?chapterId=book1");
        if (!res.ok) return;
        const cards = (await res.json()) as VocabCard[];
        if (cancelled) return;

        const next = new Map<number, Map<string, VocabCard>>();
        for (const card of cards) {
          if (!next.has(card.lineNumber)) {
            next.set(card.lineNumber, new Map());
          }
          next.get(card.lineNumber)!.set(normalizeWord(card.word), card);
        }
        setVocabByLine(next);
      } catch {
        // Keep reader usable even if vocab loading fails.
      }
    }

    loadVocabCards();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectionEnd = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      setTrigger(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setTrigger(null);
      return;
    }

    // Only trigger if selection is within the poem
    const range = selection.getRangeAt(0);
    if (!articleRef.current?.contains(range.commonAncestorContainer)) {
      setTrigger(null);
      return;
    }

    const lineRange = getLineRangeFromSelection(selection);
    if (!lineRange) {
      setTrigger(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const lineRangeStr =
      lineRange.start === lineRange.end
        ? `${lineRange.start}`
        : `${lineRange.start}–${lineRange.end}`;

    // Position trigger just below/right of selection end, clamped to viewport
    const x = Math.min(rect.right + 8, window.innerWidth - 130);
    const y = rect.bottom + 6;

    setTrigger({ text, lineRange: lineRangeStr, lines: lineRange, viewportX: x, viewportY: y });
  }, []);

  // Dismiss trigger when clicking outside the poem or the trigger button
  useEffect(() => {
    function onDocumentMouseDown(e: MouseEvent) {
      const target = e.target as Element;
      if (
        target.closest('[data-annotation-trigger="true"]') ||
        articleRef.current?.contains(target)
      )
        return;
      setTrigger(null);
    }
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  function handleTriggerClick() {
    if (!trigger) return;
    onAnnotateRequest(trigger.text, trigger.lineRange, trigger.lines);
    setTrigger(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <>
      <article
        ref={articleRef}
        onMouseUp={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
        data-poem="true"
        style={{
          fontFamily: "var(--font-lora), Georgia, 'Times New Roman', serif",
        }}
      >
        {BOOK_1_SECTIONS.map((section) => {
          const sectionLines = lines.filter(
            (l) => l.number >= section.lineStart && l.number <= section.lineEnd
          );
          return (
            <React.Fragment key={section.id}>
              <SectionCard
                cardType="before"
                section={section}
                level={level}
              />
              {sectionLines.map((line) => {
                const showNumber = line.number % 5 === 0 || line.number === 1;
                const isActive =
                  activeLines !== null &&
                  line.number >= activeLines.start &&
                  line.number <= activeLines.end;

                return (
                  <div
                    key={line.number}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      lineHeight: "1.85",
                      minHeight: "1.85em",
                      marginLeft: "-6px",
                      paddingLeft: "6px",
                      paddingRight: "6px",
                      borderRadius: "3px",
                      background: isActive
                        ? "rgba(201, 168, 76, 0.07)"
                        : "transparent",
                      transition: "background 0.3s ease",
                    }}
                  >
                    {/* Line number */}
                    <span
                      style={{
                        display: "inline-block",
                        width: "48px",
                        minWidth: "48px",
                        textAlign: "right",
                        paddingRight: "20px",
                        fontFamily:
                          "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                        fontSize: "12px",
                        color: showNumber ? "#4a4540" : "transparent",
                        userSelect: "none",
                        flexShrink: 0,
                        transition: "color 0.3s ease",
                      }}
                    >
                      {line.number}
                    </span>

                    {/* Poem text */}
                    <span
                      data-line={line.number}
                      style={{
                        fontSize: "18px",
                        color: isActive ? "#f8f4ec" : "#f0ebe2",
                        letterSpacing: "0.01em",
                        cursor: "text",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {(line.text.match(/(\s+|[^\s]+)/g) ?? [line.text]).map(
                        (token, index) => {
                          if (/^\s+$/.test(token)) return token;
                          const vocab = vocabByLine
                            .get(line.number)
                            ?.get(normalizeWord(token));
                          if (!vocab) return token;

                          return (
                            <span
                              key={`${line.number}-${index}`}
                              className="vocab-hover-word"
                              onMouseEnter={(event) => {
                                const rect = (
                                  event.currentTarget as HTMLSpanElement
                                ).getBoundingClientRect();
                                setHoveredVocab({
                                  card: vocab,
                                  viewportX: rect.left + rect.width / 2,
                                  viewportY: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredVocab(null)}
                            >
                              {token}
                            </span>
                          );
                        }
                      )}
                    </span>
                  </div>
                );
              })}
              <SectionCard
                cardType="after"
                section={section}
                level={level}
                isCompleted={completedSections.has(section.id)}
                onComplete={() => onSectionComplete(section.id)}
              />
            </React.Fragment>
          );
        })}
      </article>

      {/* Annotation trigger button */}
      {trigger && (
        <button
          data-annotation-trigger="true"
          onClick={handleTriggerClick}
          style={{
            position: "fixed",
            left: trigger.viewportX,
            top: trigger.viewportY,
            zIndex: 60,
            background: "#1c1b18",
            border: "1px solid #c9a84c",
            borderRadius: "3px",
            padding: "5px 13px 6px",
            cursor: "pointer",
            color: "#c9a84c",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.06em",
            boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            transition: "background 0.1s ease, color 0.1s ease",
            pointerEvents: "auto",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#c9a84c";
            (e.currentTarget as HTMLButtonElement).style.color = "#0d0d0e";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1c1b18";
            (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c";
          }}
        >
          ✦ Enrich
        </button>
      )}

      {hoveredVocab && (
        <div
          className="vocab-hover-tooltip"
          style={{
            left: hoveredVocab.viewportX,
            top: Math.max(12, hoveredVocab.viewportY - 8),
          }}
          role="tooltip"
        >
          <p className="vocab-hover-tooltip-word">{hoveredVocab.card.word}</p>
          <p className="vocab-hover-tooltip-definition">
            {hoveredVocab.card.definition}
          </p>
          {hoveredVocab.card.etymology && (
            <p className="vocab-hover-tooltip-etymology">
              {hoveredVocab.card.etymology}
            </p>
          )}
        </div>
      )}
    </>
  );
}
