// React Context to share dataset state across pages
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dataset } from '@/types';

interface ETLContextValue {
  datasets: Dataset[];
  setDatasets: (d: Dataset[]) => void;
  selectedDataset: Dataset | null;
  setSelectedDataset: (d: Dataset | null) => void;
  etlProgress: number;
  setEtlProgress: (n: number) => void;
}

const ETLContext = createContext<ETLContextValue | null>(null);

export function ETLProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [etlProgress, setEtlProgress] = useState(0);

  return (
    <ETLContext.Provider value={{
      datasets, setDatasets,
      selectedDataset, setSelectedDataset,
      etlProgress, setEtlProgress,
    }}>
      {children}
    </ETLContext.Provider>
  );
}

export function useETL() {
  const ctx = useContext(ETLContext);
  if (!ctx) throw new Error('useETL must be used within ETLProvider');
  return ctx;
}
