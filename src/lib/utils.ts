import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "N/A";
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "FAVORITE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "TO_TRY":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "MADE_BEFORE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "FAVORITE": return "Favorite";
    case "TO_TRY": return "To Try";
    case "MADE_BEFORE": return "Made Before";
    default: return "No Status";
  }
}
