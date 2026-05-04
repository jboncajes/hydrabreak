import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

/**
 * Computes the time of the next reminder based on lastDrink + interval,
 * clamped to within work hours. Returns { nextAt, msRemaining, label, withinWorkHours }.
 */
export default function useNextReminder() {
  const interval = useSelector((s) => s.settings.intervalMinutes);
  const workStart = useSelector((s) => s.settings.workStart);
  const workEnd = useSelector((s) => s.settings.workEnd);
  const lastDrink = useSelector((s) => s.intake.lastDrink);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const base = lastDrink || now;
  const nextAt = base + interval * 60 * 1000;
  const msRemaining = Math.max(0, nextAt - now);

  const startMin = toMinutes(workStart);
  const endMin = toMinutes(workEnd);
  const nowDate = new Date(now);
  const nowMin = nowDate.getHours() * 60 + nowDate.getMinutes();
  const withinWorkHours = nowMin >= startMin && nowMin <= endMin;

  return {
    nextAt,
    msRemaining,
    withinWorkHours,
    label: formatRemaining(msRemaining),
  };
}

function toMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatRemaining(ms) {
  if (ms <= 0) return "now";
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  if (m < 60) return `${m}m ${s.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}
