// context/SignupContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SignupData = {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  password: string;
  latitude: number | null;
  longitude: number | null;
};

type SignupContextType = {
  signupData: SignupData;
  setSignupData: (data: Partial<SignupData>) => void;
  resetSignupData: () => void;
};

export const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider = ({ children }: { children: ReactNode }) => {
  const [signupData, setSignupDataState] = useState<SignupData>({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    address: '',
    password: '',
    latitude: null,
    longitude: null,
  });

  const setSignupData = (data: Partial<SignupData>) => {
    setSignupDataState((prev) => ({ ...prev, ...data }));
  };

  const resetSignupData = () => {
    setSignupDataState({
      email: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      address: '',
      password: '',
      latitude: null,
      longitude: null,
    });
  };

  return (
    <SignupContext.Provider value={{ signupData, setSignupData, resetSignupData }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
};
