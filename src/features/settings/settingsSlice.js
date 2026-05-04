import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workStart: "08:00",
  workEnd: "17:00",
  intervalMinutes: 60,        // reminder cadence
  defaultDrinkAmount: 250,
  notificationsEnabled: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings(state, action) {
      Object.assign(state, action.payload);
    },
    setNotifications(state, action) {
      state.notificationsEnabled = !!action.payload;
    },
  },
});

export const { updateSettings, setNotifications } = settingsSlice.actions;
export default settingsSlice.reducer;
