import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  setupComplete: false,
  age: null,
  gender: null,        // 'male' | 'female' | 'other'
  activity: null,      // 'sedentary' | 'light' | 'active'
  location: null,      // { lat, lon, label }
  locationDenied: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile(state, action) {
      const { age, gender, activity } = action.payload;
      if (age !== undefined) state.age = age;
      if (gender !== undefined) state.gender = gender;
      if (activity !== undefined) state.activity = activity;
    },
    setLocation(state, action) {
      state.location = action.payload;
      state.locationDenied = false;
    },
    setLocationDenied(state) {
      state.locationDenied = true;
    },
    completeSetup(state) {
      state.setupComplete = true;
    },
    resetUser() {
      return initialState;
    },
  },
});

export const {
  setProfile,
  setLocation,
  setLocationDenied,
  completeSetup,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
