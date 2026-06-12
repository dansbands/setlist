import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(totalSeconds: number) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function parseDuration(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const [minutes, seconds = "0"] = trimmed.split(":");
  const parsedMinutes = Number.parseInt(minutes, 10);
  const parsedSeconds = Number.parseInt(seconds, 10);
  if (Number.isNaN(parsedMinutes) || Number.isNaN(parsedSeconds)) return 0;
  const safeMinutes = Math.max(0, parsedMinutes);
  const safeSeconds = Math.max(0, Math.min(parsedSeconds, 59));
  return safeMinutes * 60 + safeSeconds;
}
