import { useState, useEffect, useRef, useCallback } from 'react';
import { Simulator, type SimulatorSnapshot } from '../engine/Simulator';

export function useSimulator(tickIntervalMs: number = 50) {
  const simulatorRef = useRef<Simulator>(new Simulator());
  const [snapshot, setSnapshot] = useState<SimulatorSnapshot>(() =>
    simulatorRef.current.getSnapshot()
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const updateSnapshot = useCallback(() => {
    setSnapshot(simulatorRef.current.getSnapshot());
  }, []);

  // Tick loop driven by interval
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      simulatorRef.current.tick();
      updateSnapshot();
    }, tickIntervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, tickIntervalMs, updateSnapshot]);

  // Actions
  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const step = useCallback(() => {
    simulatorRef.current.tick();
    updateSnapshot();
  }, [updateSnapshot]);

  const reset = useCallback(() => {
    setIsRunning(false);
    simulatorRef.current = new Simulator();
    updateSnapshot();
  }, [updateSnapshot]);

  const appOpenClient = useCallback(() => {
    simulatorRef.current.appOpenClient();
    updateSnapshot();
  }, [updateSnapshot]);

  const appCloseClient = useCallback(() => {
    simulatorRef.current.appCloseClient();
    updateSnapshot();
  }, [updateSnapshot]);

  const dropPacket = useCallback((id: string) => {
    simulatorRef.current.dropPacket(id);
    updateSnapshot();
  }, [updateSnapshot]);

  return {
    snapshot,
    isRunning,
    start,
    pause,
    step,
    reset,
    appOpenClient,
    appCloseClient,
    dropPacket,
  };
}