import { useEffect, useCallback } from 'react';

type KeyCombo = string[];

export const useKeyboardShortcut = (
  targetKeys: KeyCombo,
  callback: () => void,
  options: { ignoreCase?: boolean } = {}
) => {
  const { ignoreCase = true } = options;

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const currentKey = ignoreCase ? event.key.toLowerCase() : event.key;
      const targetKey = targetKeys[targetKeys.length - 1];
      const isTargetKey = ignoreCase 
        ? currentKey === targetKey.toLowerCase()
        : currentKey === targetKey;

      const isShiftRequired = targetKeys.includes('shift');
      const hasShift = event.shiftKey;

      // Check if all modifier keys are pressed correctly
      const modifiersMatch = isShiftRequired === hasShift;

      if (isTargetKey && modifiersMatch) {
        event.preventDefault();
        callback();
      }
    },
    [targetKeys, callback, ignoreCase]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};