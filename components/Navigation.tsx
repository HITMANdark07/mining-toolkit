// Navigation component
"use client";
import React from 'react';
import { useAppContext } from '../lib/context';

const sections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'economics', label: 'Economics' },
  { id: 'geotechnical', label: 'Geotechnical' },
  { id: 'design', label: 'Design & Stability' },
  { id: 'operations', label: 'Operations' },
  { id: 'tools', label: 'Tools' },
];

export const Navigation: React.FC = () => {
  const { state, setCurrentSection, openModal } = useAppContext();

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <svg className="h-9 w-9 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336-4.5 4.5 0 00-6.336-4.486c-.062.052-.122.107-.178.165m0 0a4.496 4.496 0 01-5.982 6.039m5.982-6.039a4.496 4.496 0 00-5.982 6.039m0 0H3" />
            </svg>
            <h1 className="text-2xl font-bold">Integrated Mining Engineering Suite</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-3">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-3 py-2 rounded-md hover:bg-slate-100 transition-colors ${
                  state.currentSection === section.id ? 'bg-teal-100 text-teal-800' : ''
                }`}
              >
                {section.label}
              </button>
            ))}
            <GlossaryButton />
            <ConverterButton />
          </nav>
        </div>
      </div>
    </header>
  );
};

const GlossaryButton: React.FC = () => {
  const { openModal } = useAppContext();

  const glossaryContent = (
    <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Core Mining Terms</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>Overburden:</strong> Material above a mineral deposit.</div>
          <div><strong>Interburden:</strong> Waste between ore zones.</div>
          <div><strong>Bench:</strong> A single operational level in a pit.</div>
          <div><strong>Swell Factor:</strong> Percentage volume increase of excavated rock.</div>
          <div><strong>Stripping Ratio (SR):</strong> Ratio of waste removed to ore extracted.</div>
          <div><strong>BESR:</strong> Break-Even Stripping Ratio. The maximum economic SR.</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Geotechnical Terms</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>RMR:</strong> Rock Mass Rating classification system.</div>
          <div><strong>FoS:</strong> Factor of Safety - ratio of resisting to driving forces.</div>
          <div><strong>UCS:</strong> Uniaxial Compressive Strength - fundamental rock strength measure.</div>
          <div><strong>Cohesion (c):</strong> Rock's inherent "stickiness" independent of normal stress.</div>
          <div><strong>Friction Angle (φ):</strong> Resistance to frictional sliding, expressed in degrees.</div>
          <div><strong>GSI:</strong> Geological Strength Index for rock mass quality assessment.</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Blasting & Operations</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>Powder Factor:</strong> Explosive weight per tonne of rock blasted.</div>
          <div><strong>Match Factor:</strong> Ratio of loader capacity to truck capacity.</div>
          <div><strong>Burden:</strong> Distance from blasthole to nearest free face.</div>
          <div><strong>Spacing:</strong> Distance between adjacent blastholes.</div>
          <div><strong>Kuz-Ram Model:</strong> Predicts fragmentation size distribution from blasts.</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Financial Terms</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>NPV:</strong> Net Present Value - difference between present value of inflows and outflows.</div>
          <div><strong>IRR:</strong> Internal Rate of Return - discount rate where NPV equals zero.</div>
          <div><strong>CAPEX:</strong> Capital Expenditure - upfront investment for project development.</div>
          <div><strong>DCF:</strong> Discounted Cash Flow - valuation method based on future cash flows.</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Hazard Assessment</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>Rockburst:</strong> Sudden, violent rock failure in high-stress environments.</div>
          <div><strong>Brittleness Index (B):</strong> UCS/Tensile Strength ratio indicating failure tendency.</div>
          <div><strong>Strain Energy Index:</strong> Ratio of stored to dissipated energy in rock.</div>
          <div><strong>Probability of Failure:</strong> Likelihood that FoS will be less than 1.0.</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Pillar Design</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>Width-to-Height Ratio:</strong> Most critical geometric parameter in pillar design.</div>
          <div><strong>Catastrophic Pillar Failure:</strong> Progressive collapse of multiple pillars.</div>
          <div><strong>Tributary Area Theory:</strong> Simplified method for estimating pillar stress.</div>
          <div><strong>Extraction Ratio:</strong> Percentage of orebody removed during mining.</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-base text-teal-700">Advanced Analysis</h4>
        <div className="grid grid-cols-1 gap-2">
          <div><strong>Monte Carlo Simulation:</strong> Computational technique using random sampling for uncertainty modeling.</div>
          <div><strong>Kirsch Equations:</strong> Analytical solutions for stress distribution around circular excavations.</div>
          <div><strong>Ground Response Curve:</strong> Relationship between support pressure and tunnel convergence.</div>
          <div><strong>Hoek-Brown Criterion:</strong> Empirical stress-based criterion for rock mass failure prediction.</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-teal-50 rounded-lg">
        <p className="text-xs text-teal-700">
          <strong>Note:</strong> This glossary covers key terms from the Integrated Mining Engineering Suite. 
          For detailed explanations and methodologies, refer to the comprehensive technical documentation.
        </p>
      </div>
    </div>
  );

  return (
    <button
      onClick={() => openModal('Mining Engineering Glossary', glossaryContent)}
      className="px-3 py-2 rounded-md hover:bg-slate-100"
    >
      Glossary
    </button>
  );
};

const ConverterButton: React.FC = () => {
  const { openModal } = useAppContext();
  const [input, setInput] = React.useState('');
  const [category, setCategory] = React.useState('indian_money');
  const [result, setResult] = React.useState('');

  const handleConvert = () => {
    const value = parseFloat(input) || 0;
    let converted = '';
    
    switch (category) {
      case 'indian_money':
        converted = `${value.toLocaleString('en-IN')} is:<br><strong>${(value / 100000).toFixed(3)}</strong> Lakhs<br><strong>${(value / 10000000).toFixed(4)}</strong> Crores`;
        break;
      case 'length':
        converted = `${value} m is <strong>${(value * 3.28084).toFixed(2)}</strong> feet<br>${value} ft is <strong>${(value / 3.28084).toFixed(2)}</strong> metres`;
        break;
      case 'mass':
        converted = `${value} t is <strong>${(value * 1000).toFixed(2)}</strong> kg<br>${value} kg is <strong>${(value / 1000).toFixed(2)}</strong> tonnes`;
        break;
      case 'pressure':
        converted = `${value} MPa is <strong>${(value * 145.038).toFixed(2)}</strong> PSI<br>${value} PSI is <strong>${(value / 145.038).toFixed(3)}</strong> MPa`;
        break;
      case 'area':
        converted = `${value} m² is <strong>${(value * 10.764).toFixed(2)}</strong> ft²<br>${value} ft² is <strong>${(value / 10.764).toFixed(2)}</strong> m²`;
        break;
      case 'volume':
        converted = `${value} m³ is <strong>${(value * 35.315).toFixed(2)}</strong> ft³<br>${value} ft³ is <strong>${(value / 35.315).toFixed(2)}</strong> m³`;
        break;
    }
    setResult(converted);
  };

  const converterContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-3">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value"
          className="border rounded p-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="indian_money">Indian Money</option>
          <option value="length">Length</option>
          <option value="mass">Mass</option>
          <option value="pressure">Pressure</option>
          <option value="area">Area</option>
          <option value="volume">Volume</option>
        </select>
        <button
          onClick={handleConvert}
          className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700"
        >
          Convert
        </button>
      </div>
      {result && (
        <div 
          className="text-lg font-semibold text-green-600 p-3 bg-slate-50 rounded"
          dangerouslySetInnerHTML={{ __html: result }}
        />
      )}
    </div>
  );

  return (
    <button
      onClick={() => openModal('Unit Converter', converterContent)}
      className="px-3 py-2 rounded-md hover:bg-slate-100"
    >
      Converter
    </button>
  );
};
