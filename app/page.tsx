import ReadingContainer from "@/components/ReadingContainer";

export default function Home() {
  return (
    <div
      className="reading-layout"
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0d0e",
      }}
    >
      <main
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          paddingTop: "72px",
          paddingBottom: "120px",
        }}
      >
        {/* Static book header — server-rendered */}
        <header style={{ marginBottom: "48px" }}>
          <p
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#8a847a",
              margin: "0 0 16px",
            }}
          >
            John Milton · 1674
          </p>

          <h1
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "clamp(42px, 8vw, 72px)",
              fontWeight: 600,
              lineHeight: 1.05,
              color: "#f0ebe2",
              letterSpacing: "-0.01em",
              margin: "0 0 8px",
            }}
          >
            Paradise Lost
          </h1>

          <h2
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "clamp(20px, 4vw, 28px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#c9a84c",
              margin: "0 0 32px",
              letterSpacing: "0.01em",
            }}
          >
            Book I
          </h2>

          <p
            style={{
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#8a847a",
              maxWidth: "560px",
              margin: 0,
            }}
          >
            Select any word, phrase, or line to get contextual enrichment
            calibrated to your reading level.
          </p>
        </header>

        {/* Interactive reading experience */}
        <ReadingContainer />
      </main>
    </div>
  );
}
