"use client";

import { useEffect, useState } from "react";

const STAR_COUNT = 5;

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function openModal() {
    setError(null);
    setIsSubmitted(false);
    setIsOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setIsOpen(false);
    setHoveredStar(0);
  }

  async function submitFeedback() {
    setError(null);

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    if (!feedbackText.trim()) {
      setError("Please share your feedback before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedbackText: feedbackText.trim(),
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
          const data = await response.json();
          message = data.error || message;
        } catch {
          // Use fallback message.
        }
        throw new Error(message);
      }

      setIsSubmitted(true);
      setFeedbackText("");
      setName("");
      setRating(0);
      setHoveredStar(0);

      window.setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send feedback right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        aria-label="Leave feedback"
        style={{
          position: "fixed",
          bottom: "76px",
          left: "24px",
          width: "156px",
          zIndex: 35,
          background: "#1c1b18",
          border: "1px solid #2a2820",
          borderRadius: "3px",
          padding: "8px 14px 9px",
          cursor: "pointer",
          color: "#8a847a",
          fontFamily: "var(--font-cormorant), Georgia, 'Times New Roman', serif",
          fontSize: "14px",
          letterSpacing: "0.04em",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          transition: "border-color 0.2s ease, color 0.2s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
        Leave Feedback
      </button>

      {isOpen && (
        <>
          <div
            onClick={closeModal}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.58)",
              zIndex: 39,
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Leave feedback"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "560px",
              maxWidth: "calc(100vw - 32px)",
              background: "#141412",
              border: "1px solid #2a2820",
              borderRadius: "4px",
              boxShadow: "0 10px 50px rgba(0,0,0,0.7)",
              zIndex: 40,
              padding: "22px 22px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-cormorant), Georgia, 'Times New Roman', serif",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#4a4540",
                }}
              >
                Feedback
              </p>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Close feedback modal"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#4a4540",
                  fontSize: "22px",
                  lineHeight: 1,
                  cursor: isSubmitting ? "default" : "pointer",
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                margin: "0 0 16px",
                fontFamily: "var(--font-lora), Georgia, serif",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#8a847a",
              }}
            >
              What is helping, what is missing, or what feels rough?
            </p>

            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "15px",
                  color: "#f0ebe2",
                }}
              >
                Rating
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                {Array.from({ length: STAR_COUNT }, (_, i) => {
                  const value = i + 1;
                  const isActive = value <= (hoveredStar || rating);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredStar(value)}
                      onMouseLeave={() => setHoveredStar(0)}
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: isActive ? "#c9a84c" : "#4a4540",
                        fontSize: "27px",
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "14px",
                fontFamily: "var(--font-lora), Georgia, serif",
                color: "#8a847a",
              }}
            >
              <span style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                Feedback
              </span>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                placeholder="Share your thoughts…"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: "#0d0d0e",
                  border: "1px solid #2a2820",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  color: "#f0ebe2",
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </label>

            <label
              style={{
                display: "block",
                marginBottom: "14px",
                fontFamily: "var(--font-lora), Georgia, serif",
                color: "#8a847a",
              }}
            >
              <span style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                Name (optional)
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: "#0d0d0e",
                  border: "1px solid #2a2820",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  color: "#f0ebe2",
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "14px",
                  lineHeight: 1.4,
                  outline: "none",
                }}
              />
            </label>

            {(error || isSubmitted) && (
              <p
                style={{
                  margin: "0 0 14px",
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "13px",
                  color: isSubmitted ? "#c9a84c" : "#8a847a",
                  fontStyle: isSubmitted ? "normal" : "italic",
                }}
              >
                {isSubmitted ? "Thank you — your feedback was saved." : error}
              </p>
            )}

            <button
              type="button"
              onClick={submitFeedback}
              disabled={isSubmitting}
              style={{
                border: "1px solid #c9a84c",
                background: isSubmitting ? "#2a2820" : "#c9a84c",
                color: isSubmitting ? "#8a847a" : "#0d0d0e",
                borderRadius: "4px",
                padding: "9px 15px",
                cursor: isSubmitting ? "default" : "pointer",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "15px",
                letterSpacing: "0.04em",
              }}
            >
              {isSubmitting ? "Sending…" : "Send Feedback"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
