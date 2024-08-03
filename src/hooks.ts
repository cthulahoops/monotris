import { useEffect, useState } from "react";

export function useGameClock(tickIntervalMs: number = 1000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, tickIntervalMs);
    return () => clearInterval(timer);
  }, []);
  return tick;
}

export function useEventListener(eventName: string, handler: any) {
  useEffect(() => {
    document.addEventListener(eventName, handler);
    return () => {
      document.removeEventListener(eventName, handler);
    };
  }, []);
}
