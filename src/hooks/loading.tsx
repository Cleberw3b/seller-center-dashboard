import React, { createContext, useState } from 'react';
import { useContext } from 'react';
import { useCallback } from 'react';

interface LoadingContextData {
  isLoading: boolean;
  setLoading(loading: boolean): void;
}

const LoadingContext = createContext<LoadingContextData>({} as LoadingContextData);

const LoadingProvider: React.FC = ({ children }) => {
  const [isLoading, setLoading] = useState(false);

  const handleLoading = useCallback((loading: boolean) => {
    setLoading(loading);
  }, [])


  return (
    <LoadingContext.Provider
      value={{ isLoading, setLoading: handleLoading }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

function useLoading(): LoadingContextData {
  const context = useContext(LoadingContext);

  if (!context)
    throw new Error('useLoading must be used within an LoagindProvider');

  return context;
}

export { LoadingProvider, useLoading }
