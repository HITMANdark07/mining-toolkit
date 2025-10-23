// Economics calculations for mining engineering
import { LoMParams, LoMResults, BESRParams, BESRResults } from './types';
import { Utils } from './utils';

export class EconomicsCalculator {
  static calculateLoM(params: LoMParams): LoMResults {
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
      const discountedCf = annualCashFlow / Math.pow(1 + discountRate, i);
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
  }

  static calculateBESR(params: BESRParams): BESRResults {
    const { price, oreCost, wasteCost } = params;
    const besr = (price - oreCost) / wasteCost;
    return { besr };
  }

  static renderEconomics(container: HTMLElement): void {
    if (!container) return;

    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-6">Economics</h2>
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Life-of-Mine (LoM) Financial Planner</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium">Initial CAPEX (₹ Cr)</label>
            <input type="number" id="lom-capex" class="mt-1 w-full rounded-md border p-2" value="4175">
          </div>
          <div>
            <label class="block text-sm font-medium">Life of Mine (Years)</label>
            <input type="number" id="lom-years" class="mt-1 w-full rounded-md border p-2" value="10">
          </div>
          <div>
            <label class="block text-sm font-medium">Discount Rate (%)</label>
            <input type="number" id="lom-discount" class="mt-1 w-full rounded-md border p-2" value="8">
          </div>
          <div>
            <label class="block text-sm font-medium">Commodity Price (₹/t)</label>
            <input type="number" id="lom-price" class="mt-1 w-full rounded-md border p-2" value="12500">
          </div>
          <div class="col-span-full"><hr class="my-2"></div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Annual Ore Mined (Mt)</label>
            <input type="number" id="lom-ore" class="mt-1 w-full rounded-md border p-2" value="5">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium">Annual Waste Mined (Mt)</label>
            <input type="number" id="lom-waste" class="mt-1 w-full rounded-md border p-2" value="20">
          </div>
          <div>
            <label class="block text-sm font-medium">Ore Cost (₹/t)</label>
            <input type="number" id="lom-ore-cost" class="mt-1 w-full rounded-md border p-2" value="2100">
          </div>
          <div>
            <label class="block text-sm font-medium">Waste Cost (₹/t)</label>
            <input type="number" id="lom-waste-cost" class="mt-1 w-full rounded-md border p-2" value="250">
          </div>
        </div>
        <button id="btn-lom-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">Calculate Financials</button>
        <div id="lom-results" class="mt-4 hidden p-4 bg-teal-50 rounded"></div>
        <div class="relative h-72 mt-6"><canvas id="lomChart"></canvas></div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-3">Break-Even Stripping Ratio (BESR)</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium">Commodity Price (₹/t)</label>
            <input type="number" id="besr-price" class="mt-1 w-full rounded-md border p-2" value="12500">
          </div>
          <div>
            <label class="block text-sm font-medium">Ore Mining & Processing Cost (₹/t)</label>
            <input type="number" id="besr-ore-cost" class="mt-1 w-full rounded-md border p-2" value="2100">
          </div>
          <div>
            <label class="block text-sm font-medium">Waste Mining Cost (₹/t)</label>
            <input type="number" id="besr-waste-cost" class="mt-1 w-full rounded-md border p-2" value="250">
          </div>
        </div>
        <button id="btn-besr-calc" class="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">Calculate BESR</button>
        <div id="besr-results" class="mt-4 hidden p-4 bg-teal-50 rounded"></div>
      </div>
    `;

    // Add event listeners
    document.getElementById('btn-lom-calc')?.addEventListener('click', EconomicsCalculator.calculateLoMHandler);
    document.getElementById('btn-besr-calc')?.addEventListener('click', EconomicsCalculator.calculateBESRHandler);
  }

  private static calculateLoMHandler(): void {
    const params: LoMParams = {
      capex: parseFloat((document.getElementById('lom-capex') as HTMLInputElement)?.value || '0'),
      years: parseInt((document.getElementById('lom-years') as HTMLInputElement)?.value || '0'),
      discountRate: parseFloat((document.getElementById('lom-discount') as HTMLInputElement)?.value || '0') / 100,
      price: parseFloat((document.getElementById('lom-price') as HTMLInputElement)?.value || '0'),
      oreMined: parseFloat((document.getElementById('lom-ore') as HTMLInputElement)?.value || '0') * 1e6,
      wasteMined: parseFloat((document.getElementById('lom-waste') as HTMLInputElement)?.value || '0') * 1e6,
      oreCost: parseFloat((document.getElementById('lom-ore-cost') as HTMLInputElement)?.value || '0'),
      wasteCost: parseFloat((document.getElementById('lom-waste-cost') as HTMLInputElement)?.value || '0')
    };

    const results = EconomicsCalculator.calculateLoM(params);
    const res = document.getElementById('lom-results');
    if (res) {
      res.innerHTML = `
        <p><strong>NPV:</strong> ₹ ${Utils.formatIN(results.npv)} Cr</p>
        <p><strong>IRR:</strong> ${(results.irr * 100).toFixed(2)} %</p>
        <p><strong>Annual Cash Flow:</strong> ₹ ${Utils.formatIN(results.annualCashFlow)} Cr</p>
      `;
      res.classList.remove('hidden');
    }

    Utils.updateKPI('kpi-npv', results.npv, ' Cr');
    Utils.updateKPI('kpi-irr', results.irr * 100, '%');

    // Create chart
    if (document.getElementById('lomChart')) {
      const labels = Array.from({ length: params.years }, (_, i) => `Year ${i + 1}`);
      const cumulativeRaw = [-params.capex];
      for (let i = 0; i < params.years; i++) {
        cumulativeRaw.push(cumulativeRaw[i] + results.annualCashFlow);
      }
      
      Utils.createChart('lomChart', 'line', {
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
      }, 'Year', '₹ Cr');
    }
  }

  private static calculateBESRHandler(): void {
    const params: BESRParams = {
      price: parseFloat((document.getElementById('besr-price') as HTMLInputElement)?.value || '0'),
      oreCost: parseFloat((document.getElementById('besr-ore-cost') as HTMLInputElement)?.value || '0'),
      wasteCost: parseFloat((document.getElementById('besr-waste-cost') as HTMLInputElement)?.value || '0')
    };

    const results = EconomicsCalculator.calculateBESR(params);
    const res = document.getElementById('besr-results');
    if (res) {
      res.innerHTML = `<strong>Break-Even Stripping Ratio:</strong> ${results.besr.toFixed(2)} (Waste : Ore)`;
      res.classList.remove('hidden');
    }
  }
}
