// Core utilities for mining engineering calculations
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import * as d3 from 'd3';
import { ChartData, KPIData, SessionData, ExportOptions } from './types';

// Register all Chart.js components
Chart.register(...registerables);

export class Utils {
  static formatIN(val: number | string, digits: number = 2): string {
    try {
      return Number(val).toLocaleString('en-IN', { maximumFractionDigits: digits });
    } catch {
      return String(val);
    }
  }

  static updateKPI(id: string, value: number | string, unit: string = '', precision: number = 2): void {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = (typeof value === 'number' ? Utils.formatIN(value, precision) : value) + unit;
    }
  }

  static createChart(
    canvasId: string,
    type: string,
    data: ChartData,
    xLabel: string,
    yLabel: string,
    additionalOptions: Partial<ChartOptions> = {}
  ): Chart | null {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#e2e8f0' : '#0f172a';

    const defaultOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          title: { display: !!xLabel, text: xLabel, color: textColor },
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y: {
          title: { display: !!yLabel, text: yLabel, color: textColor },
          grid: { color: gridColor },
          ticks: { color: textColor }
        }
      },
      plugins: {
        legend: { labels: { color: textColor } }
      }
    };

    const options = { ...defaultOptions, ...additionalOptions };

    const config: ChartConfiguration = {
      type: type as any,
      data,
      options
    };

    return new Chart(ctx, config);
  }

  static buildDashboard(): void {
    const kpis: KPIData[] = [
      { id: 'kpi-npv', label: 'NPV (₹ Cr)', value: 0, unit: ' Cr' },
      { id: 'kpi-irr', label: 'IRR (%)', value: 0, unit: '%' },
      { id: 'kpi-fos', label: 'Pillar FoS', value: 0, unit: '' },
      { id: 'kpi-rockburst', label: 'Rockburst Risk', value: 'NONE', unit: '' },
      { id: 'kpi-rmr', label: 'RMR', value: 0, unit: '' },
      { id: 'kpi-mf', label: 'Match Factor', value: 0, unit: '' }
    ];

    const grid = document.getElementById('kpi-grid');
    if (!grid) return;

    grid.innerHTML = kpis.map(k => `
      <div class="bg-white p-4 rounded-lg shadow">
        <h4 class="text-sm font-medium text-slate-500">${k.label}</h4>
        <p id="${k.id}" class="text-2xl font-bold">--</p>
      </div>
    `).join('');

    const qa = document.getElementById('quick-actions');
    if (qa) {
      const quickActions = [
        { id: 'qa-lom', label: 'LoM Planner', target: 'economics' },
        { id: 'qa-slope', label: 'Slope Stability', target: 'geotechnical' },
        { id: 'qa-blast', label: 'Blast Design', target: 'operations' },
        { id: 'qa-pillar', label: 'Pillar Design', target: 'design' }
      ];

      qa.innerHTML = quickActions.map(q => `
        <button class="bg-teal-100 text-teal-800 p-3 rounded-lg hover:bg-teal-200 text-center quick-action" data-target="${q.target}">
          ${q.label}
        </button>
      `).join('');

      qa.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = (btn as HTMLElement).dataset.target;
          const navBtn = document.querySelector(`.nav-btn[data-target="${target}"]`) as HTMLElement;
          navBtn?.click();
        });
      });
    }
  }

  static getGlossaryHTML(): string {
    return `
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xl font-bold">Mining Glossary</h3>
        <button class="px-3 py-1 rounded bg-slate-100" onclick="document.getElementById('modal-backdrop').click()">Close</button>
      </div>
      <div class="space-y-2 text-sm">
        <p><strong>Overburden:</strong> Material above a mineral deposit.</p>
        <p><strong>Interburden:</strong> Waste between ore zones.</p>
        <p><strong>Bench:</strong> A single operational level in a pit.</p>
        <p><strong>Swell Factor:</strong> Percentage volume increase of excavated rock.</p>
        <p><strong>Stripping Ratio (SR):</strong> Ratio of waste removed to ore extracted.</p>
        <p><strong>BESR:</strong> Break-Even Stripping Ratio. The maximum economic SR.</p>
        <p><strong>RMR:</strong> Rock Mass Rating classification system.</p>
        <p><strong>FoS:</strong> Factor of Safety - ratio of resisting to driving forces.</p>
        <p><strong>Powder Factor:</strong> Explosive weight per tonne of rock blasted.</p>
        <p><strong>Match Factor:</strong> Ratio of loader capacity to truck capacity.</p>
      </div>
    `;
  }

  static getConverterHTML(): string {
    return `
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xl font-bold">Unit Converter</h3>
        <button class="px-3 py-1 rounded bg-slate-100" onclick="document.getElementById('modal-backdrop').click()">Close</button>
      </div>
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 items-end gap-3">
          <input type="number" id="convert-input" class="border rounded p-2" placeholder="Enter value">
          <select id="convert-category" class="border rounded p-2">
            <option value="indian_money">Indian Money</option>
            <option value="length">Length</option>
            <option value="mass">Mass</option>
            <option value="pressure">Pressure</option>
            <option value="area">Area</option>
            <option value="volume">Volume</option>
          </select>
          <button id="convert-run" class="bg-teal-600 text-white py-2 px-4 rounded">Convert</button>
        </div>
        <div id="conversion-results" class="text-lg font-semibold text-green-600 p-3 bg-slate-50 rounded"></div>
      </div>
    `;
  }

  static converterLogic(): void {
    const resultsEl = document.getElementById('conversion-results');
    if (!resultsEl) return;

    const input = parseFloat((document.getElementById('convert-input') as HTMLInputElement)?.value || '0');
    const category = (document.getElementById('convert-category') as HTMLSelectElement)?.value;

    let results = '';
    switch (category) {
      case 'indian_money':
        results = `${input.toLocaleString('en-IN')} is:<br><strong>${(input / 100000).toFixed(3)}</strong> Lakhs<br><strong>${(input / 10000000).toFixed(4)}</strong> Crores`;
        break;
      case 'length':
        results = `${input} m is <strong>${(input * 3.28084).toFixed(2)}</strong> feet<br>${input} ft is <strong>${(input / 3.28084).toFixed(2)}</strong> metres`;
        break;
      case 'mass':
        results = `${input} t is <strong>${(input * 1000).toFixed(2)}</strong> kg<br>${input} kg is <strong>${(input / 1000).toFixed(2)}</strong> tonnes`;
        break;
      case 'pressure':
        results = `${input} MPa is <strong>${(input * 145.038).toFixed(2)}</strong> PSI<br>${input} PSI is <strong>${(input / 145.038).toFixed(3)}</strong> MPa`;
        break;
      case 'area':
        results = `${input} m² is <strong>${(input * 10.764).toFixed(2)}</strong> ft²<br>${input} ft² is <strong>${(input / 10.764).toFixed(2)}</strong> m²`;
        break;
      case 'volume':
        results = `${input} m³ is <strong>${(input * 35.315).toFixed(2)}</strong> ft³<br>${input} ft³ is <strong>${(input / 35.315).toFixed(2)}</strong> m³`;
        break;
    }
    resultsEl.innerHTML = results;
  }

  static saveSession(key: string, data: SessionData): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static loadSession(key: string): SessionData | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  static exportData(options: ExportOptions): void {
    const { format, data, filename = 'mining-data' } = options;
    
    if (format === 'csv') {
      const csv = Utils.convertToCSV(data);
      Utils.downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else if (format === 'pdf') {
      // For PDF, we'd need a library like jsPDF
      console.log('PDF export not implemented yet');
    }
  }

  private static convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header] || '').join(','))
      ].join('\n');
      return csvContent;
    }
    return JSON.stringify(data);
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export D3 for use in other modules
export { d3 };
