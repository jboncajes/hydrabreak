import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import weatherReducer from "./features/weather/weatherSlice";
import intakeReducer from "./features/intake/intakeSlice";
import settingsReducer from "./features/settings/settingsSlice";

const STORAGE_KEY = "hydrabreak_state_v1";

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch (e) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    // Only persist what matters — drop transient flags
    const persisted = {
      user: state.user,
      weather: state.weather,
      intake: state.intake,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch (e) {
    // localStorage may be disabled — fail silently
  }
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    weather: weatherReducer,
    intake: intakeReducer,
    settings: settingsReducer,
  },
  preloadedState: loadState(),
});

let saveTimer;
store.subscribe(() => {
  // Throttle writes to avoid hammering localStorage
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(store.getState()), 250);
});
