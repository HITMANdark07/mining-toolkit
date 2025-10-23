// Design and stability calculations for mining engineering
import { PillarParams, PillarResults, StressParams, StressResults } from './types';
import { Utils } from './utils';

export class DesignCalculator {
  static calculatePillar(params: PillarParams): PillarResults {
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
  }

  static calculateStress(params: StressParams): StressResults {
    const { depth, unitWeight, kRatio, radius, ucs, mb, s, em } = params;
    
    const sv = (depth * unitWeight) / 1000; // Convert to MPa
    const sh = sv * kRatio;
    const sThetaMax = 3 * sh - sv;
    const po = (sv + 2 * sh) / 3;
    const pcr = po - (Math.sqrt(s * ucs ** 2 + (mb * po) ** 2 / 4) - mb * po / 2);
    
    return { sv, sh, sThetaMax, po, pcr };
  }

  static renderDesign(container: HTMLElement): void {
    if (!container) return;

    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-6">Design & Stability</h2>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Pillar Stability (Hard Rock / Coal)</h3>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium">Material</label>
              <select id="pillar-material" class="mt-1 w-full rounded border p-2">
                <option value="hard_rock" selected>Hard Rock (Hedley & Grant)</option>
                <option value="coal">Coal (Salamon & Munro)</option>
              </select>
            </div>
            <div id="hard-rock-inputs">
              <label class="block text-sm font-medium">Rock Mass Strength Constant (K), MPa</label>
              <input type="number" id="pillar-k" class="mt-1 w-full rounded border p-2" value="80">
            </div>
            <div id="coal-inputs" class="hidden text-xs text-slate-500">
              Salamon & Munro: Strength = 1320 * (w^0.46 / h^0.66) psi (converted to MPa).
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm">Pillar Width (w), m</label>
                <input type="number" id="pillar-width" class="mt-1 w-full rounded border p-2" value="15">
              </div>
              <div>
                <label class="block text-sm">Pillar Height (h), m</label>
                <input type="number" id="pillar-height" class="mt-1 w-full rounded border p-2" value="10">
              </div>
              <div>
                <label class="block text-sm">Depth to Pillar, m</label>
                <input type="number" id="pillar-depth" class="mt-1 w-full rounded border p-2" value="500">
              </div>
              <div>
                <label class="block text-sm">Rock Unit Wt, kN/m³</label>
                <input type="number" id="pillar-unit-weight" class="mt-1 w-full rounded border p-2" value="25">
              </div>
              <div class="col-span-2">
                <label class="block text-sm">Extraction Ratio, %</label>
                <input type="number" id="pillar-extraction" class="mt-1 w-full rounded border p-2" value="60">
              </div>
            </div>
            <button id="btn-pillar-calc" class="mt-2 bg-teal-600 text-white px-4 py-2 rounded">Calculate Stability</button>
          </div>
          <div>
            <div class="h-64 mb-4"><canvas id="pillar-stability-chart"></canvas></div>
            <div id="pillar-results" class="p-4 bg-teal-50 rounded"></div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-3">Stress & Ground Support (Kirsch + GRC)</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm">Depth (m)</label>
            <input type="number" id="stress-depth" class="mt-1 w-full rounded border p-2" value="1000">
          </div>
          <div>
            <label class="block text-sm">Unit Wt (kN/m³)</label>
            <input type="number" id="stress-unit-weight" class="mt-1 w-full rounded border p-2" value="27">
          </div>
          <div>
            <label class="block text-sm">Stress Ratio (k)</label>
            <input type="number" id="stress-k-ratio" class="mt-1 w-full rounded border p-2" value="1.5">
          </div>
          <div>
            <label class="block text-sm">Tunnel Radius (m)</label>
            <input type="number" id="stress-radius" class="mt-1 w-full rounded border p-2" value="3">
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label class="block text-sm">UCS (MPa)</label>
            <input type="number" id="grc-ucs" class="mt-1 w-full rounded border p-2" value="85">
          </div>
          <div>
            <label class="block text-sm">m<sub>b</sub></label>
            <input type="number" id="grc-mb" class="mt-1 w-full rounded border p-2" value="4.8" step="0.1">
          </div>
          <div>
            <label class="block text-sm">s</label>
            <input type="number" id="grc-s" class="mt-1 w-full rounded border p-2" value="0.009" step="0.001">
          </div>
          <div>
            <label class="block text-sm">E<sub>m</sub> (GPa)</label>
            <input type="number" id="grc-em" class="mt-1 w-full rounded border p-2" value="30">
          </div>
        </div>
        <button id="btn-stress-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded">Calculate</button>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="h-64"><canvas id="stress-dist-chart"></canvas></div>
          <div class="h-64"><canvas id="grc-chart"></canvas></div>
        </div>
      </div>
    `;

    // Add event listeners
    document.getElementById('pillar-material')?.addEventListener('change', DesignCalculator.togglePillarMaterial);
    document.getElementById('btn-pillar-calc')?.addEventListener('click', DesignCalculator.calculatePillarHandler);
    document.getElementById('btn-stress-calc')?.addEventListener('click', DesignCalculator.calculateStressHandler);
  }

  private static togglePillarMaterial(): void {
    const material = (document.getElementById('pillar-material') as HTMLSelectElement)?.value;
    const isHardRock = material === 'hard_rock';
    
    const hardRockInputs = document.getElementById('hard-rock-inputs');
    const coalInputs = document.getElementById('coal-inputs');
    
    if (hardRockInputs) hardRockInputs.classList.toggle('hidden', !isHardRock);
    if (coalInputs) coalInputs.classList.toggle('hidden', isHardRock);
  }

  private static calculatePillarHandler(): void {
    const material = (document.getElementById('pillar-material') as HTMLSelectElement)?.value as 'hard_rock' | 'coal';
    const params: PillarParams = {
      material,
      width: parseFloat((document.getElementById('pillar-width') as HTMLInputElement)?.value || '0'),
      height: parseFloat((document.getElementById('pillar-height') as HTMLInputElement)?.value || '0'),
      depth: parseFloat((document.getElementById('pillar-depth') as HTMLInputElement)?.value || '0'),
      unitWeight: parseFloat((document.getElementById('pillar-unit-weight') as HTMLInputElement)?.value || '0'),
      extraction: parseFloat((document.getElementById('pillar-extraction') as HTMLInputElement)?.value || '0') / 100,
      k: material === 'hard_rock' ? parseFloat((document.getElementById('pillar-k') as HTMLInputElement)?.value || '0') : undefined
    };

    const results = DesignCalculator.calculatePillar(params);
    const res = document.getElementById('pillar-results');
    if (res) {
      res.innerHTML = `
        <p>Pillar Strength: <strong>${results.strength.toFixed(2)} MPa</strong></p>
        <p>Pillar Stress (Load): <strong>${results.stress.toFixed(2)} MPa</strong></p>
        <p class="mt-2">FoS: <strong class="${results.fos < 1.5 ? 'text-red-600' : 'text-green-600'}">${results.fos.toFixed(2)}</strong></p>
      `;
    }
    
    Utils.updateKPI('kpi-fos', results.fos);
    
    if (document.getElementById('pillar-stability-chart')) {
      Utils.createChart('pillar-stability-chart', 'bar', {
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
      }, '', 'Stress (MPa)');
    }
  }

  private static calculateStressHandler(): void {
    const params: StressParams = {
      depth: parseFloat((document.getElementById('stress-depth') as HTMLInputElement)?.value || '0'),
      unitWeight: parseFloat((document.getElementById('stress-unit-weight') as HTMLInputElement)?.value || '0'),
      kRatio: parseFloat((document.getElementById('stress-k-ratio') as HTMLInputElement)?.value || '0'),
      radius: parseFloat((document.getElementById('stress-radius') as HTMLInputElement)?.value || '0'),
      ucs: parseFloat((document.getElementById('grc-ucs') as HTMLInputElement)?.value || '0'),
      mb: parseFloat((document.getElementById('grc-mb') as HTMLInputElement)?.value || '0'),
      s: parseFloat((document.getElementById('grc-s') as HTMLInputElement)?.value || '0'),
      em: parseFloat((document.getElementById('grc-em') as HTMLInputElement)?.value || '0') * 1000
    };

    const results = DesignCalculator.calculateStress(params);
    const R = params.radius;
    const po = results.po;
    const pcr = results.pcr;
    
    // Generate GRC data
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let pi = po; pi >= 0; pi -= po / 25) {
      let displacement: number;
      if (pi > pcr) {
        displacement = (R * 1.25 / params.em) * (po - pi);
      } else {
        displacement = (R * 1.25 / params.em) * (po - pcr) * Math.pow(pcr / pi, 2 / (params.mb - 1));
      }
      labels.push((displacement / R * 100).toFixed(2));
      data.push(parseFloat(pi.toFixed(2)));
    }
    
    if (document.getElementById('grc-chart')) {
      Utils.createChart('grc-chart', 'line', {
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
      }, 'Convergence (% Radius)', 'Support Pressure (MPa)', {
        plugins: { legend: { display: false } }
      });
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
    
    if (document.getElementById('stress-dist-chart')) {
      Utils.createChart('stress-dist-chart', 'line', {
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
      }, 'Distance from Tunnel Center (r/a)', 'Stress (MPa)');
    }
  }
}
