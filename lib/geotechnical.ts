// Geotechnical calculations for mining engineering
import { FoSParams, FoSResults, RMRParams, RMRResults, RockburstParams, RockburstResults, MonteCarloParams, MonteCarloResults } from './types';
import { Utils, d3 } from './utils';

export class GeotechnicalCalculator {
  static calculateFoS(params: FoSParams): FoSResults {
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
  }

  static calculateRMR(params: RMRParams): RMRResults {
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
  }

  static calculateRockburst(params: RockburstParams): RockburstResults {
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
  }

  static runMonteCarlo(params: MonteCarloParams): MonteCarloResults {
    const { iterations, phiMean, phiStd, cohMean, cohStd, height, unitWeight, j1Dip, j2Dip } = params;
    
    const psi_p = Math.max(j1Dip, j2Dip) * Math.PI / 180;
    let failures = 0;
    let fosSum = 0;
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const phi = this.randomNormal(phiMean, phiStd);
      const coh = Math.max(0, this.randomNormal(cohMean, cohStd));
      
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
  }

  private static randomNormal(mean: number, std: number): number {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * std + mean;
  }

  static renderGeotechnical(container: HTMLElement): void {
    if (!container) return;

    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-6">Geotechnical & Hazards</h2>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Rockburst Hazard Assessment</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div><label class="text-sm">UCS (σc), MPa</label><input type="number" id="rb-ucs" value="150" class="mt-1 w-full rounded border p-2"></div>
          <div><label class="text-sm">Tensile Strength (σt), MPa</label><input type="number" id="rb-tensile" value="10" class="mt-1 w-full rounded border p-2"></div>
          <div><label class="text-sm">Max Tangential Stress, MPa</label><input type="number" id="rb-stress" value="85" class="mt-1 w-full rounded border p-2"></div>
          <div><label class="text-sm">Elastic Energy (Ue)</label><input type="number" id="rb-ue" value="6" class="mt-1 w-full rounded border p-2"></div>
          <div><label class="text-sm">Dissipated Energy (Ud)</label><input type="number" id="rb-ud" value="1" class="mt-1 w-full rounded border p-2"></div>
        </div>
        <button id="btn-rb-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded">Assess Hazard</button>
        <div id="rb-results" class="mt-4 p-4 bg-teal-50 rounded"></div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Simplified Slope Stability (Factor of Safety)</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div><label class="block text-sm">Cohesion (kPa)</label><input type="number" id="fos-cohesion" class="mt-1 w-full rounded border p-2" value="25"></div>
          <div><label class="block text-sm">Friction Angle (°)</label><input type="number" id="fos-friction" class="mt-1 w-full rounded border p-2" value="35"></div>
          <div><label class="block text-sm">Slope Angle (°)</label><input type="number" id="fos-slope" class="mt-1 w-full rounded border p-2" value="45"></div>
          <div><label class="block text-sm">Bench Height (m)</label><input type="number" id="fos-height" class="mt-1 w-full rounded border p-2" value="15"></div>
          <div><label class="block text-sm">Unit Weight (kN/m³)</label><input type="number" id="fos-weight" class="mt-1 w-full rounded border p-2" value="27"></div>
        </div>
        <button id="btn-fos-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded">Calculate FoS</button>
        <div id="fos-results" class="mt-4 hidden p-4 bg-teal-50 rounded"></div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Rock Mass Classification (RMR89)</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4" id="rmr-form"></div>
        <div class="mt-4 text-center">
          <p class="text-sm text-slate-600">Total RMR</p>
          <p id="rmr-score" class="text-5xl font-extrabold text-teal-600">--</p>
          <p id="rmr-class" class="text-lg font-semibold">--</p>
        </div>
        <div class="mt-4 h-64"><canvas id="rmr-breakdown-chart"></canvas></div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-3">Probabilistic Wedge Analysis (Monte Carlo)</h3>
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div class="xl:col-span-2 space-y-4">
            <div><label class="text-sm">Slope Face (Dip/Dip Dir)</label><div class="flex gap-2 mt-1"><input type="number" id="slope-dip" value="70" class="w-full rounded border p-2"><input type="number" id="slope-dipdir" value="180" class="w-full rounded border p-2"></div></div>
            <div><label class="text-sm">Joint Set 1 (Dip/Dip Dir)</label><div class="flex gap-2 mt-1"><input type="number" id="j1-dip" value="45" class="w-full rounded border p-2"><input type="number" id="j1-dipdir" value="135" class="w-full rounded border p-2"></div></div>
            <div><label class="text-sm">Joint Set 2 (Dip/Dip Dir)</label><div class="flex gap-2 mt-1"><input type="number" id="j2-dip" value="55" class="w-full rounded border p-2"><input type="number" id="j2-dipdir" value="225" class="w-full rounded border p-2"></div></div>
            <hr/>
            <div><label class="text-sm">Friction Angle φ° (Mean/Std)</label><div class="flex gap-2 mt-1"><input type="number" id="phi-mean" value="35" class="w-full rounded border p-2"><input type="number" id="phi-std" value="5" class="w-full rounded border p-2"></div></div>
            <div><label class="text-sm">Cohesion c (kPa) (Mean/Std)</label><div class="flex gap-2 mt-1"><input type="number" id="coh-mean" value="15" class="w-full rounded border p-2"><input type="number" id="coh-std" value="5" class="w-full rounded border p-2"></div></div>
            <div><label class="text-sm">Other (Unit Wt kN/m³ / Height m)</label><div class="flex gap-2 mt-1"><input type="number" id="rock-unit-weight" value="27" class="w-full rounded border p-2"><input type="number" id="wedge-height" value="20" class="w-full rounded border p-2"></div></div>
            <div><label class="text-sm">Simulations</label><input type="number" id="sim-count" value="5000" class="mt-1 w-full rounded border p-2"></div>
            <button id="btn-run-sim" class="w-full bg-teal-600 text-white px-4 py-2 rounded">Run Analysis</button>
          </div>
          <div class="xl:col-span-3 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-rose-50 p-4 rounded text-center"><p class="text-sm font-medium text-rose-700">Probability of Failure (Pf)</p><p id="prob-failure" class="text-3xl font-extrabold text-rose-600">- %</p></div>
              <div class="bg-teal-50 p-4 rounded text-center"><p class="text-sm font-medium text-teal-700">Mean FoS</p><p id="mean-fos" class="text-3xl font-extrabold text-teal-600">-</p></div>
            </div>
            <div class="h-56"><canvas id="fos-histogram"></canvas></div>
            <div class="flex justify-center items-center"><svg id="stereonet" width="300" height="300"></svg></div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('btn-rb-calc')?.addEventListener('click', GeotechnicalCalculator.calculateRockburstHandler);
    document.getElementById('btn-fos-calc')?.addEventListener('click', GeotechnicalCalculator.calculateFoSHandler);
    document.getElementById('btn-run-sim')?.addEventListener('click', GeotechnicalCalculator.runMonteCarloHandler);
    
    // Initialize RMR form
    GeotechnicalCalculator.buildRMRForm();
    GeotechnicalCalculator.calculateRMRHandler();
    
    // Draw initial stereonet
    GeotechnicalCalculator.drawStereonet();
  }

  private static calculateRockburstHandler(): void {
    const params: RockburstParams = {
      ucs: parseFloat((document.getElementById('rb-ucs') as HTMLInputElement)?.value || '0'),
      tensile: parseFloat((document.getElementById('rb-tensile') as HTMLInputElement)?.value || '0'),
      stress: parseFloat((document.getElementById('rb-stress') as HTMLInputElement)?.value || '0'),
      ue: parseFloat((document.getElementById('rb-ue') as HTMLInputElement)?.value || '0'),
      ud: parseFloat((document.getElementById('rb-ud') as HTMLInputElement)?.value || '0')
    };

    const results = GeotechnicalCalculator.calculateRockburst(params);
    const el = document.getElementById('rb-results');
    if (el) {
      const riskClass = results.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                      results.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                      results.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';
      
      el.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm">Stress/Strength Ratio</p>
            <p class="text-2xl font-bold">${results.ssr.toFixed(2)}</p>
            <span class="px-2 py-1 rounded ${riskClass}">${results.riskLevel}</span>
          </div>
          <div>
            <p class="text-sm">Brittleness Index (B)</p>
            <p class="text-2xl font-bold">${results.brittleness.toFixed(1)}</p>
          </div>
          <div>
            <p class="text-sm">Strain Energy Index (Wet)</p>
            <p class="text-2xl font-bold">${results.wet.toFixed(1)}</p>
            <p class="text-sm">Risk: ${results.wetRisk}</p>
          </div>
        </div>
      `;
    }
    Utils.updateKPI('kpi-rockburst', results.riskLevel);
  }

  private static calculateFoSHandler(): void {
    const params: FoSParams = {
      cohesion: parseFloat((document.getElementById('fos-cohesion') as HTMLInputElement)?.value || '0'),
      friction: parseFloat((document.getElementById('fos-friction') as HTMLInputElement)?.value || '0'),
      slope: parseFloat((document.getElementById('fos-slope') as HTMLInputElement)?.value || '0'),
      height: parseFloat((document.getElementById('fos-height') as HTMLInputElement)?.value || '0'),
      unitWeight: parseFloat((document.getElementById('fos-weight') as HTMLInputElement)?.value || '0')
    };

    const results = GeotechnicalCalculator.calculateFoS(params);
    const el = document.getElementById('fos-results');
    if (el) {
      el.innerHTML = `
        <strong>Factor of Safety (FoS):</strong> 
        <span class="text-xl ${results.fos < 1.3 ? 'text-red-600' : 'text-green-600'}">${results.fos.toFixed(2)}</span>
      `;
      el.classList.remove('hidden');
    }
    Utils.updateKPI('kpi-fos', results.fos);
  }

  private static buildRMRForm(): void {
    const rmrParams = {
      strength: { label: 'Intact Rock Strength', options: { '> 250 MPa': 15, '100-250 MPa': 12, '50-100 MPa': 7, '25-50 MPa': 4, '5-25 MPa': 2, '<5 MPa': 1 } },
      rqd: { label: 'RQD', options: { '90-100%': 20, '75-90%': 17, '50-75%': 13, '25-50%': 8, '<25%': 3 } },
      spacing: { label: 'Discontinuity Spacing', options: { '>2m': 20, '0.6-2m': 15, '0.2-0.6m': 10, '0.06-0.2m': 8, '<0.06m': 5 } },
      condition: { label: 'Discontinuity Condition', options: { 'Very Good': 30, 'Good': 25, 'Fair': 20, 'Poor': 10, 'Very Poor': 0 } },
      groundwater: { label: 'Groundwater', options: { 'Dry': 15, 'Damp': 10, 'Wet': 7, 'Dripping': 4, 'Flowing': 0 } }
    };

    const form = document.getElementById('rmr-form');
    if (form) {
      form.innerHTML = Object.entries(rmrParams).map(([key, val]) => `
        <div>
          <label class="block text-sm font-medium">${val.label}</label>
          <select id="rmr-${key}" class="mt-1 w-full rounded border p-2">
            ${Object.entries(val.options).map(([t, v]) => `<option value="${v}">${t}</option>`).join('')}
          </select>
        </div>
      `).join('');

      form.querySelectorAll('select').forEach(s => {
        s.addEventListener('change', GeotechnicalCalculator.calculateRMRHandler);
      });
    }
  }

  private static calculateRMRHandler(): void {
    const selects = Array.from(document.querySelectorAll('#rmr-form select')) as HTMLSelectElement[];
    const values = selects.map(s => Number(s.value));
    const total = values.reduce((a, b) => a + b, 0);
    
    let rockClass = "V - Very Poor";
    if (total > 80) rockClass = "I - Very Good";
    else if (total > 60) rockClass = "II - Good";
    else if (total > 40) rockClass = "III - Fair";
    else if (total > 20) rockClass = "IV - Poor";
    
    const scoreEl = document.getElementById('rmr-score');
    const classEl = document.getElementById('rmr-class');
    if (scoreEl) scoreEl.textContent = total.toString();
    if (classEl) classEl.textContent = rockClass;
    
    Utils.updateKPI('kpi-rmr', total);
    
    if (document.getElementById('rmr-breakdown-chart')) {
      Utils.createChart('rmr-breakdown-chart', 'bar', {
        labels: ['Strength', 'RQD', 'Spacing', 'Condition', 'Water'],
        datasets: [{
          label: 'Rating',
          data: values,
          backgroundColor: ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1']
        }]
      }, '', 'Rating', {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { max: 30 } }
      });
    }
  }

  private static runMonteCarloHandler(): void {
    const params: MonteCarloParams = {
      slopeDip: parseFloat((document.getElementById('slope-dip') as HTMLInputElement)?.value || '0'),
      slopeDipDir: parseFloat((document.getElementById('slope-dipdir') as HTMLInputElement)?.value || '0'),
      j1Dip: parseFloat((document.getElementById('j1-dip') as HTMLInputElement)?.value || '0'),
      j1DipDir: parseFloat((document.getElementById('j1-dipdir') as HTMLInputElement)?.value || '0'),
      j2Dip: parseFloat((document.getElementById('j2-dip') as HTMLInputElement)?.value || '0'),
      j2DipDir: parseFloat((document.getElementById('j2-dipdir') as HTMLInputElement)?.value || '0'),
      phiMean: parseFloat((document.getElementById('phi-mean') as HTMLInputElement)?.value || '0'),
      phiStd: parseFloat((document.getElementById('phi-std') as HTMLInputElement)?.value || '0'),
      cohMean: parseFloat((document.getElementById('coh-mean') as HTMLInputElement)?.value || '0'),
      cohStd: parseFloat((document.getElementById('coh-std') as HTMLInputElement)?.value || '0'),
      unitWeight: parseFloat((document.getElementById('rock-unit-weight') as HTMLInputElement)?.value || '0'),
      height: parseFloat((document.getElementById('wedge-height') as HTMLInputElement)?.value || '0'),
      iterations: parseInt((document.getElementById('sim-count') as HTMLInputElement)?.value || '5000')
    };

    const results = GeotechnicalCalculator.runMonteCarlo(params);
    
    const probEl = document.getElementById('prob-failure');
    const meanEl = document.getElementById('mean-fos');
    if (probEl) probEl.textContent = `${results.probFailure.toFixed(1)} %`;
    if (meanEl) meanEl.textContent = results.meanFos.toFixed(2);
    
    // Create histogram
    const bins = Array(20).fill(0);
    const minFos = Math.min(0, ...results.fosResults);
    const maxFos = Math.max(3, ...results.fosResults);
    const binWidth = (maxFos - minFos) / 20;
    
    results.fosResults.forEach(fos => {
      const idx = Math.min(19, Math.floor((fos - minFos) / binWidth));
      bins[idx]++;
    });
    
    if (document.getElementById('fos-histogram')) {
      Utils.createChart('fos-histogram', 'bar', {
        labels: bins.map((_, i) => (minFos + i * binWidth).toFixed(2)),
        datasets: [{
          label: 'Frequency',
          data: bins,
          backgroundColor: '#14b8a6'
        }]
      }, 'Factor of Safety', 'Frequency');
    }
    
    GeotechnicalCalculator.drawStereonet();
  }

  private static drawStereonet(): void {
    const width = 300, height = 300;
    const svg = d3.select('#stereonet');
    if (svg.empty()) return;
    
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
    
    const slope_dip = parseFloat((document.getElementById('slope-dip') as HTMLInputElement)?.value || '0');
    const slope_dipdir = parseFloat((document.getElementById('slope-dipdir') as HTMLInputElement)?.value || '0');
    const j1_dip = parseFloat((document.getElementById('j1-dip') as HTMLInputElement)?.value || '0');
    const j1_dipdir = parseFloat((document.getElementById('j1-dipdir') as HTMLInputElement)?.value || '0');
    const j2_dip = parseFloat((document.getElementById('j2-dip') as HTMLInputElement)?.value || '0');
    const j2_dipdir = parseFloat((document.getElementById('j2-dipdir') as HTMLInputElement)?.value || '0');
    
    const poles = [
      { ...plotPole(slope_dip, slope_dipdir), color: '#f87171', label: `Slope ${slope_dip}/${slope_dipdir}` },
      { ...plotPole(j1_dip, j1_dipdir), color: '#3b82f6', label: `J1 ${j1_dip}/${j1_dipdir}` },
      { ...plotPole(j2_dip, j2_dipdir), color: '#16a34a', label: `J2 ${j2_dip}/${j2_dipdir}` }
    ];
    
    const tooltip = d3.select('#tooltip');
    g.selectAll('circle.pole').data(poles).enter().append('circle')
      .attr('class', 'pole')
      .attr('r', 5)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('fill', (d: any) => d.color)
      .on('mouseover', (event: any, d: any) => {
        tooltip.style('opacity', 1).html(d.label)
          .style('left', (event.pageX + 10) + "px")
          .style('top', (event.pageY - 28) + "px");
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  }
}
