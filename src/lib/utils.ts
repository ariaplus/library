import type { SyntheticEvent } from 'react';
import type { MotionProps } from 'framer-motion';

export function preventBubbling(
  callback?: ((...args: never[]) => unknown) | null,
  noPreventDefault?: boolean
) {
  return (e: SyntheticEvent): void => {
    e.stopPropagation();

    if (!noPreventDefault) e.preventDefault();
    if (callback) callback();
  };
}

export function delayScroll(ms: number) {
  return (): NodeJS.Timeout => setTimeout(() => window.scrollTo(0, 0), ms);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStatsMove(movePixels: number): MotionProps {
  return {
    initial: {
      opacity: 0,
      y: -movePixels
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: movePixels
    },
    transition: {
      type: 'tween',
      duration: 0.15
    }
  };
}

export function getTickers(text: string): string[] {
  // Explicitly declaring array of strings
  const tickers: string[] = [];
  const parts = text.split(/(\$\w+)/g);
  parts.forEach((part) => { // Changed map to forEach since map is unnecessary here
    if (/\$\w+/.test(part)) {
      tickers.push(part.toUpperCase());
    }
  });
  return tickers;
}

export function isPlural(count: number): string {
  return count > 1 ? 's' : '';
}




export function getHashtags(text: string): string[] {
  // array of string
  const hashtags = [];
  const parts = (text).split(/(\$\w+)/g);
  parts.map((part, index) => {
    if (/\$\w+/.test(part)) {
      hashtags.push(part.toUpperCase());
    }
  });
  return hashtags;
}
