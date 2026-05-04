import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeather } from "../features/weather/weatherSlice";

const REFRESH_MS = 30 * 60 * 1000; // 30 min

/**
 * Re-fetches weather every 30 minutes when location is known.
 * Also re-fetches whenever location changes.
 */
export default function useWeatherRefresh() {
  const location = useSelector((s) => s.user.location);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!location) return;
    // Initial fetch
    dispatch(fetchWeather({ lat: location.lat, lon: location.lon }));
    const id = setInterval(() => {
      dispatch(fetchWeather({ lat: location.lat, lon: location.lon }));
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [location, dispatch]);
}
