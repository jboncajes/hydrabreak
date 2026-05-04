import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import AppBar from "./components/AppBar";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import SetupWizard from "./components/SetupWizard";
import { rolloverIfNeeded } from "./features/intake/intakeSlice";

export default function App() {
  const setupComplete = useSelector((s) => s.user.setupComplete);
  const dispatch = useDispatch();

  // Roll the day over on app launch & at midnight
  useEffect(() => {
    dispatch(rolloverIfNeeded());
    const id = setInterval(() => dispatch(rolloverIfNeeded()), 60 * 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  if (!setupComplete) {
    return (
      <>
        <SetupWizard />
        <ToastContainer
          position="top-center"
          autoClose={2800}
          hideProgressBar={false}
          newestOnTop
          theme="dark"
          closeOnClick
        />
      </>
    );
  }

  return (
    <>
      <AppBar />
      <main className="min-h-[calc(100dvh-4rem)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer
        position="top-center"
        autoClose={2800}
        hideProgressBar={false}
        newestOnTop
        theme="dark"
        closeOnClick
      />
    </>
  );
}
