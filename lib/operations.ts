// Operations calculations for mining engineering
import { BlastParams, BlastResults, MatchParams, MatchResults, ProductivityParams, ProductivityResults } from './types';
import { Utils } from './utils';

export class OperationsCalculator {
  static calculateBlast(params: BlastParams): BlastResults {
    const { burden, spacing, diameter, height, rockDensity, expDensity, stemming, subdrill } = params;
    
    const holeLength = height + subdrill;
    const chargeLength = holeLength - stemming;
    const volPerHole = burden * spacing * height;
    const tonnesPerHole = volPerHole * rockDensity;
    const expWeightPerHole = (Math.PI * Math.pow(diameter / 2, 2) * chargeLength) * expDensity;
    const powderFactor = tonnesPerHole > 0 ? expWeightPerHole / tonnesPerHole : 0;
    
    return { tonnesPerHole, expWeightPerHole, powderFactor };
  }

  static calculateMatch(params: MatchParams): MatchResults {
    const { bucket, truckCap, density, fill, numTrucks, loaderCycle, truckCycle } = params;
    
    const loaderPayload = bucket * density * fill;
    const passes = loaderPayload > 0 ? truckCap / loaderPayload : 0;
    const loadingTime = passes * loaderCycle;
    const matchFactor = truckCycle > 0 ? (numTrucks * loadingTime) / truckCycle : 0;
    
    return { passes, matchFactor, loadingTime };
  }

  static calculateProductivity(params: ProductivityParams): ProductivityResults {
    const { bucket, density, fill, cycle, efficiency } = params;
    const productivity = (bucket * density * fill * (3600 / cycle) * efficiency);
    return { productivity };
  }

  static renderOperations(container: HTMLElement): void {
    if (!container) return;

    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-6">Operations</h2>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Blast Design (Powder Factor)</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium">Burden (m)</label>
            <input type="number" id="blast-burden" class="mt-1 w-full rounded-md border p-2" value="3">
          </div>
          <div>
            <label class="block text-sm font-medium">Spacing (m)</label>
            <input type="number" id="blast-spacing" class="mt-1 w-full rounded-md border p-2" value="3.5">
          </div>
          <div>
            <label class="block text-sm font-medium">Hole Diameter (mm)</label>
            <input type="number" id="blast-diameter" class="mt-1 w-full rounded-md border p-2" value="150">
          </div>
          <div>
            <label class="block text-sm font-medium">Bench Height (m)</label>
            <input type="number" id="blast-height" class="mt-1 w-full rounded-md border p-2" value="10">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Rock Density (t/m³)</label>
            <input type="number" id="blast-rock-density" class="mt-1 w-full rounded-md border p-2" value="2.7">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Explosive Density (g/cm³)</label>
            <input type="number" id="blast-exp-density" class="mt-1 w-full rounded-md border p-2" value="0.85">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Stemming (m)</label>
            <input type="number" id="blast-stemming" class="mt-1 w-full rounded-md border p-2" value="2.5">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Sub-drill (m)</label>
            <input type="number" id="blast-subdrill" class="mt-1 w-full rounded-md border p-2" value="1">
          </div>
        </div>
        <button id="btn-blast-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded">Calculate</button>
        <div id="blast-results" class="mt-4 hidden p-4 bg-teal-50 rounded"></div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Loader-Truck Match Factor</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium">Loader Bucket (m³)</label>
            <input type="number" id="match-bucket" class="mt-1 w-full rounded-md border p-2" value="12">
          </div>
          <div>
            <label class="block text-sm font-medium">Truck Capacity (t)</label>
            <input type="number" id="match-truck-cap" class="mt-1 w-full rounded-md border p-2" value="100">
          </div>
          <div>
            <label class="block text-sm font-medium">Material Density (t/m³)</label>
            <input type="number" id="match-density" class="mt-1 w-full rounded-md border p-2" value="1.8">
          </div>
          <div>
            <label class="block text-sm font-medium">Bucket Fill Factor (%)</label>
            <input type="number" id="match-fill" class="mt-1 w-full rounded-md border p-2" value="90">
          </div>
          <div class="col-span-full"><hr class="my-2"></div>
          <div>
            <label class="block text-sm font-medium">Trucks in Fleet</label>
            <input type="number" id="match-num-trucks" class="mt-1 w-full rounded-md border p-2" value="5">
          </div>
          <div>
            <label class="block text-sm font-medium">Loader Cycle (s)</label>
            <input type="number" id="match-loader-cycle" class="mt-1 w-full rounded-md border p-2" value="30">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Truck Cycle (min)</label>
            <input type="number" id="match-truck-cycle" class="mt-1 w-full rounded-md border p-2" value="12">
          </div>
        </div>
        <button id="btn-match-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded">Calculate</button>
        <div id="match-results" class="mt-4 hidden p-4 bg-teal-50 rounded"></div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-3">Loader Productivity</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium">Loader Bucket (m³)</label>
            <input type="number" id="prod-bucket" class="mt-1 w-full rounded-md border p-2" value="12">
          </div>
          <div>
            <label class="block text-sm font-medium">Material Density (t/m³)</label>
            <input type="number" id="prod-density" class="mt-1 w-full rounded-md border p-2" value="1.8">
          </div>
          <div>
            <label class="block text-sm font-medium">Bucket Fill Factor (%)</label>
            <input type="number" id="prod-fill" class="mt-1 w-full rounded-md border p-2" value="90">
          </div>
          <div>
            <label class="block text-sm font-medium">Cycle Time (s)</label>
            <input type="number" id="prod-cycle" class="mt-1 w-full rounded-md border p-2" value="45">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Operational Efficiency (%)</label>
            <input type="number" id="prod-eff" class="mt-1 w-full rounded-md border p-2" value="83">
          </div>
        </div>
        <button id="btn-prod-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded">Calculate</button>
        <div id="prod-results" class="mt-4 hidden p-4 bg-teal-50 rounded"></div>
      </div>
    `;

    // Add event listeners
    document.getElementById('btn-blast-calc')?.addEventListener('click', OperationsCalculator.calculateBlastHandler);
    document.getElementById('btn-match-calc')?.addEventListener('click', OperationsCalculator.calculateMatchHandler);
    document.getElementById('btn-prod-calc')?.addEventListener('click', OperationsCalculator.calculateProductivityHandler);
  }

  private static calculateBlastHandler(): void {
    const params: BlastParams = {
      burden: parseFloat((document.getElementById('blast-burden') as HTMLInputElement)?.value || '0'),
      spacing: parseFloat((document.getElementById('blast-spacing') as HTMLInputElement)?.value || '0'),
      diameter: parseFloat((document.getElementById('blast-diameter') as HTMLInputElement)?.value || '0'),
      height: parseFloat((document.getElementById('blast-height') as HTMLInputElement)?.value || '0'),
      rockDensity: parseFloat((document.getElementById('blast-rock-density') as HTMLInputElement)?.value || '0'),
      expDensity: parseFloat((document.getElementById('blast-exp-density') as HTMLInputElement)?.value || '0') * 1000,
      stemming: parseFloat((document.getElementById('blast-stemming') as HTMLInputElement)?.value || '0'),
      subdrill: parseFloat((document.getElementById('blast-subdrill') as HTMLInputElement)?.value || '0')
    };

    const results = OperationsCalculator.calculateBlast(params);
    const el = document.getElementById('blast-results');
    if (el) {
      el.innerHTML = `
        <p><strong>Tonnes per Hole:</strong> ${Utils.formatIN(results.tonnesPerHole)} t</p>
        <p><strong>Explosive per Hole:</strong> ${Utils.formatIN(results.expWeightPerHole)} kg</p>
        <p><strong>Powder Factor:</strong> ${results.powderFactor.toFixed(3)} kg/tonne</p>
      `;
      el.classList.remove('hidden');
    }
  }

  private static calculateMatchHandler(): void {
    const params: MatchParams = {
      bucket: parseFloat((document.getElementById('match-bucket') as HTMLInputElement)?.value || '0'),
      truckCap: parseFloat((document.getElementById('match-truck-cap') as HTMLInputElement)?.value || '0'),
      density: parseFloat((document.getElementById('match-density') as HTMLInputElement)?.value || '0'),
      fill: parseFloat((document.getElementById('match-fill') as HTMLInputElement)?.value || '0') / 100,
      numTrucks: parseInt((document.getElementById('match-num-trucks') as HTMLInputElement)?.value || '0'),
      loaderCycle: parseFloat((document.getElementById('match-loader-cycle') as HTMLInputElement)?.value || '0'),
      truckCycle: parseFloat((document.getElementById('match-truck-cycle') as HTMLInputElement)?.value || '0') * 60
    };

    const results = OperationsCalculator.calculateMatch(params);
    const el = document.getElementById('match-results');
    if (el) {
      const passesClass = results.passes < 3 || results.passes > 6 ? 'text-orange-600' : 'text-green-600';
      el.innerHTML = `
        <p><strong>Passes to Fill:</strong> <span class="${passesClass}">${results.passes.toFixed(1)}</span></p>
        <p><strong>Match Factor:</strong> ${results.matchFactor.toFixed(2)}</p>
      `;
      el.classList.remove('hidden');
    }
    Utils.updateKPI('kpi-mf', results.matchFactor);
  }

  private static calculateProductivityHandler(): void {
    const params: ProductivityParams = {
      bucket: parseFloat((document.getElementById('prod-bucket') as HTMLInputElement)?.value || '0'),
      density: parseFloat((document.getElementById('prod-density') as HTMLInputElement)?.value || '0'),
      fill: parseFloat((document.getElementById('prod-fill') as HTMLInputElement)?.value || '0') / 100,
      cycle: parseFloat((document.getElementById('prod-cycle') as HTMLInputElement)?.value || '0'),
      efficiency: parseFloat((document.getElementById('prod-eff') as HTMLInputElement)?.value || '0') / 100
    };

    const results = OperationsCalculator.calculateProductivity(params);
    const el = document.getElementById('prod-results');
    if (el) {
      el.innerHTML = `<strong>Productivity:</strong> ${Utils.formatIN(results.productivity)} tonnes/hour`;
      el.classList.remove('hidden');
    }
  }
}
