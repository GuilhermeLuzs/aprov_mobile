import { useEffect, useState } from 'react';
import type { MauricioMood } from '../../components';

const LINE_DURATION_MS = 6000;
const TALKING_DURATION_MS = 1500;

export function useMauricioLines(lines: string[]): { text: string; mood: MauricioMood } {
  const [index, setIndex] = useState(0);
  const [talking, setTalking] = useState(true);
  const linesKey = lines.join('\n');
  const count = lines.length;

  useEffect(() => {
    setIndex(0);
    if (count < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), LINE_DURATION_MS);
    return () => clearInterval(timer);
  }, [linesKey, count]);

  const text = lines[index % count];

  useEffect(() => {
    setTalking(true);
    const timer = setTimeout(() => setTalking(false), TALKING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [text]);

  return { text, mood: talking ? 'talking' : 'neutral' };
}
