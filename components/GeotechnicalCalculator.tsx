// Geotechnical calculator component
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import * as d3 from 'd3';
import { useAppContext } from '../lib/context';
import { FoSParams, FoSResults, RMRParams, RMRResults, RockburstParams, RockburstResults, MonteCarloParams, MonteCarloResults } from '../lib/types';

// Register all Chart.js components
Chart.register(...registerables);

export const GeotechnicalCalculator: React.FC = () => {
  const { state, updateKPI } = useAppContext();
  
  // FoS State
  const [fosParams, setFosParams] = useState<FoSParams>({
    cohesion: 25,
    friction: 35,
    slope: 45,
    height: 15,
    unitWeight: 27,
  });
  const [fosResults, setFosResults] = useState<FoSResults | null>(null);
  const [showFosResults, setShowFosResults] = useState(false);

  // RMR State
  const [rmrParams, setRmrParams] = useState<RMRParams>({
    strength: 12,
    rqd: 17,
    spacing: 15,
    condition: 25,
    groundwater: 10,
  });
  const [rmrResults, setRmrResults] = useState<RMRResults | null>(null);
  const rmrChartRef = useRef<HTMLCanvasElement>(null);
  const rmrChartInstance = useRef<Chart | null>(null);

  // Rockburst State
  const [rockburstParams, setRockburstParams] = useState<RockburstParams>({
    ucs: 150,
    tensile: 10,
    stress: 85,
    ue: 6,
    ud: 1,
  });
  const [rockburstResults, setRockburstResults] = useState<RockburstResults | null>(null);
  const [showRockburstResults, setShowRockburstResults] = useState(false);

  // Monte Carlo State
  const [monteCarloParams, setMonteCarloParams] = useState<MonteCarloParams>({
    slopeDip: 70,
    slopeDipDir: 180,
    j1Dip: 45,
    j1DipDir: 135,
    j2Dip: 55,
    j2DipDir: 225,
    phiMean: 35,
    phiStd: 5,
    cohMean: 15,
    cohStd: 5,
    unitWeight: 27,
    height: 20,
    iterations: 5000,
  });
  const [monteCarloResults, setMonteCarloResults] = useState<MonteCarloResults | null>(null);
  const [showMonteCarloResults, setShowMonteCarloResults] = useState(false);
  const fosHistogramRef = useRef<HTMLCanvasElement>(null);
  const fosHistogramInstance = useRef<Chart | null>(null);
  const stereonetRef = useRef<SVGSVGElement>(null);

  // Calculation functions
  const calculateFoS = (params: FoSParams): FoSResults => {
    const { cohesion, friction, slope, height, unitWeight } = params;
    
    const phi = friction * (Math.PI / 180);
    const beta = slope * (Math.PI / 180);
    const gamma = unitWeight;
    const H = height;
    
    const W = 0.5 * gamma * Math.pow(H, 2) * (1 / Math.tan(beta));
    const resistingForce = (cohesion * H / Math.sin(beta)) + (W * Math.cos(beta) * Math.tan(phi));
    const drivingForce = W * Math.sin(beta);
    const fos = resistingForce / drivingForce;
    
    return { fos, resistingForce, drivingForce };
  };

  const calculateRMR = (params: RMRParams): RMRResults => {
    const { strength, rqd, spacing, condition, groundwater } = params;
    const total = strength + rqd + spacing + condition + groundwater;
    
    let rockClass = "V - Very Poor";
    if (total > 80) rockClass = "I - Very Good";
    else if (total > 60) rockClass = "II - Good";
    else if (total > 40) rockClass = "III - Fair";
    else if (total > 20) rockClass = "IV - Poor";
    
    return {
      total,
      rockClass,
      breakdown: [strength, rqd, spacing, condition, groundwater]
    };
  };

  const calculateRockburst = (params: RockburstParams): RockburstResults => {
    const { ucs, tensile, stress, ue, ud } = params;
    
    const brittleness = ucs / tensile;
    const ssr = stress / ucs;
    
    let riskLevel = 'NONE';
    if (ssr > 0.55) riskLevel = 'HIGH';
    else if (ssr > 0.3) riskLevel = 'MODERATE';
    else if (ssr > 0.2) riskLevel = 'LOW';
    
    const wet = ue / ud;
    let wetRisk = 'LOW';
    if (wet >= 5) wetRisk = 'HIGH';
    else if (wet >= 2) wetRisk = 'MODERATE';
    
    return { ssr, brittleness, wet, riskLevel, wetRisk };
  };

  const randomNormal = (mean: number, std: number): number => {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
  };

  const runMonteCarlo = (params: MonteCarloParams): MonteCarloResults => {
    const { iterations, phiMean, phiStd, cohMean, cohStd, height, unitWeight, j1Dip, j2Dip } = params;
    
    const psi_p = Math.max(j1Dip, j2Dip) * Math.PI / 180;
    let failures = 0;
    let fosSum = 0;
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const phi = randomNormal(phiMean, phiStd);
      const coh = Math.max(0, randomNormal(cohMean, cohStd));
      
      if (Math.sin(psi_p) === 0 || Math.tan(psi_p) === 0) continue;
      
      const A = height / Math.sin(psi_p);
      const W = 0.5 * height * (height / Math.tan(psi_p)) * unitWeight;
      
      if (W <= 0) continue;
      
      const phi_rad = phi * Math.PI / 180;
      const resisting = (coh * A) + (W * Math.cos(psi_p) * Math.tan(phi_rad));
      const driving = W * Math.sin(psi_p);
      const fos = driving > 0 ? resisting / driving : Infinity;
      
      results.push(fos);
      if (fos < 1.0) failures++;
      fosSum += fos;
    }
    
    const probFailure = (failures / results.length) * 100;
    const meanFos = fosSum / results.length;
    
    return { probFailure, meanFos, fosResults: results };
  };

  // Event handlers
  const handleFosCalculate = () => {
    const results = calculateFoS(fosParams);
    setFosResults(results);
    setShowFosResults(true);
    updateKPI('fos', results.fos);
  };

  const handleRmrCalculate = () => {
    const results = calculateRMR(rmrParams);
    setRmrResults(results);
    updateKPI('rmr', results.total);

    // Create RMR breakdown chart
    if (rmrChartRef.current) {
      if (rmrChartInstance.current) {
        rmrChartInstance.current.destroy();
      }

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: ['Strength', 'RQD', 'Spacing', 'Condition', 'Water'],
          datasets: [{
            label: 'Rating',
            data: results.breakdown,
            backgroundColor: ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: { x: { max: 30 } }
        }
      };

      rmrChartInstance.current = new Chart(rmrChartRef.current, config);
    }
  };

  const handleRockburstCalculate = () => {
    const results = calculateRockburst(rockburstParams);
    setRockburstResults(results);
    setShowRockburstResults(true);
    updateKPI('rockburst', results.riskLevel);
  };

  const handleMonteCarloRun = () => {
    const results = runMonteCarlo(monteCarloParams);
    setMonteCarloResults(results);
    setShowMonteCarloResults(true);

    // Create histogram
    if (fosHistogramRef.current) {
      if (fosHistogramInstance.current) {
        fosHistogramInstance.current.destroy();
      }

      const bins = Array(20).fill(0);
      const minFos = Math.min(0, ...results.fosResults);
      const maxFos = Math.max(3, ...results.fosResults);
      const binWidth = (maxFos - minFos) / 20;
      
      results.fosResults.forEach(fos => {
        const idx = Math.min(19, Math.floor((fos - minFos) / binWidth));
        bins[idx]++;
      });

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: bins.map((_, i) => (minFos + i * binWidth).toFixed(2)),
          datasets: [{
            label: 'Frequency',
            data: bins,
            backgroundColor: '#14b8a6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Factor of Safety' } },
            y: { title: { display: true, text: 'Frequency' } }
          }
        }
      };

      fosHistogramInstance.current = new Chart(fosHistogramRef.current, config);
    }

    // Draw stereonet
    drawStereonet();
  };

  const drawStereonet = () => {
    if (!stereonetRef.current) return;

    const width = 300, height = 300;
    const svg = d3.select(stereonetRef.current);
    svg.attr('width', width).attr('height', height).html('');
    
    const radius = Math.min(width, height) / 2 - 10;
    const g = svg.append('g').attr('transform', `translate(${width/2},${height/2})`);
    
    // Draw circles
    g.append('circle').attr('r', radius).attr('fill', 'none').attr('stroke', '#94a3b8');
    g.append('path').attr('d', `M ${-radius},0 A ${radius},${radius} 0 0 1 ${radius},0`).attr('fill', 'none').attr('stroke', '#94a3b8');
    g.append('path').attr('d', `M 0,${-radius} A ${radius},${radius} 0 0 1 0,${radius}`).attr('fill', 'none').attr('stroke', '#94a3b8');
    
    const toRad = (d: number) => d * Math.PI / 180;
    const plotPole = (dip: number, dipDir: number) => {
      const r_pole = radius * Math.tan(toRad(90 - dip) / 2);
      const theta = toRad(dipDir - 90);
      return { x: r_pole * Math.cos(theta), y: r_pole * Math.sin(theta) };
    };
    
    const poles = [
      { ...plotPole(monteCarloParams.slopeDip, monteCarloParams.slopeDipDir), color: '#f87171', label: `Slope ${monteCarloParams.slopeDip}/${monteCarloParams.slopeDipDir}` },
      { ...plotPole(monteCarloParams.j1Dip, monteCarloParams.j1DipDir), color: '#3b82f6', label: `J1 ${monteCarloParams.j1Dip}/${monteCarloParams.j1DipDir}` },
      { ...plotPole(monteCarloParams.j2Dip, monteCarloParams.j2DipDir), color: '#16a34a', label: `J2 ${monteCarloParams.j2Dip}/${monteCarloParams.j2DipDir}` }
    ];
    
    g.selectAll('circle.pole').data(poles).enter().append('circle')
      .attr('class', 'pole')
      .attr('r', 5)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('fill', (d: any) => d.color);
  };

  // Initialize RMR calculation on mount
  useEffect(() => {
    handleRmrCalculate();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Geotechnical & Hazards</h2>
      
      {/* Rockburst Assessment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Rockburst Hazard Assessment</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm">UCS (σc), MPa</label>
            <input 
              type="number" 
              value={rockburstParams.ucs}
              onChange={(e) => setRockburstParams(prev => ({ ...prev, ucs: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="text-sm">Tensile Strength (σt), MPa</label>
            <input 
              type="number" 
              value={rockburstParams.tensile}
              onChange={(e) => setRockburstParams(prev => ({ ...prev, tensile: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="text-sm">Max Tangential Stress, MPa</label>
            <input 
              type="number" 
              value={rockburstParams.stress}
              onChange={(e) => setRockburstParams(prev => ({ ...prev, stress: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="text-sm">Elastic Energy (Ue)</label>
            <input 
              type="number" 
              value={rockburstParams.ue}
              onChange={(e) => setRockburstParams(prev => ({ ...prev, ue: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="text-sm">Dissipated Energy (Ud)</label>
            <input 
              type="number" 
              value={rockburstParams.ud}
              onChange={(e) => setRockburstParams(prev => ({ ...prev, ud: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleRockburstCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Assess Hazard
        </button>
        {showRockburstResults && rockburstResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm">Stress/Strength Ratio</p>
                <p className="text-2xl font-bold">{rockburstResults.ssr.toFixed(2)}</p>
                <span className={`px-2 py-1 rounded ${
                  rockburstResults.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                  rockburstResults.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                  rockburstResults.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {rockburstResults.riskLevel}
                </span>
              </div>
              <div>
                <p className="text-sm">Brittleness Index (B)</p>
                <p className="text-2xl font-bold">{rockburstResults.brittleness.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm">Strain Energy Index (Wet)</p>
                <p className="text-2xl font-bold">{rockburstResults.wet.toFixed(1)}</p>
                <p className="text-sm">Risk: {rockburstResults.wetRisk}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slope Stability */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Simplified Slope Stability (Factor of Safety)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm">Cohesion (kPa)</label>
            <input 
              type="number" 
              value={fosParams.cohesion}
              onChange={(e) => setFosParams(prev => ({ ...prev, cohesion: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Friction Angle (°)</label>
            <input 
              type="number" 
              value={fosParams.friction}
              onChange={(e) => setFosParams(prev => ({ ...prev, friction: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Slope Angle (°)</label>
            <input 
              type="number" 
              value={fosParams.slope}
              onChange={(e) => setFosParams(prev => ({ ...prev, slope: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Bench Height (m)</label>
            <input 
              type="number" 
              value={fosParams.height}
              onChange={(e) => setFosParams(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm">Unit Weight (kN/m³)</label>
            <input 
              type="number" 
              value={fosParams.unitWeight}
              onChange={(e) => setFosParams(prev => ({ ...prev, unitWeight: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleFosCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Calculate FoS
        </button>
        {showFosResults && fosResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <strong>Factor of Safety (FoS):</strong> 
            <span className={`text-xl ml-2 ${fosResults.fos < 1.3 ? 'text-red-600' : 'text-green-600'}`}>
              {fosResults.fos.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* RMR Classification */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Rock Mass Classification (RMR89)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium">Intact Rock Strength</label>
            <select 
              value={rmrParams.strength}
              onChange={(e) => setRmrParams(prev => ({ ...prev, strength: parseInt(e.target.value) }))}
              className="mt-1 w-full rounded border p-2"
            >
              <option value={15}>{'> 250 MPa'}</option>
              <option value={12}>{'100-250 MPa'}</option>
              <option value={7}>{'50-100 MPa'}</option>
              <option value={4}>{'25-50 MPa'}</option>
              <option value={2}>{'5-25 MPa'}</option>
              <option value={1}>{'<5 MPa'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">RQD</label>
            <select 
              value={rmrParams.rqd}
              onChange={(e) => setRmrParams(prev => ({ ...prev, rqd: parseInt(e.target.value) }))}
              className="mt-1 w-full rounded border p-2"
            >
              <option value={20}>{'90-100%'}</option>
              <option value={17}>{'75-90%'}</option>
              <option value={13}>{'50-75%'}</option>
              <option value={8}>{'25-50%'}</option>
              <option value={3}>{'<25%'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Discontinuity Spacing</label>
            <select 
              value={rmrParams.spacing}
              onChange={(e) => setRmrParams(prev => ({ ...prev, spacing: parseInt(e.target.value) }))}
              className="mt-1 w-full rounded border p-2"
            >
              <option value={20}>{'>2m'}</option>
              <option value={15}>{'0.6-2m'}</option>
              <option value={10}>{'0.2-0.6m'}</option>
              <option value={8}>{'0.06-0.2m'}</option>
              <option value={5}>{'<0.06m'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Discontinuity Condition</label>
            <select 
              value={rmrParams.condition}
              onChange={(e) => setRmrParams(prev => ({ ...prev, condition: parseInt(e.target.value) }))}
              className="mt-1 w-full rounded border p-2"
            >
              <option value={30}>{'Very Good'}</option>
              <option value={25}>{'Good'}</option>
              <option value={20}>{'Fair'}</option>
              <option value={10}>{'Poor'}</option>
              <option value={0}>{'Very Poor'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Groundwater</label>
            <select 
              value={rmrParams.groundwater}
              onChange={(e) => setRmrParams(prev => ({ ...prev, groundwater: parseInt(e.target.value) }))}
              className="mt-1 w-full rounded border p-2"
            >
              <option value={15}>{'Dry'}</option>
              <option value={10}>{'Damp'}</option>
              <option value={7}>{'Wet'}</option>
              <option value={4}>{'Dripping'}</option>
              <option value={0}>{'Flowing'}</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleRmrCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Calculate RMR
        </button>
        {rmrResults && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">Total RMR</p>
            <p className="text-5xl font-extrabold text-teal-600">{rmrResults.total}</p>
            <p className="text-lg font-semibold">{rmrResults.rockClass}</p>
          </div>
        )}
        <div className="mt-4 h-64">
          <canvas ref={rmrChartRef}></canvas>
        </div>
      </div>

      {/* Monte Carlo Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Probabilistic Wedge Analysis (Monte Carlo)</h3>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div>
              <label className="text-sm">Slope Face (Dip/Dip Dir)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={monteCarloParams.slopeDip}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, slopeDip: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
                <input 
                  type="number" 
                  value={monteCarloParams.slopeDipDir}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, slopeDipDir: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Joint Set 1 (Dip/Dip Dir)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={monteCarloParams.j1Dip}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, j1Dip: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
                <input 
                  type="number" 
                  value={monteCarloParams.j1DipDir}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, j1DipDir: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Joint Set 2 (Dip/Dip Dir)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={monteCarloParams.j2Dip}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, j2Dip: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
                <input 
                  type="number" 
                  value={monteCarloParams.j2DipDir}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, j2DipDir: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
              </div>
            </div>
            <hr/>
            <div>
              <label className="text-sm">Friction Angle φ° (Mean/Std)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={monteCarloParams.phiMean}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, phiMean: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
                <input 
                  type="number" 
                  value={monteCarloParams.phiStd}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, phiStd: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Cohesion c (kPa) (Mean/Std)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={monteCarloParams.cohMean}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, cohMean: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
                <input 
                  type="number" 
                  value={monteCarloParams.cohStd}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, cohStd: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Other (Unit Wt kN/m³ / Height m)</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  value={monteCarloParams.unitWeight}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, unitWeight: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
                <input 
                  type="number" 
                  value={monteCarloParams.height}
                  onChange={(e) => setMonteCarloParams(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded border p-2" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Simulations</label>
              <input 
                type="number" 
                value={monteCarloParams.iterations}
                onChange={(e) => setMonteCarloParams(prev => ({ ...prev, iterations: parseInt(e.target.value) || 0 }))}
                className="mt-1 w-full rounded border p-2" 
              />
            </div>
            <button 
              onClick={handleMonteCarloRun}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded"
            >
              Run Analysis
            </button>
          </div>
          <div className="xl:col-span-3 space-y-4">
            {showMonteCarloResults && monteCarloResults && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-rose-50 p-4 rounded text-center">
                    <p className="text-sm font-medium text-rose-700">Probability of Failure (Pf)</p>
                    <p className="text-3xl font-extrabold text-rose-600">{monteCarloResults.probFailure.toFixed(1)} %</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded text-center">
                    <p className="text-sm font-medium text-teal-700">Mean FoS</p>
                    <p className="text-3xl font-extrabold text-teal-600">{monteCarloResults.meanFos.toFixed(2)}</p>
                  </div>
                </div>
                <div className="h-56">
                  <canvas ref={fosHistogramRef}></canvas>
                </div>
                <div className="flex justify-center items-center">
                  <svg ref={stereonetRef} width="300" height="300"></svg>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
