import { book1 } from "@/lib/paradise-lost";

export default function Reader() {
  const { lines } = book1;

  return (
    <article
      style={{
        fontFamily: "var(--font-lora), Georgia, 'Times New Roman', serif",
      }}
    >
      {lines.map((line) => {
        const showNumber = line.number % 5 === 0 || line.number === 1;
        return (
          <div
            key={line.number}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0",
              lineHeight: "1.85",
              minHeight: "1.85em",
            }}
          >
            {/* Line number column */}
            <span
              aria-label={`Line ${line.number}`}
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
              }}
            >
              {line.number}
            </span>

            {/* Poem line */}
            <span
              data-line={line.number}
              style={{
                fontSize: "18px",
                color: "#f0ebe2",
                letterSpacing: "0.01em",
              }}
            >
              {line.text}
            </span>
          </div>
        );
      })}
    </article>
  );
}
