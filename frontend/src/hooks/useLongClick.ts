import { useState } from "react";

export const useLongClick = (callback: () => void, delay: number = 500) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const start = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(
      setTimeout(() => {
        callback();
      }, delay)
    );
  };

  const stop = () => {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return { start, stop };
};
