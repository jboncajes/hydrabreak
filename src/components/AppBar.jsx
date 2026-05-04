import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AppBar() {
  const { pathname } = useLocation();
  const onSettings = pathname.startsWith("/settings");

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-hydra-950/40 border-b border-white/10">
      <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-hydra-300 to-hydra-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition">
            <span className="text-lg">💧</span>
          </div>
          <div>
            <div className="font-display text-xl font-semibold leading-none tracking-tight">
              Hydra<span className="italic text-hydra-300">Break</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-hydra-200/60 mt-0.5">
              Smart Hydration
            </div>
          </div>
        </Link>

        <Link
          to={onSettings ? "/" : "/settings"}
          className="btn-ghost !px-3 !py-2 text-sm"
          aria-label={onSettings ? "Back to dashboard" : "Open settings"}
        >
          {onSettings ? "← Back" : "⚙ Settings"}
        </Link>
      </div>
    </header>
  );
}