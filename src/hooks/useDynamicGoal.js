import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { calculateGoal } from "../utils/goalCalculator";
import { setGoal, rolloverIfNeeded } from "../features/intake/intakeSlice";

/**
 * Recomputes the daily goal whenever the user profile or weather changes,
 * and rolls the day over at midnight (next render after the day ticks).
 */
export default function useDynamicGoal() {
  const user = useSelector((s) => s.user);
  const weather = useSelector((s) => s.weather);
  const currentGoal = useSelector((s) => s.intake.goal);
  const dispatch = useDispatch();

  const { goal, breakdown } = useMemo(
    () => calculateGoal({ user, weather }),
    [user, weather]
  );

  useEffect(() => {
    dispatch(rolloverIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    if (goal !== currentGoal) {
      dispatch(setGoal(goal));
    }
  }, [goal, currentGoal, dispatch]);

  return { goal, breakdown };
}
