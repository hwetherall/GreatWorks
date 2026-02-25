import Reader from "@/components/Reader";
import KnowledgeToggle from "@/components/KnowledgeToggle";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0d0e",
        padding: "0 16px",
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
        {/* Book header */}
        <header style={{ marginBottom: "48px" }}>
          <p
            style={{
              fontFamily:
                "var(--font-cormorant), Georgia, 'Times New Roman', serif",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#8a847a",
              marginBottom: "16px",
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
            An epic poem in twelve books. Set your reading level below — it
            shapes the depth and tone of all contextual enrichment.
          </p>
        </header>

        {/* Knowledge level selector */}
        <KnowledgeToggle />

        {/* Poem text */}
        <Reader />
      </main>
    </div>
  );
}
