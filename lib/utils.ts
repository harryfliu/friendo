import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCloseness(closeness: number): string {
  return closeness.toFixed(1);
}

export function getClosenessColor(closeness: number): string {
  if (closeness < 2) return 'text-blue-500';
  if (closeness < 4) return 'text-teal-500';
  if (closeness < 6) return 'text-green-500';
  if (closeness < 7.5) return 'text-yellow-500';
  if (closeness < 9) return 'text-orange-500';
  return 'text-red-500';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
