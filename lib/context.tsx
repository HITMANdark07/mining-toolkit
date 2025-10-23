// Context for managing global application state
"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AppState {
  currentSection: string;
  kpis: {
    npv: number;
    irr: number;
    fos: number;
    rockburst: string;
    rmr: number;
    matchFactor: number;
  };
  sessionData: Record<string, any>;
  modal: {
    isOpen: boolean;
    content: React.ReactNode | null;
    title: string;
  };
}

export interface AppContextType {
  state: AppState;
  setCurrentSection: (section: string) => void;
  updateKPI: (key: keyof AppState['kpis'], value: number | string) => void;
  saveSession: (name: string, data: any) => void;
  loadSession: (name: string) => any;
  clearSession: () => void;
  exportData: (section: string, data: any) => void;
  openModal: (title: string, content: React.ReactNode) => void;
  closeModal: () => void;
}

const initialState: AppState = {
  currentSection: 'dashboard',
  kpis: {
    npv: 0,
    irr: 0,
    fos: 0,
    rockburst: 'NONE',
    rmr: 0,
    matchFactor: 0,
  },
  sessionData: {},
  modal: {
    isOpen: false,
    content: null,
    title: '',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const setCurrentSection = useCallback((section: string) => {
    setState(prev => ({ ...prev, currentSection: section }));
  }, []);

  const updateKPI = useCallback((key: keyof AppState['kpis'], value: number | string) => {
    setState(prev => ({
      ...prev,
      kpis: { ...prev.kpis, [key]: value }
    }));
  }, []);

  const saveSession = useCallback((name: string, data: any) => {
    try {
      localStorage.setItem(`mining_session_${name}`, JSON.stringify(data));
      setState(prev => ({
        ...prev,
        sessionData: { ...prev.sessionData, [name]: data }
      }));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);

  const loadSession = useCallback((name: string) => {
    try {
      const data = localStorage.getItem(`mining_session_${name}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem('mining_session_current');
      setState(prev => ({
        ...prev,
        sessionData: {}
      }));
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  const exportData = useCallback((section: string, data: any) => {
    const csv = convertToCSV(data);
    downloadFile(csv, `${section}-data.csv`, 'text/csv');
  }, []);

  const openModal = useCallback((title: string, content: React.ReactNode) => {
    setState(prev => ({
      ...prev,
      modal: {
        isOpen: true,
        title,
        content,
      }
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      modal: {
        isOpen: false,
        content: null,
        title: '',
      }
    }));
  }, []);

  const value: AppContextType = {
    state,
    setCurrentSection,
    updateKPI,
    saveSession,
    loadSession,
    clearSession,
    exportData,
    openModal,
    closeModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Utility functions
const convertToCSV = (data: any): string => {
  if (Array.isArray(data)) {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');
    return csvContent;
  }
  return JSON.stringify(data);
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
