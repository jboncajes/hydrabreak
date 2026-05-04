import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { drink } from "../features/intake/intakeSlice";
import { toast } from "react-toastify";

const QUICK_AMOUNTS = [150, 250, 500];

export default function DrinkButton() {
  const dispatch = useDispatch();
  const defaultAmount = useSelector((s) => s.settings.defaultDrinkAmount);
  const goal = useSelector((s) => s.intake.goal);
  const today = useSelector((s) => s.intake.today);
  const [showOptions, setShowOptions] = useState(false);

  const handleDrink = (amount) => {
    dispatch(drink(amount));
    setShowOptions(false);
    const after = today + amount;
    if (after >= goal && today < goal) {
      toast.success(`Daily goal reached! ${after}ml of ${goal}ml`);
    } else {
      toast.info(`Drank ${amount}ml — ${goal - after > 0 ? `${goal - after}ml to go` : "over goal!"}`);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex gap-2 glass-strong rounded-full px-3 py-2"
          >
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => handleDrink(amt)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold transition active:scale-95 whitespace-nowrap"
              >
                {amt}ml
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => handleDrink(defaultAmount)}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowOptions((v) => !v);
        }}
        onDoubleClick={() => setShowOptions((v) => !v)}
        className="btn-primary text-lg px-10 py-5 relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        💧 Drank {defaultAmount}ml
      </motion.button>

      <button
        onClick={() => setShowOptions((v) => !v)}
        className="block mx-auto mt-3 text-xs text-hydra-200/70 hover:text-hydra-100 underline-offset-4 hover:underline"
      >
        {showOptions ? "Close" : "Different amount?"}
      </button>
    </div>
  );
}
