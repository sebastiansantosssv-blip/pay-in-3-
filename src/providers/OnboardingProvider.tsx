import React, { createContext, useContext, useState } from 'react';

interface OnboardingData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  celular: string;
  selfieUri: string | null;
  cedulaFrontUri: string | null;
  cedulaBackUri: string | null;
  tipoIngreso: string;
  pin: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  update: (fields: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initial: OnboardingData = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  celular: '',
  selfieUri: null,
  cedulaFrontUri: null,
  cedulaBackUri: null,
  tipoIngreso: '',
  pin: '',
};

const OnboardingContext = createContext<OnboardingContextType>({
  data: initial,
  update: () => {},
  reset: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initial);

  const update = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const reset = () => setData(initial);

  return (
    <OnboardingContext.Provider value={{ data, update, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}
