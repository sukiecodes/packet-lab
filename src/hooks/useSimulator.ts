import { useState, useEffect, useCallback } from 'react';
import { Simulator, type SimulatorSnapshot } from '../engine/Simulator';

export function useSimulator(tickIntervalMs: number = 50) {
  const [simulator, setSimulator] = useState<Simulator>(() => new Simulator());
  const [snapshot, setSnapshot] = useState<SimulatorSnapshot>(() =>
    simulator.getSnapshot()
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const updateSnapshot = useCallback(() => {
    setSnapshot(simulator.getSnapshot());
  }, [simulator]);

  // Tick loop driven by interval
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      simulator.tick();
      updateSnapshot();
    }, tickIntervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, tickIntervalMs, updateSnapshot, simulator]);

  // Actions
  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const step = useCallback(() => {
    simulator.tick();
    updateSnapshot();
  }, [simulator, updateSnapshot]);

  const reset = useCallback(() => {
    setIsRunning(false);
    const nextSimulator = new Simulator();
    setSimulator(nextSimulator);
    setSnapshot(nextSimulator.getSnapshot());
  }, []);

  const appOpenClient = useCallback(() => {
    simulator.appOpenClient();
    updateSnapshot();
  }, [simulator, updateSnapshot]);

  const appCloseClient = useCallback(() => {
    simulator.appCloseClient();
    updateSnapshot();
  }, [simulator, updateSnapshot]);

  const dropPacket = useCallback((id: string) => {
    simulator.dropPacket(id);
    updateSnapshot();
  }, [simulator, updateSnapshot]);

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