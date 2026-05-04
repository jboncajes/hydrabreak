import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setProfile,
  setLocation,
  setLocationDenied,
  completeSetup,
} from "../features/user/userSlice";
import { fetchWeather } from "../features/weather/weatherSlice";
import { updateSettings } from "../features/settings/settingsSlice";
import { getCurrentPosition } from "../services/WeatherService";
import { ACTIVITY_LEVELS, calculateGoal, formatLitres } from "../utils/goalCalculator";

const TOTAL_STEPS = 4;

export default function SetupWizard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const weather = useSelector((s) => s.weather);
  const [step, setStep] = useState(1);
  const [locStatus, setLocStatus] = useState("idle"); // idle | loading | granted | denied

  const { register, handleSubmit, watch, setValue, formState } = useForm({
    defaultValues: {
      age: 28,
      gender: "female",
      activity: "sedentary",
      workStart: "08:00",
      workEnd: "17:00",
      intervalMinutes: 60,
    },
    mode: "onChange",
  });

  const values = watch();

  const goPrev = () => setStep((s) => Math.max(1, s - 1));
  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));

  const onStep1Submit = (data) => {
    dispatch(setProfile({
      age: Number(data.age),
      gender: data.gender,
      activity: data.activity,
    }));
    goNext();
  };

  const onStep2Submit = (data) => {
    dispatch(updateSettings({
      workStart: data.workStart,
      workEnd: data.workEnd,
      intervalMinutes: Number(data.intervalMinutes),
    }));
    goNext();
  };

  const requestLocation = async () => {
    setLocStatus("loading");
    try {
      const coords = await getCurrentPosition();
      dispatch(setLocation({ ...coords, label: "Current location" }));
      const result = await dispatch(fetchWeather(coords)).unwrap();
      setLocStatus("granted");
      toast.success(`Weather found: ${result.city}, ${Math.round(result.temp)}°C`);
      setTimeout(() => goNext(), 600);
    } catch (err) {
      console.warn("Location/weather failed:", err);
      dispatch(setLocationDenied());
      setLocStatus("denied");
      toast.warn("No location — using base goal. You can enable later in Settings.");
    }
  };

  const skipLocation = () => {
    dispatch(setLocationDenied());
    setLocStatus("denied");
    goNext();
  };

  const finish = () => {
    dispatch(completeSetup());
    toast.success("You're all set! 💧");
  };

  // Live preview of goal — updates as user fills the form
  const previewGoal = calculateGoal({
    user: {
      age: Number(values.age) || user.age,
      gender: values.gender || user.gender,
      activity: values.activity || user.activity,
    },
    weather: weather.temp != null ? weather : null,
  });

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="max-w-md w-full mx-auto px-5 py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-8 mt-4 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-hydra-300 to-hydra-600 flex items-center justify-center shadow-glow">
              💧
            </div>
            <span className="font-display text-2xl font-semibold tracking-tight">
              Hydra<span className="italic text-hydra-300">Break</span>
            </span>
          </div>
          <p className="text-sm text-hydra-200/70 max-w-xs mx-auto">
            A 30-second setup. We'll calculate a goal that adapts to your weather.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i < step ? "bg-hydra-300" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {step === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
                <h2 className="font-display text-2xl font-semibold">Tell us about you</h2>

                <div>
                  <label className="field-label">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    {...register("age", { required: true, min: 18, max: 100, valueAsNumber: true })}
                    className="field-input"
                  />
                </div>

                <div>
                  <label className="field-label">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "female", label: "Female" },
                      { id: "male", label: "Male" },
                      { id: "other", label: "Other" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setValue("gender", g.id, { shouldValidate: true })}
                        className={`px-4 py-3 rounded-2xl border transition ${
                          values.gender === g.id
                            ? "bg-hydra-500/30 border-hydra-300 text-white shadow-glow"
                            : "bg-white/5 border-white/15 text-hydra-100/80 hover:bg-white/10"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Activity level</label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setValue("activity", a.id, { shouldValidate: true })}
                        className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                          values.activity === a.id
                            ? "bg-hydra-500/30 border-hydra-300 shadow-glow"
                            : "bg-white/5 border-white/15 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{a.label}</div>
                            <div className="text-xs text-hydra-200/70">{a.hint}</div>
                          </div>
                          {a.bonus > 0 && (
                            <span className="chip">+{a.bonus}ml</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <GoalPreview goal={previewGoal.goal} note="estimate before weather" />

                <button type="submit" className="btn-primary w-full">
                  Continue →
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit(onStep2Submit)} className="space-y-6">
                <h2 className="font-display text-2xl font-semibold">Your work day</h2>
                <p className="text-sm text-hydra-200/70">
                  We'll only nudge you during these hours.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Start</label>
                    <input type="time" {...register("workStart")} className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">End</label>
                    <input type="time" {...register("workEnd")} className="field-input" />
                  </div>
                </div>

                <div>
                  <label className="field-label">Reminder every</label>
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

                <div className="flex gap-2">
                  <button type="button" onClick={goPrev} className="btn-ghost flex-1">
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Continue →
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold">Smart weather sync</h2>
                <p className="text-sm text-hydra-200/70">
                  Allow location so we can adjust your goal when it's hot or humid. We don't store or share it.
                </p>

                <div className="glass rounded-3xl p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🌡️</span>
                    <div className="text-sm">
                      <div className="font-semibold mb-0.5">Hot day → +500ml</div>
                      <div className="text-hydra-200/70 text-xs">Above 30°C, your goal scales up automatically.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💨</span>
                    <div className="text-sm">
                      <div className="font-semibold mb-0.5">High humidity → +250ml</div>
                      <div className="text-hydra-200/70 text-xs">Above 70% (hi, Philippines!) we add a bit more.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔁</span>
                    <div className="text-sm">
                      <div className="font-semibold mb-0.5">Refreshes every 30 min</div>
                      <div className="text-hydra-200/70 text-xs">Goal stays current as conditions change.</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={goPrev} className="btn-ghost flex-1">← Back</button>
                  <button
                    onClick={requestLocation}
                    disabled={locStatus === "loading"}
                    className="btn-primary flex-1 disabled:opacity-60"
                  >
                    {locStatus === "loading" ? "Locating…" : "Allow location"}
                  </button>
                </div>
                <button onClick={skipLocation} className="block mx-auto text-xs text-hydra-200/60 hover:text-hydra-100">
                  Skip for now
                </button>
              </div>
            )}

            {step === 4 && (
              <FinishStep
                breakdown={previewGoal.breakdown}
                goal={previewGoal.goal}
                onPrev={goPrev}
                onFinish={finish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function GoalPreview({ goal, note }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60">Your goal</div>
        <div className="font-display text-2xl font-semibold mt-0.5">{formatLitres(goal)}</div>
      </div>
      <span className="text-xs text-hydra-200/60">{note}</span>
    </div>
  );
}

function FinishStep({ breakdown, goal, onPrev, onFinish }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Your daily goal</h2>
        <p className="text-sm text-hydra-200/70">Personalized for you, right now.</p>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="glass-strong rounded-3xl p-6 text-center relative overflow-hidden"
      >
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-hydra-300/20 rounded-full blur-3xl" />
        <div className="text-xs uppercase tracking-[0.3em] text-hydra-200/70">Daily target</div>
        <div className="font-display text-6xl font-semibold mt-2 mb-1 text-white">
          {formatLitres(goal)}
        </div>
        <div className="text-sm text-hydra-200/70">{goal} ml</div>
      </motion.div>

      <div className="space-y-1.5">
        <div className="text-xs uppercase tracking-[0.2em] text-hydra-200/60 mb-2">How we got here</div>
        {breakdown.map((b) => (
          <div
            key={b.key}
            className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-white/5 border border-white/10"
          >
            <span className="text-hydra-100/90">{b.label}</span>
            <span className="font-mono text-hydra-200">+{b.amount}ml</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onPrev} className="btn-ghost flex-1">← Back</button>
        <button onClick={onFinish} className="btn-primary flex-1">
          Start hydrating 💧
        </button>
      </div>
    </div>
  );
}