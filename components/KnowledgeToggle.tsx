"use client";

import { useState, useEffect } from "react";
import {
  KnowledgeLevel,
  KNOWLEDGE_LEVELS,
  KNOWLEDGE_LEVEL_LABELS,
  KNOWLEDGE_LEVEL_DESCRIPTIONS,
} from "@/lib/prompts";

const STORAGE_KEY = "greatbooks-knowledge-level";
const DEFAULT_LEVEL: KnowledgeLevel = "casual";

interface KnowledgeToggleProps {
  onChange?: (level: KnowledgeLevel) => void;
}

export default function KnowledgeToggle({ onChange }: KnowledgeToggleProps) {
  const [level, setLevel] = useState<KnowledgeLevel>(DEFAULT_LEVEL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as KnowledgeLevel | null;
    if (stored && KNOWLEDGE_LEVELS.includes(stored)) {
      setLevel(stored);
    }
    setMounted(true);
  }, []);

  function handleSelect(newLevel: KnowledgeLevel) {
    setLevel(newLevel);
    localStorage.setItem(STORAGE_KEY, newLevel);
    onChange?.(newLevel);
  }

  // Avoid hydration mismatch — render a skeleton until mounted
  if (!mounted) {
    return (
      <div
        style={{
          borderTop: "1px solid #2a2820",
          borderBottom: "1px solid #2a2820",
          padding: "20px 0",
        }}
      >
        <div style={{ height: "80px" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        borderTop: "1px solid #2a2820",
        borderBottom: "1px solid #2a2820",
        padding: "20px 0 24px",
        marginBottom: "48px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#8a847a",
          marginBottom: "14px",
        }}
      >
        Your Reading Level
      </p>

      {/* Desktop: horizontal tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
        className="hidden-mobile"
      >
        {KNOWLEDGE_LEVELS.map((lvl) => {
          const active = level === lvl;
          return (
            <button
              key={lvl}
              onClick={() => handleSelect(lvl)}
              style={{
                background: active ? "#1c1b18" : "transparent",
                border: `1px solid ${active ? "#c9a84c" : "#2a2820"}`,
                borderRadius: "4px",
                padding: "12px 16px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                color: active ? "#f0ebe2" : "#8a847a",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#4a4540";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#c0bbb3";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#2a2820";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#8a847a";
                }
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  marginBottom: "4px",
                  color: active ? "#c9a84c" : "inherit",
                }}
              >
                {KNOWLEDGE_LEVEL_LABELS[lvl]}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  lineHeight: 1.4,
                  color: active ? "#8a847a" : "#4a4540",
                }}
              >
                {KNOWLEDGE_LEVEL_DESCRIPTIONS[lvl]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile: select dropdown */}
      <div className="mobile-only">
        <select
          value={level}
          onChange={(e) => handleSelect(e.target.value as KnowledgeLevel)}
          style={{
            width: "100%",
            background: "#1c1b18",
            border: "1px solid #c9a84c",
            borderRadius: "4px",
            padding: "12px 16px",
            color: "#f0ebe2",
            fontFamily: "var(--font-lora), Georgia, serif",
            fontSize: "15px",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {KNOWLEDGE_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {KNOWLEDGE_LEVEL_LABELS[lvl]}
            </option>
          ))}
        </select>
        <div
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "#8a847a",
            fontStyle: "italic",
          }}
        >
          {KNOWLEDGE_LEVEL_DESCRIPTIONS[level]}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_LEVEL };
export type { KnowledgeToggleProps };
