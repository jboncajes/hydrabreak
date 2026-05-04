/**
 * Personalized hydration goal calculator (ml/day).
 *
 * Sources used as guidance (not medical advice):
 *  - NIH/WHO suggest ~2–3 L/day total water for adults
 *  - Heat & humidity raise sweat losses; activity does the same
 *
 * Rules implemented (per spec):
 *   BASE: 2000 ml
 *   AGE:  age >= 30  → +500
 *   GENDER: male     → +250
 *   ACTIVITY: light  → +250 | active → +500 | sedentary → 0
 *   WEATHER: 25–30°C → +250 | >30°C → +500
 *   HUMIDITY: >70%   → +250 (Philippines heat-index bump)
 */

export const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", hint: "Mostly desk work", bonus: 0 },
  { id: "light", label: "Light", hint: "Some walking, light gym", bonus: 250 },
  { id: "active", label: "Active", hint: "Daily workouts, on feet", bonus: 500 },
];

export function calculateGoal({ user, weather }) {
  const bonuses = [];
  let goal = 2000;
  bonuses.push({ key: "base", label: "Base hydration", amount: 2000 });

  if (user?.age && user.age >= 30) {
    goal += 500;
    bonuses.push({ key: "age", label: `Age ${user.age}`, amount: 500 });
  }

  if (user?.gender === "male") {
    goal += 250;
    bonuses.push({ key: "gender", label: "Male physiology", amount: 250 });
  }

  const activity = ACTIVITY_LEVELS.find((a) => a.id === user?.activity);
  if (activity && activity.bonus > 0) {
    goal += activity.bonus;
    bonuses.push({
      key: "activity",
      label: `${activity.label} activity`,
      amount: activity.bonus,
    });
  }

  if (weather?.temp != null) {
    if (weather.temp > 30) {
      goal += 500;
      bonuses.push({
        key: "heat",
        label: `Hot day (${Math.round(weather.temp)}°C)`,
        amount: 500,
      });
    } else if (weather.temp >= 25) {
      goal += 250;
      bonuses.push({
        key: "warm",
        label: `Warm day (${Math.round(weather.temp)}°C)`,
        amount: 250,
      });
    }
  }

  if (weather?.humidity != null && weather.humidity > 70) {
    goal += 250;
    bonuses.push({
      key: "humidity",
      label: `High humidity (${Math.round(weather.humidity)}%)`,
      amount: 250,
    });
  }

  // Round to nearest 50ml for clean displays
  goal = Math.round(goal / 50) * 50;

  return { goal, breakdown: bonuses };
}

export const formatLitres = (ml) => (ml / 1000).toFixed(2) + " L";
export const formatMl = (ml) => `${Math.round(ml)} ml`;
