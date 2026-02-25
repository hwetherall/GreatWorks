"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "@/lib/types";

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export default function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    const enterTimer = requestAnimationFrame(() => setVisible(true));

    // Begin exit after 3.5s
    const exitTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 400);
    }, 3500);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "32px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible && !leaving ? "0" : "24px"})`,
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.35s ease, opacity 0.35s ease",
        zIndex: 80,
        background: "#1c1b18",
        border: "1px solid rgba(201, 168, 76, 0.4)",
        borderRadius: "4px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        pointerEvents: "none",
        maxWidth: "320px",
        width: "calc(100vw - 48px)",
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>
        {achievement.icon}
      </span>
      <div>
        <p
          style={{
            fontFamily:
              "var(--font-cormorant), Georgia, 'Times New Roman', serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "#c9a84c",
            margin: "0 0 2px",
            letterSpacing: "0.02em",
          }}
        >
          {achievement.title}
        </p>
        <p
          style={{
            fontFamily: "var(--font-lora), Georgia, serif",
            fontSize: "13px",
            color: "#8a847a",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {achievement.description}
        </p>
      </div>
    </div>
  );
}
