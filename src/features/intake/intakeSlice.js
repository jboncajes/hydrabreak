import { createSlice } from "@reduxjs/toolkit";

const todayKey = () => new Date().toISOString().slice(0, 10);

const initialState = {
  date: todayKey(),
  today: 0,            // ml drunk today
  goal: 2000,          // dynamic — recalculated when profile/weather changes
  history: [],         // [{ date: 'YYYY-MM-DD', total, goal }]
  log: [],             // [{ ts, amount }]  ← today's individual sips
  lastDrink: null,     // timestamp
};

const intakeSlice = createSlice({
  name: "intake",
  initialState,
  reducers: {
    rolloverIfNeeded(state) {
      const t = todayKey();
      if (state.date !== t) {
        // Archive yesterday
        state.history.unshift({
          date: state.date,
          total: state.today,
          goal: state.goal,
        });
        state.history = state.history.slice(0, 30); // keep 30 days
        state.date = t;
        state.today = 0;
        state.log = [];
        state.lastDrink = null;
      }
    },
    drink(state, action) {
      const amount = action.payload || 250;
      state.today += amount;
      state.log.unshift({ ts: Date.now(), amount });
      state.log = state.log.slice(0, 100);
      state.lastDrink = Date.now();
    },
    undoLast(state) {
      if (state.log.length === 0) return;
      const [last, ...rest] = state.log;
      state.today = Math.max(0, state.today - last.amount);
      state.log = rest;
      state.lastDrink = rest.length ? rest[0].ts : null;
    },
    setGoal(state, action) {
      state.goal = action.payload;
    },
    resetDay(state) {
      state.today = 0;
      state.log = [];
      state.lastDrink = null;
    },
  },
});

export const { rolloverIfNeeded, drink, undoLast, setGoal, resetDay } =
  intakeSlice.actions;
export default intakeSlice.reducer;
