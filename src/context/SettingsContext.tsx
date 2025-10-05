"use client";

import React, { createContext, useContext, useState } from "react";

interface SettingsContextType {
  fromOnboardingScreen: boolean;
  setFromOnboardingScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fromOnboardingScreen, setFromOnboardingScreen] = useState(false);

  return (
    <SettingsContext.Provider
      value={{ fromOnboardingScreen, setFromOnboardingScreen }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
