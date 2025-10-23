// Design calculator component
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { useAppContext } from '../lib/context';
import { PillarParams, PillarResults, StressParams, StressResults } from '../lib/types';

// Register all Chart.js components
Chart.register(...registerables);

export const DesignCalculator: React.FC = () => {
  const { state, updateKPI } = useAppContext();
  
  // Pillar Stability State
  const [pillarParams, setPillarParams] = useState<PillarParams>({
    material: 'hard_rock',
    width: 15,
    height: 10,
    depth: 500,
    unitWeight: 25,
    extraction: 60,
    k: 80,
  });
  const [pillarResults, setPillarResults] = useState<PillarResults | null>(null);
  const [showPillarResults, setShowPillarResults] = useState(false);
  const pillarChartRef = useRef<HTMLCanvasElement>(null);
  const pillarChartInstance = useRef<Chart | null>(null);

  // Stress & GRC State
  const [stressParams, setStressParams] = useState<StressParams>({
    depth: 1000,
    unitWeight: 27,
    kRatio: 1.5,
    radius: 3,
    ucs: 85,
    mb: 4.8,
    s: 0.009,
    em: 30,
  });
  const [stressResults, setStressResults] = useState<StressResults | null>(null);
  const [showStressResults, setShowStressResults] = useState(false);
  const stressChartRef = useRef<HTMLCanvasElement>(null);
  const grcChartRef = useRef<HTMLCanvasElement>(null);
  const stressChartInstance = useRef<Chart | null>(null);
  const grcChartInstance = useRef<Chart | null>(null);

  // Calculation functions
  const calculatePillar = (params: PillarParams): PillarResults => {
    const { material, width, height, depth, unitWeight, extraction, k } = params;
    
    let pillarStrength: number;
    
    if (material === 'hard_rock' && k) {
      // Hedley & Grant formula for hard rock
      pillarStrength = k * (Math.pow(width, 0.5) / Math.pow(height, 0.75));
    } else {
      // Salamon & Munro formula for coal
      const w_ft = width * 3.28084;
      const h_ft = height * 3.28084;
      const pillarStrength_psi = 1320 * (Math.pow(w_ft, 0.46) / Math.pow(h_ft, 0.66));
      pillarStrength = pillarStrength_psi * 0.00689476; // Convert PSI to MPa
    }
    
    const sv = (depth * unitWeight) / 1000; // Convert to MPa
    const pillarStress = sv / (1 - extraction);
    const fos = pillarStrength / pillarStress;
    
    return { strength: pillarStrength, stress: pillarStress, fos };
  };

  const calculateStress = (params: StressParams): StressResults => {
    const { depth, unitWeight, kRatio, radius, ucs, mb, s, em } = params;
    
    const sv = (depth * unitWeight) / 1000; // Convert to MPa
    const sh = sv * kRatio;
    const sThetaMax = 3 * sh - sv;
    const po = (sv + 2 * sh) / 3;
    const pcr = po - (Math.sqrt(s * ucs ** 2 + (mb * po) ** 2 / 4) - mb * po / 2);
    
    return { sv, sh, sThetaMax, po, pcr };
  };

  // Event handlers
  const handlePillarCalculate = () => {
    const results = calculatePillar(pillarParams);
    setPillarResults(results);
    setShowPillarResults(true);
    updateKPI('fos', results.fos);

    // Create pillar stability chart
    if (pillarChartRef.current) {
      if (pillarChartInstance.current) {
        pillarChartInstance.current.destroy();
      }

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: [''],
          datasets: [
            {
              label: 'Pillar Stress (Load)',
              data: [results.stress],
              backgroundColor: '#ef4444',
              borderRadius: 4
            },
            {
              label: 'Pillar Strength',
              data: [results.strength],
              backgroundColor: '#22c55e',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { title: { display: true, text: 'Stress (MPa)' } }
          }
        }
      };

      pillarChartInstance.current = new Chart(pillarChartRef.current, config);
    }
  };

  const handleStressCalculate = () => {
    const results = calculateStress(stressParams);
    setStressResults(results);
    setShowStressResults(true);

    // Generate GRC data
    const R = stressParams.radius;
    const po = results.po;
    const pcr = results.pcr;
    
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let pi = po; pi >= 0; pi -= po / 25) {
      let displacement: number;
      if (pi > pcr) {
        displacement = (R * 1.25 / (stressParams.em * 1000)) * (po - pi);
      } else {
        displacement = (R * 1.25 / (stressParams.em * 1000)) * (po - pcr) * Math.pow(pcr / pi, 2 / (stressParams.mb - 1));
      }
      labels.push((displacement / R * 100).toFixed(2));
      data.push(parseFloat(pi.toFixed(2)));
    }
    
    // Create GRC chart
    if (grcChartRef.current) {
      if (grcChartInstance.current) {
        grcChartInstance.current.destroy();
      }

      const grcConfig: ChartConfiguration = {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'GRC',
            data,
            borderColor: '#06b6d4',
            borderWidth: 3,
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(6,182,212,0.1)',
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Convergence (% Radius)' } },
            y: { title: { display: true, text: 'Support Pressure (MPa)' } }
          },
          plugins: { legend: { display: false } }
        }
      };

      grcChartInstance.current = new Chart(grcChartRef.current, grcConfig);
    }
    
    // Generate stress distribution data
    const stressLabels: string[] = [];
    const radialStress: number[] = [];
    const tangentialStress: number[] = [];
    
    for (let r_ratio = 1; r_ratio <= 4; r_ratio += 0.2) {
      stressLabels.push(r_ratio.toFixed(1));
      const a2r2 = 1 / (r_ratio * r_ratio);
      const sig_r = 0.5 * (results.sv + results.sh) * (1 - a2r2) + 0.5 * (results.sh - results.sv) * (1 - 4 * a2r2 + 3 * a2r2 * a2r2);
      const sig_t = 0.5 * (results.sv + results.sh) * (1 + a2r2) - 0.5 * (results.sh - results.sv) * (1 + 3 * a2r2 * a2r2);
      radialStress.push(sig_r);
      tangentialStress.push(sig_t);
    }
    
    // Create stress distribution chart
    if (stressChartRef.current) {
      if (stressChartInstance.current) {
        stressChartInstance.current.destroy();
      }

      const stressConfig: ChartConfiguration = {
        type: 'line',
        data: {
          labels: stressLabels,
          datasets: [
            {
              label: 'Tangential Stress (Sides)',
              data: tangentialStress,
              borderColor: '#e11d48',
              tension: 0.1
            },
            {
              label: 'Radial Stress',
              data: radialStress,
              borderColor: '#0891b2',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Distance from Tunnel Center (r/a)' } },
            y: { title: { display: true, text: 'Stress (MPa)' } }
          }
        }
      };

      stressChartInstance.current = new Chart(stressChartRef.current, stressConfig);
    }
  };

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (pillarChartInstance.current) {
        pillarChartInstance.current.destroy();
      }
      if (stressChartInstance.current) {
        stressChartInstance.current.destroy();
      }
      if (grcChartInstance.current) {
        grcChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Design & Stability</h2>
      
      {/* Pillar Stability */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Pillar Stability (Hard Rock / Coal)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Material</label>
              <select 
                value={pillarParams.material}
                onChange={(e) => setPillarParams(prev => ({ ...prev, material: e.target.value as 'hard_rock' | 'coal' }))}
                className="mt-1 w-full rounded border p-2"
              >
                <option value="hard_rock">Hard Rock (Hedley & Grant)</option>
                <option value="coal">Coal (Salamon & Munro)</option>
              </select>
            </div>
            {pillarParams.material === 'hard_rock' && (
              <div>
                <label className="block text-sm font-medium">Rock Mass Strength Constant (K), MPa</label>
                <input 
                  type="number" 
                  value={pillarParams.k || 0}
                  onChange={(e) => setPillarParams(prev => ({ ...prev, k: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded border p-2" 
                />
              </div>
            )}
            {pillarParams.material === 'coal' && (
              <div className="text-xs text-slate-500">
                Salamon & Munro: Strength = 1320 * (w^0.46 / h^0.66) psi (converted to MPa).
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Pillar Width (w), m</label>
                <input 
                  type="number" 
                  value={pillarParams.width}
                  onChange={(e) => setPillarParams(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm">Pillar Height (h), m</label>
                <input 
                  type="number" 
                  value={pillarParams.height}
                  onChange={(e) => setPillarParams(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm">Depth to Pillar, m</label>
                <input 
                  type="number" 
                  value={pillarParams.depth}
                  onChange={(e) => setPillarParams(prev => ({ ...prev, depth: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm">Rock Unit Wt, kN/m³</label>
                <input 
                  type="number" 
                  value={pillarParams.unitWeight}
                  onChange={(e) => setPillarParams(prev => ({ ...prev, unitWeight: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded border p-2" 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm">Extraction Ratio, %</label>
                <input 
                  type="number" 
                  value={pillarParams.extraction}
                  onChange={(e) => setPillarParams(prev => ({ ...prev, extraction: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 w-full rounded border p-2" 
                />
              </div>
            </div>
            <button 
              onClick={handlePillarCalculate}
              className="mt-2 bg-teal-600 text-white px-4 py-2 rounded"
            >
              Calculate Stability
            </button>
          </div>
          <div>
            <div className="h-64 mb-4">
              <canvas ref={pillarChartRef}></canvas>
            </div>
            {showPillarResults && pillarResults && (
              <div className="p-4 bg-teal-50 rounded">
                <p>Pillar Strength: <strong>{pillarResults.strength.toFixed(2)} MPa</strong></p>
                <p>Pillar Stress (Load): <strong>{pillarResults.stress.toFixed(2)} MPa</strong></p>
                <p className="mt-2">
                  FoS: <strong className={pillarResults.fos < 1.5 ? 'text-red-600' : 'text-green-600'}>
                    {pillarResults.fos.toFixed(2)}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stress & GRC */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Stress & Ground Support (Kirsch + GRC)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm">Depth (m)</label>
            <input 
              type="number" 
              value={stressParams.depth}
              onChange={(e) => setStressParams(prev => ({ ...prev, depth: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Unit Wt (kN/m³)</label>
            <input 
              type="number" 
              value={stressParams.unitWeight}
              onChange={(e) => setStressParams(prev => ({ ...prev, unitWeight: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Stress Ratio (k)</label>
            <input 
              type="number" 
              value={stressParams.kRatio}
              onChange={(e) => setStressParams(prev => ({ ...prev, kRatio: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Tunnel Radius (m)</label>
            <input 
              type="number" 
              value={stressParams.radius}
              onChange={(e) => setStressParams(prev => ({ ...prev, radius: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm">UCS (MPa)</label>
            <input 
              type="number" 
              value={stressParams.ucs}
              onChange={(e) => setStressParams(prev => ({ ...prev, ucs: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">m<sub>b</sub></label>
            <input 
              type="number" 
              value={stressParams.mb}
              onChange={(e) => setStressParams(prev => ({ ...prev, mb: parseFloat(e.target.value) || 0 }))}
              step="0.1"
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">s</label>
            <input 
              type="number" 
              value={stressParams.s}
              onChange={(e) => setStressParams(prev => ({ ...prev, s: parseFloat(e.target.value) || 0 }))}
              step="0.001"
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">E<sub>m</sub> (GPa)</label>
            <input 
              type="number" 
              value={stressParams.em}
              onChange={(e) => setStressParams(prev => ({ ...prev, em: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleStressCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Calculate
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="h-64">
            <canvas ref={stressChartRef}></canvas>
          </div>
          <div className="h-64">
            <canvas ref={grcChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};
