import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { techDescription, techMap } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getDevIconClassName(techName: string) {
  // replace dots and spaces
  const normalizedName = techName.toLowerCase().replace(/\s+/g, "").replace(/\./g, "")

  return (techMap[normalizedName] || "devicon-devicon-plain") + " colored";
}

export function getTagDescription(techName: string) {
  // replace dots and spaces
  const normalizedName = techName.toLowerCase().replace(/\s+/g, "").replace(/\./g, "")

  return (techDescription[normalizedName] || `${techName} is a programming technology, that's widely used.`);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}