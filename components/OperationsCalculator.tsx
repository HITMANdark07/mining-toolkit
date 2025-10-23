// Operations calculator component
"use client";
import React, { useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { useAppContext } from '../lib/context';
import { BlastParams, BlastResults, MatchParams, MatchResults, ProductivityParams, ProductivityResults } from '../lib/types';

// Register all Chart.js components
Chart.register(...registerables);

export const OperationsCalculator: React.FC = () => {
  const { state, updateKPI } = useAppContext();
  
  // Blast Design State
  const [blastParams, setBlastParams] = useState<BlastParams>({
    burden: 3,
    spacing: 3.5,
    diameter: 150,
    height: 10,
    rockDensity: 2.7,
    expDensity: 0.85,
    stemming: 2.5,
    subdrill: 1,
  });
  const [blastResults, setBlastResults] = useState<BlastResults | null>(null);
  const [showBlastResults, setShowBlastResults] = useState(false);

  // Match Factor State
  const [matchParams, setMatchParams] = useState<MatchParams>({
    bucket: 12,
    truckCap: 100,
    density: 1.8,
    fill: 90,
    numTrucks: 5,
    loaderCycle: 30,
    truckCycle: 12,
  });
  const [matchResults, setMatchResults] = useState<MatchResults | null>(null);
  const [showMatchResults, setShowMatchResults] = useState(false);

  // Productivity State
  const [productivityParams, setProductivityParams] = useState<ProductivityParams>({
    bucket: 12,
    density: 1.8,
    fill: 90,
    cycle: 45,
    efficiency: 83,
  });
  const [productivityResults, setProductivityResults] = useState<ProductivityResults | null>(null);
  const [showProductivityResults, setShowProductivityResults] = useState(false);

  // Calculation functions
  const calculateBlast = (params: BlastParams): BlastResults => {
    const { burden, spacing, diameter, height, rockDensity, expDensity, stemming, subdrill } = params;
    
    const holeLength = height + subdrill;
    const chargeLength = holeLength - stemming;
    const volPerHole = burden * spacing * height;
    const tonnesPerHole = volPerHole * rockDensity;
    const expWeightPerHole = (Math.PI * Math.pow(diameter / 2, 2) * chargeLength) * expDensity;
    const powderFactor = tonnesPerHole > 0 ? expWeightPerHole / tonnesPerHole : 0;
    
    return { tonnesPerHole, expWeightPerHole, powderFactor };
  };

  const calculateMatch = (params: MatchParams): MatchResults => {
    const { bucket, truckCap, density, fill, numTrucks, loaderCycle, truckCycle } = params;
    
    const loaderPayload = bucket * density * fill;
    const passes = loaderPayload > 0 ? truckCap / loaderPayload : 0;
    const loadingTime = passes * loaderCycle;
    const matchFactor = truckCycle > 0 ? (numTrucks * loadingTime) / truckCycle : 0;
    
    return { passes, matchFactor, loadingTime };
  };

  const calculateProductivity = (params: ProductivityParams): ProductivityResults => {
    const { bucket, density, fill, cycle, efficiency } = params;
    const productivity = (bucket * density * fill * (3600 / cycle) * efficiency);
    return { productivity };
  };

  const formatIN = (val: number, digits: number = 2): string => {
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: digits });
  };

  // Event handlers
  const handleBlastCalculate = () => {
    const results = calculateBlast(blastParams);
    setBlastResults(results);
    setShowBlastResults(true);
  };

  const handleMatchCalculate = () => {
    const results = calculateMatch(matchParams);
    setMatchResults(results);
    setShowMatchResults(true);
    updateKPI('matchFactor', results.matchFactor);
  };

  const handleProductivityCalculate = () => {
    const results = calculateProductivity(productivityParams);
    setProductivityResults(results);
    setShowProductivityResults(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Operations</h2>
      
      {/* Blast Design */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Blast Design (Powder Factor)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Burden (m)</label>
            <input 
              type="number" 
              value={blastParams.burden}
              onChange={(e) => setBlastParams(prev => ({ ...prev, burden: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Spacing (m)</label>
            <input 
              type="number" 
              value={blastParams.spacing}
              onChange={(e) => setBlastParams(prev => ({ ...prev, spacing: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Hole Diameter (mm)</label>
            <input 
              type="number" 
              value={blastParams.diameter}
              onChange={(e) => setBlastParams(prev => ({ ...prev, diameter: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bench Height (m)</label>
            <input 
              type="number" 
              value={blastParams.height}
              onChange={(e) => setBlastParams(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Rock Density (t/m³)</label>
            <input 
              type="number" 
              value={blastParams.rockDensity}
              onChange={(e) => setBlastParams(prev => ({ ...prev, rockDensity: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Explosive Density (g/cm³)</label>
            <input 
              type="number" 
              value={blastParams.expDensity}
              onChange={(e) => setBlastParams(prev => ({ ...prev, expDensity: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Stemming (m)</label>
            <input 
              type="number" 
              value={blastParams.stemming}
              onChange={(e) => setBlastParams(prev => ({ ...prev, stemming: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Sub-drill (m)</label>
            <input 
              type="number" 
              value={blastParams.subdrill}
              onChange={(e) => setBlastParams(prev => ({ ...prev, subdrill: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleBlastCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Calculate
        </button>
        {showBlastResults && blastResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <p><strong>Tonnes per Hole:</strong> {formatIN(blastResults.tonnesPerHole)} t</p>
            <p><strong>Explosive per Hole:</strong> {formatIN(blastResults.expWeightPerHole)} kg</p>
            <p><strong>Powder Factor:</strong> {blastResults.powderFactor.toFixed(3)} kg/tonne</p>
          </div>
        )}
      </div>

      {/* Match Factor */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Loader-Truck Match Factor</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Loader Bucket (m³)</label>
            <input 
              type="number" 
              value={matchParams.bucket}
              onChange={(e) => setMatchParams(prev => ({ ...prev, bucket: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Truck Capacity (t)</label>
            <input 
              type="number" 
              value={matchParams.truckCap}
              onChange={(e) => setMatchParams(prev => ({ ...prev, truckCap: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Material Density (t/m³)</label>
            <input 
              type="number" 
              value={matchParams.density}
              onChange={(e) => setMatchParams(prev => ({ ...prev, density: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bucket Fill Factor (%)</label>
            <input 
              type="number" 
              value={matchParams.fill}
              onChange={(e) => setMatchParams(prev => ({ ...prev, fill: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-full"><hr className="my-2" /></div>
          <div>
            <label className="block text-sm font-medium">Trucks in Fleet</label>
            <input 
              type="number" 
              value={matchParams.numTrucks}
              onChange={(e) => setMatchParams(prev => ({ ...prev, numTrucks: parseInt(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Loader Cycle (s)</label>
            <input 
              type="number" 
              value={matchParams.loaderCycle}
              onChange={(e) => setMatchParams(prev => ({ ...prev, loaderCycle: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Truck Cycle (min)</label>
            <input 
              type="number" 
              value={matchParams.truckCycle}
              onChange={(e) => setMatchParams(prev => ({ ...prev, truckCycle: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleMatchCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Calculate
        </button>
        {showMatchResults && matchResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <p>
              <strong>Passes to Fill:</strong> 
              <span className={`ml-2 ${matchResults.passes < 3 || matchResults.passes > 6 ? 'text-orange-600' : 'text-green-600'}`}>
                {matchResults.passes.toFixed(1)}
              </span>
            </p>
            <p><strong>Match Factor:</strong> {matchResults.matchFactor.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Productivity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Loader Productivity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Loader Bucket (m³)</label>
            <input 
              type="number" 
              value={productivityParams.bucket}
              onChange={(e) => setProductivityParams(prev => ({ ...prev, bucket: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Material Density (t/m³)</label>
            <input 
              type="number" 
              value={productivityParams.density}
              onChange={(e) => setProductivityParams(prev => ({ ...prev, density: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bucket Fill Factor (%)</label>
            <input 
              type="number" 
              value={productivityParams.fill}
              onChange={(e) => setProductivityParams(prev => ({ ...prev, fill: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Cycle Time (s)</label>
            <input 
              type="number" 
              value={productivityParams.cycle}
              onChange={(e) => setProductivityParams(prev => ({ ...prev, cycle: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Operational Efficiency (%)</label>
            <input 
              type="number" 
              value={productivityParams.efficiency}
              onChange={(e) => setProductivityParams(prev => ({ ...prev, efficiency: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleProductivityCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
        >
          Calculate
        </button>
        {showProductivityResults && productivityResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <strong>Productivity:</strong> {formatIN(productivityResults.productivity)} tonnes/hour
          </div>
        )}
      </div>
    </div>
  );
};
