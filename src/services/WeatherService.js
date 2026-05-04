import axios from "axios";

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Wraps navigator.geolocation in a Promise.
 * Resolves with { lat, lon } or rejects on permission denial / timeout.
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000, ...options }
    );
  });
}

/**
 * Fetch current weather. If no API key configured, returns mock Manila weather
 * so the app still runs end-to-end during local dev.
 */
export async function fetchWeatherByCoords(lat, lon) {
  if (!API_KEY || API_KEY === "PASTE_YOUR_KEY_HERE") {
    // Dev fallback — pretend we're in Manila on a hot day
    console.warn(
      "[HydraBreak] No OpenWeatherMap key set. Using mock weather. " +
      "Add REACT_APP_OPENWEATHER_API_KEY to .env to enable live weather."
    );
    return {
      temp: 32,
      feelsLike: 38,
      humidity: 75,
      description: "scattered clouds (mock)",
      icon: "03d",
      city: "Manila (mock)",
    };
  }

  const { data } = await axios.get(ENDPOINT, {
    params: { lat, lon, appid: API_KEY, units: "metric" },
    timeout: 10000,
  });

  return {
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    description: data.weather?.[0]?.description ?? "—",
    icon: data.weather?.[0]?.icon ?? "01d",
    city: data.name ?? "Unknown",
  };
}

export const weatherIconUrl = (icon) =>
  icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null;
