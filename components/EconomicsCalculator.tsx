// Economics calculator component
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { useAppContext } from '../lib/context';
import { LoMParams, LoMResults, BESRParams, BESRResults } from '../lib/types';

// Register all Chart.js components
Chart.register(...registerables);

export const EconomicsCalculator: React.FC = () => {
  const { state, updateKPI } = useAppContext();
  const [lomParams, setLomParams] = useState<LoMParams>({
    capex: 4175,
    years: 10,
    discountRate: 8,
    price: 12500,
    oreMined: 5,
    wasteMined: 20,
    oreCost: 2100,
    wasteCost: 250,
  });
  
  const [besrParams, setBesrParams] = useState<BESRParams>({
    price: 12500,
    oreCost: 2100,
    wasteCost: 250,
  });

  const [lomResults, setLomResults] = useState<LoMResults | null>(null);
  const [besrResults, setBesrResults] = useState<BESRResults | null>(null);
  const [showLomResults, setShowLomResults] = useState(false);
  const [showBesrResults, setShowBesrResults] = useState(false);

  const lomChartRef = useRef<HTMLCanvasElement>(null);
  const lomChartInstance = useRef<Chart | null>(null);

  const calculateLoM = (params: LoMParams): LoMResults => {
    const {
      capex,
      years,
      discountRate,
      price,
      oreMined,
      wasteMined,
      oreCost,
      wasteCost
    } = params;

    const annualRevenue = oreMined * price;
    const annualCost = (oreMined * oreCost) + (wasteMined * wasteCost);
    const annualCashFlow = (annualRevenue - annualCost) / 1e7; // Convert to crores

    const discountedCashFlows: number[] = [];
    const cumulativeCashFlows: number[] = [];
    let cumulative = -capex;

    for (let i = 1; i <= years; i++) {
      const discountedCf = annualCashFlow / Math.pow(1 + discountRate / 100, i);
      discountedCashFlows.push(discountedCf);
      cumulative += discountedCf;
      cumulativeCashFlows.push(cumulative);
    }

    const npv = discountedCashFlows.reduce((a, b) => a + b, 0) - capex;

    // Calculate IRR using iterative method
    let irr = 0;
    for (let rate = 0; rate < 1; rate += 0.001) {
      let currentNpv = -capex;
      for (let i = 1; i <= years; i++) {
        currentNpv += annualCashFlow / Math.pow(1 + rate, i);
      }
      if (currentNpv > 0) {
        irr = rate;
      } else {
        break;
      }
    }

    return {
      npv,
      irr,
      annualCashFlow,
      discountedCashFlows,
      cumulativeCashFlows
    };
  };

  const calculateBESR = (params: BESRParams): BESRResults => {
    const { price, oreCost, wasteCost } = params;
    const besr = (price - oreCost) / wasteCost;
    return { besr };
  };

  const handleLoMCalculate = () => {
    const results = calculateLoM(lomParams);
    setLomResults(results);
    setShowLomResults(true);
    
    updateKPI('npv', results.npv);
    updateKPI('irr', results.irr * 100);

    // Create chart
    if (lomChartRef.current) {
      if (lomChartInstance.current) {
        lomChartInstance.current.destroy();
      }

      const labels = Array.from({ length: lomParams.years }, (_, i) => `Year ${i + 1}`);
      const cumulativeRaw = [-lomParams.capex];
      for (let i = 0; i < lomParams.years; i++) {
        cumulativeRaw.push(cumulativeRaw[i] + results.annualCashFlow);
      }

      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Cumulative Cash Flow (₹ Cr)',
            data: cumulativeRaw.slice(1),
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

      lomChartInstance.current = new Chart(lomChartRef.current, config);
    }
  };

  const handleBESRCalculate = () => {
    const results = calculateBESR(besrParams);
    setBesrResults(results);
    setShowBesrResults(true);
  };

  const formatIN = (val: number, digits: number = 2): string => {
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: digits });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Economics</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Life-of-Mine (LoM) Financial Planner</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Initial CAPEX (₹ Cr)</label>
            <input 
              type="number" 
              value={lomParams.capex}
              onChange={(e) => setLomParams(prev => ({ ...prev, capex: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Life of Mine (Years)</label>
            <input 
              type="number" 
              value={lomParams.years}
              onChange={(e) => setLomParams(prev => ({ ...prev, years: parseInt(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Discount Rate (%)</label>
            <input 
              type="number" 
              value={lomParams.discountRate}
              onChange={(e) => setLomParams(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Commodity Price (₹/t)</label>
            <input 
              type="number" 
              value={lomParams.price}
              onChange={(e) => setLomParams(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-full"><hr className="my-2" /></div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Annual Ore Mined (Mt)</label>
            <input 
              type="number" 
              value={lomParams.oreMined}
              onChange={(e) => setLomParams(prev => ({ ...prev, oreMined: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Annual Waste Mined (Mt)</label>
            <input 
              type="number" 
              value={lomParams.wasteMined}
              onChange={(e) => setLomParams(prev => ({ ...prev, wasteMined: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Ore Cost (₹/t)</label>
            <input 
              type="number" 
              value={lomParams.oreCost}
              onChange={(e) => setLomParams(prev => ({ ...prev, oreCost: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Waste Cost (₹/t)</label>
            <input 
              type="number" 
              value={lomParams.wasteCost}
              onChange={(e) => setLomParams(prev => ({ ...prev, wasteCost: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleLoMCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Calculate Financials
        </button>
        {showLomResults && lomResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <p><strong>NPV:</strong> ₹ {formatIN(lomResults.npv)} Cr</p>
            <p><strong>IRR:</strong> {(lomResults.irr * 100).toFixed(2)} %</p>
            <p><strong>Annual Cash Flow:</strong> ₹ {formatIN(lomResults.annualCashFlow)} Cr</p>
          </div>
        )}
        <div className="relative h-72 mt-6">
          <canvas ref={lomChartRef}></canvas>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Break-Even Stripping Ratio (BESR)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Commodity Price (₹/t)</label>
            <input 
              type="number" 
              value={besrParams.price}
              onChange={(e) => setBesrParams(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Ore Mining & Processing Cost (₹/t)</label>
            <input 
              type="number" 
              value={besrParams.oreCost}
              onChange={(e) => setBesrParams(prev => ({ ...prev, oreCost: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Waste Mining Cost (₹/t)</label>
            <input 
              type="number" 
              value={besrParams.wasteCost}
              onChange={(e) => setBesrParams(prev => ({ ...prev, wasteCost: parseFloat(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-md border p-2" 
            />
          </div>
        </div>
        <button 
          onClick={handleBESRCalculate}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Calculate BESR
        </button>
        {showBesrResults && besrResults && (
          <div className="mt-4 p-4 bg-teal-50 rounded">
            <strong>Break-Even Stripping Ratio:</strong> {besrResults.besr.toFixed(2)} (Waste : Ore)
          </div>
        )}
      </div>
    </div>
  );
};
