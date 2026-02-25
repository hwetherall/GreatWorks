"use client";

import { BOOK_1_SECTIONS } from "@/lib/sections";

interface ProgressBarProps {
  completedSections: Set<string>;
  currentSectionId: string | null;
}

export default function ProgressBar({
  completedSections,
  currentSectionId,
}: ProgressBarProps) {
  const total = BOOK_1_SECTIONS.length;
  const fillPercent = (completedSections.size / total) * 100;

  const currentSection = currentSectionId
    ? BOOK_1_SECTIONS.find((s) => s.id === currentSectionId)
    : null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      {/* Current section label — hidden on mobile via CSS class */}
      <div className="progress-label-desktop">
        {currentSection && (
          <p
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#4a4540",
              textAlign: "center",
              margin: 0,
              padding: "6px 16px 3px",
            }}
          >
            Reading: {currentSection.romanNumeral} — {currentSection.title}
          </p>
        )}
      </div>

      {/* Bar track */}
      <div
        style={{
          height: "2px",
          background: "#1a1916",
          position: "relative",
        }}
      >
        {/* Completed fill */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${fillPercent}%`,
            background: "rgba(201, 168, 76, 0.6)",
            transition: "width 0.6s ease",
          }}
        />

        {/* Section marker dots */}
        {BOOK_1_SECTIONS.map((section, index) => {
          const isCompleted = completedSections.has(section.id);
          // Evenly spaced along the bar, inset slightly from edges
          const dotPercent =
            total > 1 ? (index / (total - 1)) * 100 : 50;

          return (
            <div
              key={section.id}
              title={`${section.romanNumeral} — ${section.title}${isCompleted ? " ✓" : ""}`}
              style={{
                position: "absolute",
                top: "50%",
                left: `${dotPercent}%`,
                transform: "translate(-50%, -50%)",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: isCompleted
                  ? "rgba(201, 168, 76, 0.8)"
                  : "#2a2820",
                transition: "background 0.4s ease",
                pointerEvents: "auto",
                cursor: "default",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
