import React from "react";
import { motion } from "framer-motion";

/**
 * Concentric progress ring + animated water fill inside the circle.
 * Uses SVG for the ring; the water is a layered gradient that rises to `pct`.
 */
export default function ProgressRing({ value, goal, size = 280 }) {
  const pct = Math.min(1, Math.max(0, goal > 0 ? value / goal : 0));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  // Water level: 0% pct → bottom of circle, 100% → top
  const waterY = 100 - pct * 100; // % from top

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Ripple aura when near goal */}
      {pct > 0.85 && (
        <motion.div
          className="absolute inset-0 rounded-full bg-hydra-300/30 blur-xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative"
      >
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </linearGradient>
          <clipPath id="ringClip">
            <circle cx={size / 2} cy={size / 2} r={radius - 4} />
          </clipPath>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />

        {/* Water fill inside the ring */}
        <g clipPath="url(#ringClip)">
          <motion.rect
            x="0"
            width={size}
            fill="url(#waterGrad)"
            initial={false}
            animate={{ y: (waterY / 100) * size }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            height={size}
          />
          {/* Surface wave overlay */}
          <motion.path
            initial={false}
            animate={{
              y: (waterY / 100) * size - 8,
              x: [0, -10, 0, 10, 0],
            }}
            transition={{
              y: { type: "spring", stiffness: 80, damping: 18 },
              x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            d={`M0,8 Q${size / 4},0 ${size / 2},8 T${size},8 L${size},20 L0,20 Z`}
            fill="rgba(186, 230, 253, 0.45)"
          />
        </g>

        {/* Progress arc on top of track */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.5))" }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-xs uppercase tracking-[0.3em] text-hydra-200/70 font-medium">
          Today
        </div>
        <div className="font-display text-5xl font-semibold text-white mt-1 drop-shadow-lg">
          {Math.round(value)}
          <span className="text-hydra-200/70 text-2xl ml-1">ml</span>
        </div>
        <div className="text-sm text-hydra-100/80 mt-1">
          of {goal} ml goal
        </div>
        <div className="mt-2 text-xs font-mono text-hydra-300">
          {Math.round(pct * 100)}%
        </div>
      </div>
    </div>
  );
}
