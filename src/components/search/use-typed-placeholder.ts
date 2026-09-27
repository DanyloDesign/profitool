"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** True when the system asks for less motion. The server answers "yes" so nothing flickers. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

/**
 * Types and erases the words one letter at a time for the search placeholder. Runs only while
 * `active`; with prefers-reduced-motion or when inactive it returns null and the caller shows the
 * static placeholder. The state is returned only while active, so nothing is reset through
 * setState in an effect.
 */
export function useTypedPlaceholder(words: string[], active: boolean): string | null {
  const [text, setText] = useState("");
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || reduced || words.length === 0) return;

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex += 1;
        setText(word.slice(0, charIndex));
        const done = charIndex === word.length;
        deleting = done;
        timer = setTimeout(tick, done ? 1700 : 65);
        return;
      }
      charIndex -= 1;
      setText(word.slice(0, charIndex));
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        timer = setTimeout(tick, 350);
        return;
      }
      timer = setTimeout(tick, 30);
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [active, reduced, words]);

  // An empty string between words is not returned: the caller then shows the whole static text
  // instead of a bare prefix.
  return active && !reduced && text.length > 0 ? text : null;
}
