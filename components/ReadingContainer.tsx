"use client";

import { useState, useEffect, useCallback } from "react";
import { KnowledgeLevel, KNOWLEDGE_LEVELS } from "@/lib/prompts";
import type { Achievement } from "@/lib/types";
import KnowledgeToggle from "./KnowledgeToggle";
import Reader from "./Reader";
import FlipReader from "./FlipReader";
import AnnotationCard from "./AnnotationCard";
import Primer from "./Primer";
import Chat from "./Chat";
import ProgressBar from "./ProgressBar";
import AnnotationHistory from "./AnnotationHistory";
import AchievementToast from "./AchievementToast";

const STORAGE_KEY = "greatbooks-knowledge-level";
const READ_MODE_STORAGE_KEY = "greatbooks-read-mode";
const DEFAULT_LEVEL: KnowledgeLevel = "noob";
type ReadMode = "scroll" | "flip";

interface AnnotationState {
  passage: string;
  lineRange: string;
  lines: { start: number; end: number };
}

export default function ReadingContainer() {
  const [level, setLevel] = useState<KnowledgeLevel>(DEFAULT_LEVEL);
  const [readMode, setReadMode] = useState<ReadMode>("scroll");
  const [annotation, setAnnotation] = useState<AnnotationState | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [annotationVersion, setAnnotationVersion] = useState(0);
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as KnowledgeLevel | null;
    if (stored && KNOWLEDGE_LEVELS.includes(stored)) {
      setLevel(stored);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(READ_MODE_STORAGE_KEY) as ReadMode | null;
    if (stored === "scroll" || stored === "flip") {
      setReadMode(stored);
    }
  }, []);

  useEffect(() => {
    fetch("/api/section-progress")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Array<{ section_id: string }>) => {
        setCompletedSections(new Set(rows.map((r) => r.section_id)));
      })
      .catch(() => {});
  }, []);

  function handleSectionComplete(sectionId: string, achievements: Achievement[] = []) {
    setCompletedSections((prev) => new Set([...prev, sectionId]));
    if (achievements.length > 0) {
      setToastQueue((prev) => [...prev, ...achievements]);
    }
  }

  const handleAnnotationComplete = useCallback((achievements: Achievement[]) => {
    setAnnotationVersion((v) => v + 1);
    if (achievements.length > 0) {
      setToastQueue((prev) => [...prev, ...achievements]);
    }
  }, []);

  const handleSectionVisible = useCallback((sectionId: string) => {
    setCurrentSectionId(sectionId);
  }, []);

  function dismissToast() {
    setToastQueue((prev) => prev.slice(1));
  }

  function handleLevelChange(newLevel: KnowledgeLevel) {
    setLevel(newLevel);
    localStorage.setItem(STORAGE_KEY, newLevel);
    setAnnotation(null); // close any open annotation when level changes
  }

  function handleReadModeChange(newMode: ReadMode) {
    setReadMode(newMode);
    localStorage.setItem(READ_MODE_STORAGE_KEY, newMode);
    setAnnotation(null); // close annotation when switching modes
  }

  function handleAnnotateRequest(
    passage: string,
    lineRange: string,
    lines: { start: number; end: number }
  ) {
    setAnnotation({ passage, lineRange, lines });
  }

  function handleAnnotationClose() {
    setAnnotation(null);
  }

  return (
    <>
      <ProgressBar
        completedSections={completedSections}
        currentSectionId={currentSectionId}
      />

      <KnowledgeToggle value={level} onChange={handleLevelChange} />

      {/* Scroll / Flip mode toggle */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 32,
          fontFamily: "var(--font-cormorant), Georgia, serif",
        }}
      >
        <button
          onClick={() => handleReadModeChange("scroll")}
          style={{
            background: readMode === "scroll" ? "#1c1b18" : "transparent",
            border: `1px solid ${readMode === "scroll" ? "#c9a84c" : "#2a2820"}`,
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            color: readMode === "scroll" ? "#c9a84c" : "#8a847a",
            fontSize: 14,
          }}
        >
          Scroll
        </button>
        <button
          onClick={() => handleReadModeChange("flip")}
          style={{
            background: readMode === "flip" ? "#1c1b18" : "transparent",
            border: `1px solid ${readMode === "flip" ? "#c9a84c" : "#2a2820"}`,
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            color: readMode === "flip" ? "#c9a84c" : "#8a847a",
            fontSize: 14,
          }}
        >
          Flip
        </button>
      </div>

      <Primer level={level} />

      {readMode === "scroll" ? (
        <Reader
          level={level}
          activeLines={annotation?.lines ?? null}
          onAnnotateRequest={handleAnnotateRequest}
          completedSections={completedSections}
          onSectionComplete={handleSectionComplete}
          onSectionVisible={handleSectionVisible}
        />
      ) : (
        <FlipReader
          level={level}
          completedSections={completedSections}
          onSectionComplete={handleSectionComplete}
        />
      )}

      {annotation && (
        <AnnotationCard
          key={`${annotation.passage}-${level}`}
          passage={annotation.passage}
          lineRange={annotation.lineRange}
          level={level}
          onClose={handleAnnotationClose}
          onComplete={handleAnnotationComplete}
        />
      )}

      <Chat level={level} />

      <AnnotationHistory annotationVersion={annotationVersion} />

      {toastQueue.length > 0 && (
        <AchievementToast
          key={`${toastQueue[0].id}-${annotationVersion}`}
          achievement={toastQueue[0]}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}
