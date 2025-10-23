// Main content component that handles section switching
"use client";
import React from 'react';
import { useAppContext } from '../lib/context';
import { Dashboard } from './Dashboard';
import { EconomicsCalculator } from './EconomicsCalculator';
import { GeotechnicalCalculator } from './GeotechnicalCalculator';
import { DesignCalculator } from './DesignCalculator';
import { OperationsCalculator } from './OperationsCalculator';
import { ToolsManager } from './ToolsManager';

export const MainContent: React.FC = () => {
  const { state } = useAppContext();

  const renderSection = () => {
    switch (state.currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'economics':
        return <EconomicsCalculator />;
      case 'geotechnical':
        return <GeotechnicalCalculator />;
      case 'design':
        return <DesignCalculator />;
      case 'operations':
        return <OperationsCalculator />;
      case 'tools':
        return <ToolsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">
      {renderSection()}
    </main>
  );
};
