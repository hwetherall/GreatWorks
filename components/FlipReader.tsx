"use client";

import { useEffect, useRef } from "react";
import { PageFlip } from "page-flip";
import { BOOK_1_SECTIONS } from "@/lib/sections";
import { getLineRange } from "@/lib/paradise-lost";
import SectionCard from "./SectionCard";
import type { KnowledgeLevel } from "@/lib/prompts";
import type { Achievement } from "@/lib/types";

interface FlipReaderProps {
  level: KnowledgeLevel;
  completedSections: Set<string>;
  onSectionComplete: (sectionId: string, achievements: Achievement[]) => void;
}

export default function FlipReader({
  level,
  completedSections,
  onSectionComplete,
}: FlipReaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const flipRef = useRef<PageFlip | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    flipRef.current?.destroy();
    flipRef.current = new PageFlip(rootRef.current, {
      width: 520,
      height: 720,
      size: "stretch",
      maxShadowOpacity: 0.25,
      showCover: false,
      mobileScrollSupport: true,
    });

    const pageEls = rootRef.current.querySelectorAll<HTMLElement>(".flip-page");
    flipRef.current.loadFromHTML(Array.from(pageEls));

    return () => {
      flipRef.current?.destroy();
      flipRef.current = null;
    };
  }, [level]);

  return (
    <div className="w-full flex justify-center">
      <div
        ref={rootRef}
        className="flipbook-root"
        style={{
          width: "min(92vw, 1100px)",
          height: "min(82vh, 760px)",
          minWidth: 320,
          minHeight: 480,
        }}
      >
        {BOOK_1_SECTIONS.map((section) => {
          const sectionLines = getLineRange(section.lineStart, section.lineEnd);
          return (
            <div
              key={section.id}
              className="flip-page"
              style={{
                background: "#141311",
                color: "#f0ebe2",
                border: "1px solid rgba(201, 168, 76, 0.35)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="flip-page-content"
                style={{
                  padding: "24px",
                  overflowY: "auto",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <SectionCard
                  cardType="before"
                  section={section}
                  level={level}
                />

                <div
                  style={{
                    marginTop: 24,
                    fontFamily:
                      "var(--font-lora), Georgia, 'Times New Roman', serif",
                  }}
                >
                  {sectionLines.map((line) => {
                    const showNumber =
                      line.number % 5 === 0 || line.number === 1;
                    return (
                      <div
                        key={line.number}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          lineHeight: 1.85,
                          minHeight: "1.85em",
                          marginLeft: -6,
                          paddingLeft: 6,
                          paddingRight: 6,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 48,
                            minWidth: 48,
                            textAlign: "right",
                            paddingRight: 20,
                            fontFamily:
                              "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                            fontSize: 12,
                            color: showNumber ? "#4a4540" : "transparent",
                            userSelect: "none",
                            flexShrink: 0,
                          }}
                        >
                          {line.number}
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            color: "#f0ebe2",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {line.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 24 }}>
                  <SectionCard
                    cardType="after"
                    section={section}
                    level={level}
                    isCompleted={completedSections.has(section.id)}
                    onComplete={(achievements) =>
                      onSectionComplete(section.id, achievements)
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
