import { useState, useEffect, useCallback } from "react";

export function useJobTimer(jobId: string | null) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Reset timer when job changes
    const saved = jobId ? localStorage.getItem(`job_timer_${jobId}`) : null;
    if (saved) {
      const data = JSON.parse(saved);
      setElapsed(data.elapsed || 0);
      if (data.running && data.startTime) {
        setIsRunning(true);
        setStartTime(data.startTime);
        setElapsed(data.elapsed + Math.floor((Date.now() - data.startTime) / 1000));
      } else {
        setIsRunning(false);
        setStartTime(null);
      }
    } else {
      setElapsed(0);
      setIsRunning(false);
      setStartTime(null);
    }
  }, [jobId]);

  useEffect(() => {
    if (!isRunning || !startTime) return;
    const interval = setInterval(() => {
      const saved = jobId ? localStorage.getItem(`job_timer_${jobId}`) : null;
      const base = saved ? JSON.parse(saved).elapsed || 0 : 0;
      setElapsed(base + Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTime, jobId]);

  const start = useCallback(() => {
    const now = Date.now();
    setIsRunning(true);
    setStartTime(now);
    if (jobId) {
      localStorage.setItem(`job_timer_${jobId}`, JSON.stringify({ elapsed, running: true, startTime: now }));
    }
  }, [jobId, elapsed]);

  const pause = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    if (jobId) {
      localStorage.setItem(`job_timer_${jobId}`, JSON.stringify({ elapsed, running: false, startTime: null }));
    }
  }, [jobId, elapsed]);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
    setStartTime(null);
    if (jobId) {
      localStorage.removeItem(`job_timer_${jobId}`);
    }
  }, [jobId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    elapsed,
    isRunning,
    formatted: formatTime(elapsed),
    start,
    pause,
    reset,
  };
}
