import React from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { weatherIconUrl } from "../services/WeatherService";

export default function WeatherCard({ heatBonus }) {
  const weather = useSelector((s) => s.weather);
  const locationDenied = useSelector((s) => s.user.locationDenied);

  if (weather.status === "loading") {
    return (
      <div className="glass rounded-3xl p-5 animate-pulse">
        <div className="h-3 w-16 bg-white/15 rounded mb-3" />
        <div className="h-6 w-32 bg-white/15 rounded mb-2" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
    );
  }

  if (locationDenied || weather.status === "failed" || weather.temp == null) {
    return (
      <div className="glass rounded-3xl p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60 mb-1">
          Weather
        </div>
        <div className="text-base text-hydra-100">
          Enable location for smart goal adjustments
        </div>
        {weather.error && (
          <div className="text-xs text-rose-200/80 mt-2">{weather.error}</div>
        )}
      </div>
    );
  }

  const isHot = weather.temp > 30;
  const isHumid = weather.humidity > 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden"
    >
      {/* Decorative heat haze */}
      {isHot && (
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />
      )}

      <img
        src={weatherIconUrl(weather.icon)}
        alt={weather.description}
        className="w-16 h-16 -m-2 drop-shadow-lg"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-semibold text-white">
            {Math.round(weather.temp)}°
          </span>
          <span className="text-hydra-200/70 text-sm truncate">
            {weather.city}
          </span>
        </div>
        <div className="text-sm text-hydra-100/80 capitalize truncate">
          {weather.description}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {weather.feelsLike != null && (
            <span className="chip">Feels {Math.round(weather.feelsLike)}°</span>
          )}
          {weather.humidity != null && (
            <span className={`chip ${isHumid ? "!bg-amber-300/20 !border-amber-200/30" : ""}`}>
              {Math.round(weather.humidity)}% humidity
            </span>
          )}
          {heatBonus > 0 && (
            <span className="chip !bg-rose-400/15 !border-rose-300/30 !text-rose-100">
              +{heatBonus}ml goal
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
