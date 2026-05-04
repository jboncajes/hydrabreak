import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWeatherByCoords } from "../../services/WeatherService";

const initialState = {
  temp: null,
  feelsLike: null,
  humidity: null,
  description: null,
  icon: null,
  city: null,
  lastUpdated: null,
  status: "idle",   // idle | loading | succeeded | failed
  error: null,
};

export const fetchWeather = createAsyncThunk(
  "weather/fetch",
  async ({ lat, lon }, { rejectWithValue }) => {
    try {
      return await fetchWeatherByCoords(lat, lon);
    } catch (err) {
      return rejectWithValue(err.message || "Weather fetch failed");
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearWeather() {
      return initialState;
    },
    // Manual setter — used as fallback for users without location permission
    setWeatherManual(state, action) {
      const { temp, humidity } = action.payload;
      state.temp = temp;
      state.humidity = humidity;
      state.description = "Manual entry";
      state.icon = "01d";
      state.city = "Manual";
      state.lastUpdated = Date.now();
      state.status = "succeeded";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        const w = action.payload;
        state.temp = w.temp;
        state.feelsLike = w.feelsLike;
        state.humidity = w.humidity;
        state.description = w.description;
        state.icon = w.icon;
        state.city = w.city;
        state.lastUpdated = Date.now();
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not fetch weather";
      });
  },
});

export const { clearWeather, setWeatherManual } = weatherSlice.actions;
export default weatherSlice.reducer;
