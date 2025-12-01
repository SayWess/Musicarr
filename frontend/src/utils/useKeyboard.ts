import { useCallback, useRef, useLayoutEffect, useState, useEffect } from "react";

export const useShortcut = (
  shortcut: string,
  callback: (e: KeyboardEvent) => void,
  options: { disableTextInputs?: boolean } = { disableTextInputs: true }
) => {
  const callbackRef = useRef(callback);
  const [keyCombo, setKeyCombo] = useState<string[]>([]);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
    //   const isTextInput =
    //     event.target instanceof HTMLTextAreaElement ||
    //     (event.target instanceof HTMLInputElement && (!event.target.type || event.target.type === "text")) ||
    //     (event.target as HTMLElement).isContentEditable;

      const modifierMap = {
        Control: event.ctrlKey,
        Alt: event.altKey,
        Command: event.metaKey,
        Shift: event.shiftKey,
      };

      if (event.repeat) return;

    //   if (options.disableTextInputs && isTextInput) return;

      // --- Combined modifier shortcuts (Control+D)
      if (shortcut.includes("+")) {
        const keys = shortcut.split("+");

        // Modifier-based shortcut (e.g. "Control+D")
        if (Object.keys(modifierMap).includes(keys[0])) {
          const finalKey = keys[keys.length - 1];

          if (
            keys.slice(0, -1).every((k) => k in modifierMap && modifierMap[k as keyof typeof modifierMap]) &&
            finalKey.toLowerCase() === event.key.toLowerCase()
          ) {
            event.preventDefault();
            event.stopPropagation();
            return callbackRef.current(event);
          }
        }

        // Sequence shortcut (e.g. "Shift+h+a")
        const nextNeeded = keys[keyCombo.length];

        if (nextNeeded && nextNeeded.toLowerCase() === event.key.toLowerCase()) {
          if (keyCombo.length === keys.length - 1) {
            callbackRef.current(event);
            return setKeyCombo([]);
          }
          return setKeyCombo((prev) => [...prev, event.key]);
        }

        if (keyCombo.length > 0) return setKeyCombo([]);
      }

      // --- Single-key shortcut
      if (shortcut.toLowerCase() === event.key.toLowerCase()) {
        event.preventDefault();
        event.stopPropagation();
        return callbackRef.current(event);
      }
    },
    [shortcut, keyCombo, options.disableTextInputs]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null; // hook doesn't expose anything
};
