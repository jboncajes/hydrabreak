import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { setProfile, setLocation, setLocationDenied, resetUser } from "../features/user/userSlice";
import { updateSettings } from "../features/settings/settingsSlice";
import { fetchWeather, clearWeather } from "../features/weather/weatherSlice";
import { getCurrentPosition } from "../services/WeatherService";
import { ACTIVITY_LEVELS } from "../utils/goalCalculator";

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const settings = useSelector((s) => s.settings);
  const weather = useSelector((s) => s.weather);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      age: user.age ?? 28,
      gender: user.gender ?? "female",
      activity: user.activity ?? "sedentary",
      workStart: settings.workStart,
      workEnd: settings.workEnd,
      intervalMinutes: settings.intervalMinutes,
      defaultDrinkAmount: settings.defaultDrinkAmount,
    },
  });

  const values = watch();
  const [confirmReset, setConfirmReset] = useState(false);
  const [refreshingLoc, setRefreshingLoc] = useState(false);

  const onSubmit = (data) => {
    dispatch(setProfile({
      age: Number(data.age),
      gender: data.gender,
      activity: data.activity,
    }));
    dispatch(updateSettings({
      workStart: data.workStart,
      workEnd: data.workEnd,
      intervalMinutes: Number(data.intervalMinutes),
      defaultDrinkAmount: Number(data.defaultDrinkAmount),
    }));
    toast.success("Saved.");
  };

  const refreshLocation = async () => {
    setRefreshingLoc(true);
    try {
      const coords = await getCurrentPosition();
      dispatch(setLocation({ ...coords, label: "Current location" }));
      const result = await dispatch(fetchWeather(coords)).unwrap();
      toast.success(`${result.city}: ${Math.round(result.temp)}°C`);
    } catch (err) {
      dispatch(setLocationDenied());
      toast.warn("Couldn't get location.");
    } finally {
      setRefreshingLoc(false);
    }
  };

  const wipeAll = () => {
    localStorage.removeItem("hydrabreak_state_v1");
    dispatch(resetUser());
    dispatch(clearWeather());
    toast.info("Profile cleared. Reloading…");
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-32 space-y-6">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Profile">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Age</label>
              <input
                type="number"
                min={18}
                max={100}
                {...register("age", { valueAsNumber: true })}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Gender</label>
              <select {...register("gender")} className="field-input">
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Activity</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_LEVELS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setValue("activity", a.id)}
                  className={`px-3 py-3 rounded-2xl border transition text-sm ${
                    values.activity === a.id
                      ? "bg-hydra-500/30 border-hydra-300 shadow-glow"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  <div className="font-semibold">{a.label}</div>
                  {a.bonus > 0 && <div className="text-xs text-hydra-200/70">+{a.bonus}ml</div>}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Schedule">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Work start</label>
              <input type="time" {...register("workStart")} className="field-input" />
            </div>
            <div>
              <label className="field-label">Work end</label>
              <input type="time" {...register("workEnd")} className="field-input" />
            </div>
          </div>
          <div>
            <label className="field-label">Reminder every (minutes)</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setValue("intervalMinutes", m)}
                  className={`px-2 py-3 rounded-2xl border transition ${
                    Number(values.intervalMinutes) === m
                      ? "bg-hydra-500/30 border-hydra-300 shadow-glow"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Default sip amount (ml)</label>
            <div className="grid grid-cols-4 gap-2">
              {[150, 250, 330, 500].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setValue("defaultDrinkAmount", m)}
                  className={`px-2 py-3 rounded-2xl border transition ${
                    Number(values.defaultDrinkAmount) === m
                      ? "bg-hydra-500/30 border-hydra-300 shadow-glow"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  {m}ml
                </button>
              ))}
            </div>
          </div>
        </Section>

        <button type="submit" className="btn-primary w-full">Save changes</button>
      </form>

      <Section title="Location & weather">
        <div className="space-y-2 text-sm">
          {user.location ? (
            <div>
              <span className="text-hydra-200/70">Coords:</span>{" "}
              <span className="font-mono text-hydra-100">
                {user.location.lat.toFixed(3)}, {user.location.lon.toFixed(3)}
              </span>
            </div>
          ) : (
            <div className="text-hydra-200/70">No location set.</div>
          )}
          {weather.city && (
            <div>
              <span className="text-hydra-200/70">Current:</span>{" "}
              <span className="text-hydra-100">
                {weather.city} · {Math.round(weather.temp)}°C · {Math.round(weather.humidity)}% humidity
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={refreshLocation}
          disabled={refreshingLoc}
          className="btn-ghost mt-3 disabled:opacity-50"
        >
          {refreshingLoc ? "Locating…" : "🔄 Refresh location & weather"}
        </button>
      </Section>

      <Section title="Danger zone" tone="danger">
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-sm text-rose-200/90 hover:text-rose-100 underline-offset-4 hover:underline"
          >
            Clear all data and restart setup
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-hydra-100">This wipes profile, history, and settings. Sure?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmReset(false)} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={wipeAll}
                className="flex-1 px-5 py-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 font-semibold transition active:scale-95"
              >
                Wipe everything
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, tone, children }) {
  return (
    <section
      className={`glass rounded-3xl p-5 space-y-4 ${
        tone === "danger" ? "!border-rose-300/20 !bg-rose-500/5" : ""
      }`}
    >
      <h2
        className={`font-display text-xl font-semibold ${
          tone === "danger" ? "text-rose-100" : ""
        }`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
