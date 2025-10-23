// Dashboard component
"use client";
import React, { useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { useAppContext } from '../lib/context';

// Register all Chart.js components
Chart.register(...registerables);

export const Dashboard: React.FC = () => {
  const { state, setCurrentSection } = useAppContext();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Create a sample chart for demonstration
    if (chartRef.current && !chartInstance.current) {
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: Array.from({ length: 10 }, (_, i) => `Year ${i + 1}`),
          datasets: [{
            label: 'Cumulative Cash Flow (₹ Cr)',
            data: Array.from({ length: 10 }, (_, i) => -4175 + (i + 1) * 500),
            borderColor: '#0ea5e9',
            borderWidth: 3,
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(14,165,233,0.1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Year' } },
            y: { title: { display: true, text: '₹ Cr' } }
          }
        }
      };

      chartInstance.current = new Chart(chartRef.current, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, []);

  const formatIN = (val: number | string, digits: number = 2): string => {
    try {
      return Number(val).toLocaleString('en-IN', { maximumFractionDigits: digits });
    } catch {
      return String(val);
    }
  };

  const quickActions = [
    { id: 'economics', label: 'LoM Planner', icon: '💰' },
    { id: 'geotechnical', label: 'Slope Stability', icon: '🏔️' },
    { id: 'operations', label: 'Blast Design', icon: '💥' },
    { id: 'design', label: 'Pillar Design', icon: '🏗️' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-slate-500">NPV (₹ Cr)</h4>
          <p className="text-2xl font-bold">{formatIN(state.kpis.npv)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-slate-500">IRR (%)</h4>
          <p className="text-2xl font-bold">{formatIN(state.kpis.irr)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-slate-500">Pillar FoS</h4>
          <p className="text-2xl font-bold">{formatIN(state.kpis.fos)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-slate-500">Rockburst Risk</h4>
          <p className="text-2xl font-bold">{state.kpis.rockburst}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-slate-500">RMR</h4>
          <p className="text-2xl font-bold">{formatIN(state.kpis.rmr)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-slate-500">Match Factor</h4>
          <p className="text-2xl font-bold">{formatIN(state.kpis.matchFactor)}</p>
        </div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Life-of-Mine Cumulative Cash Flow</h3>
          <div className="relative h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => setCurrentSection(action.id)}
                className="bg-teal-100 text-teal-800 p-3 rounded-lg hover:bg-teal-200 text-center transition-colors"
              >
                <div className="text-2xl mb-1">{action.icon}</div>
                <div className="text-sm font-medium">{action.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
