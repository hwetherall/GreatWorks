"use client";

import { useState, useEffect } from "react";
import { KnowledgeLevel, KNOWLEDGE_LEVELS } from "@/lib/prompts";
import KnowledgeToggle from "./KnowledgeToggle";
import Reader from "./Reader";
import AnnotationCard from "./AnnotationCard";

const STORAGE_KEY = "greatbooks-knowledge-level";
const DEFAULT_LEVEL: KnowledgeLevel = "casual";

interface AnnotationState {
  passage: string;
  lineRange: string;
  lines: { start: number; end: number };
}

export default function ReadingContainer() {
  const [level, setLevel] = useState<KnowledgeLevel>(DEFAULT_LEVEL);
  const [annotation, setAnnotation] = useState<AnnotationState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as KnowledgeLevel | null;
    if (stored && KNOWLEDGE_LEVELS.includes(stored)) {
      setLevel(stored);
    }
  }, []);

  function handleLevelChange(newLevel: KnowledgeLevel) {
    setLevel(newLevel);
    localStorage.setItem(STORAGE_KEY, newLevel);
    setAnnotation(null); // close any open annotation when level changes
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
      <KnowledgeToggle value={level} onChange={handleLevelChange} />

      <Reader
        level={level}
        activeLines={annotation?.lines ?? null}
        onAnnotateRequest={handleAnnotateRequest}
      />

      {annotation && (
        <AnnotationCard
          key={`${annotation.passage}-${level}`}
          passage={annotation.passage}
          lineRange={annotation.lineRange}
          level={level}
          onClose={handleAnnotationClose}
        />
      )}
    </>
  );
}
