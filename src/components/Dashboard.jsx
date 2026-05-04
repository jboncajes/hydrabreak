import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ProgressRing from "./ProgressRing";
import WeatherCard from "./WeatherCard";
import DrinkButton from "./DrinkButton";
import useDynamicGoal from "../hooks/useDynamicGoal";
import useWeatherRefresh from "../hooks/useWeatherRefresh";
import useNextReminder from "../hooks/useNextReminder";
import { undoLast, resetDay } from "../features/intake/intakeSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const today = useSelector((s) => s.intake.today);
  const log = useSelector((s) => s.intake.log);

  // Keeps goal in sync with profile + weather
  const { goal, breakdown } = useDynamicGoal();
  // Refreshes weather every 30 min
  useWeatherRefresh();
  // Next reminder countdown
  const reminder = useNextReminder();

  // Detect goal jumps (e.g. weather changed) and surprise the user
  const prevGoalRef = useRef(goal);
  const [goalChange, setGoalChange] = useState(null);
  useEffect(() => {
    if (prevGoalRef.current && prevGoalRef.current !== goal) {
      const diff = goal - prevGoalRef.current;
      if (Math.abs(diff) >= 100) {
        const message = diff > 0
          ? `Hot day detected! Goal +${diff}ml`
          : `Cooler now — goal ${diff}ml`;
        setGoalChange(message);
        toast.info(message);
        setTimeout(() => setGoalChange(null), 4000);
      }
    }
    prevGoalRef.current = goal;
  }, [goal]);

  const heatBonus = breakdown
    .filter((b) => ["heat", "warm", "humidity"].includes(b.key))
    .reduce((sum, b) => sum + b.amount, 0);

  const [showReset, setShowReset] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-32 space-y-6">
      <WeatherCard heatBonus={heatBonus} />

      {/* Big progress ring */}
      <div className="relative flex justify-center pt-2">
        <ProgressRing value={today} goal={goal} />
        <AnimatePresence>
          {goalChange && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 chip !bg-rose-400/20 !border-rose-300/40 !text-rose-100 whitespace-nowrap"
            >
              ⚡ {goalChange}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drink button */}
      <div className="flex justify-center pt-2">
        <DrinkButton />
      </div>

      {/* Reminder + last drink */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-3xl p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60">Next reminder</div>
          <div className="font-display text-2xl font-semibold mt-1">
            {reminder.withinWorkHours ? reminder.label : "Off-hours"}
          </div>
          <div className="text-xs text-hydra-200/60 mt-0.5">
            {reminder.withinWorkHours ? "in work hours" : "reminders paused"}
          </div>
        </div>
        <div className="glass rounded-3xl p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60">Logged today</div>
          <div className="font-display text-2xl font-semibold mt-1">{log.length}</div>
          <div className="text-xs text-hydra-200/60 mt-0.5">
            {log.length === 0 ? "no sips yet" : "drink entries"}
          </div>
        </div>
      </div>

      {/* Goal breakdown */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60">Goal breakdown</div>
            <div className="text-sm text-hydra-100/80">Why your goal is {goal} ml</div>
          </div>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((b) => (
            <div
              key={b.key}
              className="flex items-center justify-between text-sm py-1.5 px-3 rounded-xl bg-white/5"
            >
              <span className="text-hydra-100/90">{b.label}</span>
              <span className="font-mono text-hydra-300">+{b.amount}ml</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent log */}
      {log.length > 0 && (
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60">Recent</div>
            <button
              onClick={() => {
                dispatch(undoLast());
                toast.info("Undid last sip");
              }}
              className="text-xs text-hydra-300 hover:text-hydra-100 underline-offset-4 hover:underline"
            >
              Undo last
            </button>
          </div>
          <div className="space-y-1">
            {log.slice(0, 6).map((entry) => (
              <div
                key={entry.ts}
                className="flex items-center justify-between text-sm py-1.5 px-3 rounded-xl bg-white/5"
              >
                <span className="text-hydra-100/90">{formatTime(entry.ts)}</span>
                <span className="font-mono text-hydra-200">{entry.amount}ml</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset day */}
      <div className="text-center pt-4">
        <button
          onClick={() => setShowReset(true)}
          className="text-xs text-hydra-200/60 hover:text-rose-200 underline-offset-4 hover:underline"
        >
          Reset today
        </button>
      </div>

      <AnimatePresence>
        {showReset && (
          <ResetModal
            onCancel={() => setShowReset(false)}
            onConfirm={() => {
              dispatch(resetDay());
              setShowReset(false);
              toast.info("Day reset.");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function ResetModal({ onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-hydra-950/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-3xl p-6 max-w-sm w-full"
      >
        <h3 className="font-display text-2xl font-semibold mb-2">Reset today?</h3>
        <p className="text-sm text-hydra-200/80 mb-5">
          This clears all sips logged today. Yesterday's history stays.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 px-5 py-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 font-semibold transition active:scale-95"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
