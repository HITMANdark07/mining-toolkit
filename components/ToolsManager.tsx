// Tools manager component
"use client";
import React, { useState, useRef } from 'react';
import { useAppContext } from '../lib/context';
import { Utils } from '../lib/utils';
import { RockProperty } from '../lib/types';

export const ToolsManager: React.FC = () => {
  const { state, saveSession, loadSession, clearSession, openModal } = useAppContext();
  
  // Rock Database State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRock, setSelectedRock] = useState<RockProperty | null>(null);
  const [showRockDetails, setShowRockDetails] = useState(false);

  // Export State
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);

  // Rock database
  const rockDatabase: RockProperty[] = [
    { name: 'Granite', ucs: 150, density: 2.7, tensile: 8, youngs: 50, poisson: 0.25, description: 'Hard igneous rock' },
    { name: 'Basalt', ucs: 200, density: 2.9, tensile: 10, youngs: 60, poisson: 0.25, description: 'Hard volcanic rock' },
    { name: 'Sandstone', ucs: 80, density: 2.2, tensile: 4, youngs: 20, poisson: 0.3, description: 'Sedimentary rock' },
    { name: 'Limestone', ucs: 100, density: 2.5, tensile: 5, youngs: 30, poisson: 0.3, description: 'Carbonate rock' },
    { name: 'Shale', ucs: 30, density: 2.4, tensile: 2, youngs: 10, poisson: 0.35, description: 'Fine-grained sedimentary' },
    { name: 'Coal', ucs: 20, density: 1.3, tensile: 1, youngs: 5, poisson: 0.4, description: 'Organic sedimentary rock' },
    { name: 'Quartzite', ucs: 180, density: 2.6, tensile: 9, youngs: 55, poisson: 0.25, description: 'Metamorphic quartz rock' },
    { name: 'Gneiss', ucs: 120, density: 2.7, tensile: 6, youngs: 40, poisson: 0.28, description: 'Foliated metamorphic rock' },
    { name: 'Marble', ucs: 90, density: 2.7, tensile: 4, youngs: 35, poisson: 0.3, description: 'Metamorphic carbonate' },
    { name: 'Schist', ucs: 60, density: 2.8, tensile: 3, youngs: 25, poisson: 0.32, description: 'Foliated metamorphic' },
  ];

  // Filter rocks based on search term
  const filteredRocks = rockDatabase.filter(rock => 
    rock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rock.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Event handlers
  const handleRockSelect = (rock: RockProperty) => {
    setSelectedRock(rock);
    setShowRockDetails(true);
  };

  const handleExport = () => {
    const options = {
      format: exportFormat,
      includeCharts,
      filename: `mining-analysis-${new Date().toISOString().split('T')[0]}`
    };
    
    if (exportFormat === 'pdf') {
      // Simple PDF export placeholder
      alert('PDF export functionality will be implemented');
    } else {
      // Simple CSV export placeholder
      alert('CSV export functionality will be implemented');
    }
  };

  const handleSessionSave = () => {
    saveSession('current', state);
    alert('Session saved successfully!');
  };

  const handleSessionLoad = () => {
    const data = loadSession('current');
    if (data) {
      alert('Session loaded successfully!');
    } else {
      alert('No session data found!');
    }
  };

  const handleSessionClear = () => {
    if (confirm('Are you sure you want to clear all session data?')) {
      clearSession();
      alert('Session cleared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">Utilities & Database</h2>
      
      {/* Session Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Session Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleSessionSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Session
          </button>
          <button 
            onClick={handleSessionLoad}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Load Session
          </button>
          <button 
            onClick={handleSessionClear}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Session
          </button>
        </div>
        {state.sessionData && Object.keys(state.sessionData).length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              Session data available: {Object.keys(state.sessionData).length} items
            </p>
          </div>
        )}
      </div>

      {/* Export Tools */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Export Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv')}
              className="w-full rounded border p-2"
            >
              <option value="pdf">PDF Report</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="includeCharts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeCharts" className="text-sm">Include Charts</label>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Export Results
        </button>
      </div>

      {/* Rock Database */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">Rock Properties Database</h3>
        <div className="mb-4">
          <input 
            type="text"
            placeholder="Search rocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRocks.map((rock, index) => (
            <div 
              key={index}
              onClick={() => handleRockSelect(rock)}
              className="p-4 border rounded cursor-pointer hover:bg-slate-50"
            >
              <h4 className="font-semibold">{rock.name}</h4>
              <p className="text-sm text-slate-600">{rock.description}</p>
              <div className="mt-2 text-xs">
                <p>UCS: {rock.ucs} MPa</p>
                <p>Density: {rock.density} g/cm³</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rock Details Modal */}
      {showRockDetails && selectedRock && (
        <div className="fixed h-full inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedRock.name}</h3>
              <button 
                onClick={() => setShowRockDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unconfined Compressive Strength</label>
                <p className="text-lg">{selectedRock.ucs} MPa</p>
              </div>
              <div>
                <label className="text-sm font-medium">Density</label>
                <p className="text-lg">{selectedRock.density} g/cm³</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tensile Strength</label>
                <p className="text-lg">{selectedRock.tensile} MPa</p>
              </div>
              <div>
                <label className="text-sm font-medium">Young's Modulus</label>
                <p className="text-lg">{selectedRock.youngs} GPa</p>
              </div>
              <div>
                <label className="text-sm font-medium">Poisson's Ratio</label>
                <p className="text-lg">{selectedRock.poisson}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-slate-600">{selectedRock.description}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowRockDetails(false)}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
