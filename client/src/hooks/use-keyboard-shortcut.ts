import { useEffect } from "react";

type KeyCombination = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export function useKeyboardShortcut(
  shortcut: KeyCombination,
  callback: (e: KeyboardEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      const modifierRequired = Boolean(shortcut.metaKey || shortcut.ctrlKey);
      const modifierPressed = event.metaKey || event.ctrlKey;

      // Ignore single character shortcuts when typing inside form input elements
      if (isInput && !modifierPressed) {
        return;
      }

      const matchKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchShift = shortcut.shiftKey !== undefined ? event.shiftKey === shortcut.shiftKey : !event.shiftKey;
      const matchAlt = shortcut.altKey !== undefined ? event.altKey === shortcut.altKey : !event.altKey;

      if (matchKey && (modifierRequired ? modifierPressed : !modifierPressed) && matchShift && matchAlt) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, callback, enabled]);
}
