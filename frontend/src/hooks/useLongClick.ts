import { useRef } from "react";

export const useLongClick = (
  callback: () => void,
  delay: number = 500,
  moveThreshold = 10 // pixels
) => {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  const start = (e: any) => {
    hasMoved.current = false;

    if ("touches" in e && e.touches.length > 0) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    } else if ("clientX" in e) {
      startX.current = e.clientX;
      startY.current = e.clientY;
    }

    timer.current = setTimeout(() => {
      if (!hasMoved.current) {
        callback();
      }
    }, delay);
  };

  const stop = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const move = (e: any) => {
    let currentX, currentY;
    if ("touches" in e && e.touches.length > 0) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      currentX = e.clientX;
      currentY = e.clientY;
    } else return;

    const dx = Math.abs(currentX - startX.current);
    const dy = Math.abs(currentY - startY.current);
    if (dx > moveThreshold || dy > moveThreshold) {
      hasMoved.current = true;
      stop();
    }
  };

  return { start, stop, move };
};


export const useLongClickHandlers = (
  callback: () => void,
  delay = 500,
  moveThreshold = 10
) => {
  const { start, stop, move } = useLongClick(callback, delay, moveThreshold);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e.nativeEvent),
    onMouseMove: (e: React.MouseEvent) => move(e.nativeEvent),
    onMouseUp: stop,
    onTouchStart: (e: React.TouchEvent) => start(e.nativeEvent),
    onTouchMove: (e: React.TouchEvent) => move(e.nativeEvent),
    onTouchEnd: stop,
  };
};

