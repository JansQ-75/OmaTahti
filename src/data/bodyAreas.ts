import type { BodyArea } from "@/types";

export interface BodyAreaInfo {
  id: BodyArea;
  label: string;
  available: boolean;
}

// Only the ankle is built in the demo; the others are placeholders for later programs.
export const BODY_AREAS: BodyAreaInfo[] = [
  { id: "ankle", label: "Nilkka", available: true },
  { id: "knee", label: "Polvi", available: false },
  { id: "shoulder", label: "Olkapää", available: false },
  { id: "hip", label: "Lonkka", available: false },
  { id: "wrist", label: "Ranne ja kyynärvarsi", available: false },
  { id: "back", label: "Selkä", available: false },
];

export const bodyAreaLabel = (id: BodyArea) => BODY_AREAS.find((b) => b.id === id)?.label ?? id;
