// Tools and database utilities for mining engineering
import { RockDatabase, RockProperty } from './types';

export class ToolsManager {
  static getRockDatabase(): RockDatabase {
    return {
      'Sedimentary': [
        { name: 'Coal', ucs: 25, density: 1.4 },
        { name: 'Shale', ucs: 45, density: 2.6 },
        { name: 'Sandstone', ucs: 80, density: 2.5 },
        { name: 'Limestone', ucs: 100, density: 2.6 }
      ],
      'Igneous': [
        { name: 'Granite', ucs: 150, density: 2.7 },
        { name: 'Basalt', ucs: 200, density: 2.9 },
        { name: 'Diorite', ucs: 180, density: 2.8 }
      ],
      'Metamorphic': [
        { name: 'Gneiss', ucs: 130, density: 2.8 },
        { name: 'Marble', ucs: 70, density: 2.7 },
        { name: 'Quartzite', ucs: 250, density: 2.7 },
        { name: 'Slate', ucs: 120, density: 2.8 },
        { name: 'Schist', ucs: 60, density: 2.7 }
      ],
      'Metallic Ores': [
        { name: 'Iron Ore (Hematite)', ucs: 60, density: 4.8 },
        { name: 'Manganese Ore (Balaghat)', ucs: 220, density: 3.8 },
        { name: 'Chromite Ore (Competent)', ucs: 200, density: 4.6 },
        { name: 'Lead-Zinc Ore (Rampura-Agucha)', ucs: 75, density: 3.5 }
      ],
      'Industrial Minerals': [
        { name: 'Rock Salt (Halite)', ucs: 15, density: 2.2 },
        { name: 'Potash', ucs: 22, density: 2.0 },
        { name: 'Gypsum', ucs: 25, density: 2.3 }
      ]
    };
  }

  static renderTools(container: HTMLElement): void {
    if (!container) return;

    container.innerHTML = `
      <h2 class="text-3xl font-bold mb-6">Utilities & Database</h2>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold mb-3">Rock Properties Database</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100">
              <tr>
                <th class="px-4 py-2 text-left">Rock Type</th>
                <th class="px-4 py-2 text-center">UCS (MPa)</th>
                <th class="px-4 py-2 text-center">Density (g/cm³)</th>
              </tr>
            </thead>
            <tbody id="rock-db-table"></tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-3">Export & Session Management</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <h4 class="font-medium">Save Session</h4>
            <div class="flex gap-2">
              <input type="text" id="session-name" placeholder="Session name" class="flex-1 border rounded p-2">
              <button id="btn-save-session" class="bg-teal-600 text-white px-4 py-2 rounded">Save</button>
            </div>
            <div class="text-sm text-slate-600">Save current calculator states to localStorage</div>
          </div>
          <div class="space-y-3">
            <h4 class="font-medium">Load Session</h4>
            <div class="flex gap-2">
              <select id="session-select" class="flex-1 border rounded p-2">
                <option value="">Select session...</option>
              </select>
              <button id="btn-load-session" class="bg-blue-600 text-white px-4 py-2 rounded">Load</button>
            </div>
            <div class="text-sm text-slate-600">Restore saved calculator states</div>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button id="btn-export-economics" class="bg-green-600 text-white px-4 py-2 rounded">Export Economics Data</button>
          <button id="btn-export-geotechnical" class="bg-green-600 text-white px-4 py-2 rounded">Export Geotechnical Data</button>
          <button id="btn-export-operations" class="bg-green-600 text-white px-4 py-2 rounded">Export Operations Data</button>
        </div>
      </div>
    `;

    ToolsManager.renderRockDatabase();
    ToolsManager.setupSessionManagement();
    ToolsManager.setupExportButtons();
  }

  private static renderRockDatabase(): void {
    const db = ToolsManager.getRockDatabase();
    const body = document.getElementById('rock-db-table');
    if (!body) return;

    body.innerHTML = Object.keys(db).map(category => {
      const rows = db[category].map(rock => `
        <tr>
          <td class="px-4 py-2">${rock.name}</td>
          <td class="px-4 py-2 text-center">${rock.ucs}</td>
          <td class="px-4 py-2 text-center">${rock.density}</td>
        </tr>
      `).join('');
      
      return `
        <tr class="bg-slate-200 font-semibold">
          <td colspan="3" class="px-4 py-2">${category}</td>
        </tr>
        ${rows}
      `;
    }).join('');
  }

  private static setupSessionManagement(): void {
    // Save session
    document.getElementById('btn-save-session')?.addEventListener('click', () => {
      const sessionName = (document.getElementById('session-name') as HTMLInputElement)?.value;
      if (!sessionName) {
        alert('Please enter a session name');
        return;
      }

      const sessionData = ToolsManager.collectAllData();
      ToolsManager.saveSession(sessionName, sessionData);
      alert(`Session "${sessionName}" saved successfully`);
      
      // Clear input
      (document.getElementById('session-name') as HTMLInputElement).value = '';
      ToolsManager.updateSessionSelect();
    });

    // Load session
    document.getElementById('btn-load-session')?.addEventListener('click', () => {
      const sessionName = (document.getElementById('session-select') as HTMLSelectElement)?.value;
      if (!sessionName) {
        alert('Please select a session to load');
        return;
      }

      const sessionData = ToolsManager.loadSession(sessionName);
      if (sessionData) {
        ToolsManager.applyAllData(sessionData);
        alert(`Session "${sessionName}" loaded successfully`);
      } else {
        alert('Failed to load session');
      }
    });

    // Update session select on load
    ToolsManager.updateSessionSelect();
  }

  private static setupExportButtons(): void {
    document.getElementById('btn-export-economics')?.addEventListener('click', () => {
      ToolsManager.exportSectionData('economics');
    });

    document.getElementById('btn-export-geotechnical')?.addEventListener('click', () => {
      ToolsManager.exportSectionData('geotechnical');
    });

    document.getElementById('btn-export-operations')?.addEventListener('click', () => {
      ToolsManager.exportSectionData('operations');
    });
  }

  private static collectAllData(): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Collect form data from all sections
    const sections = ['economics', 'geotechnical', 'design', 'operations'];
    sections.forEach(section => {
      const inputs = document.querySelectorAll(`#${section} input, #${section} select`);
      const sectionData: Record<string, any> = {};
      
      inputs.forEach(input => {
        const element = input as HTMLInputElement | HTMLSelectElement;
        if (element.id) {
          sectionData[element.id] = element.value;
        }
      });
      
      if (Object.keys(sectionData).length > 0) {
        data[section] = sectionData;
      }
    });
    
    return data;
  }

  private static applyAllData(data: Record<string, any>): void {
    Object.keys(data).forEach(section => {
      const sectionData = data[section];
      Object.keys(sectionData).forEach(inputId => {
        const element = document.getElementById(inputId) as HTMLInputElement | HTMLSelectElement;
        if (element) {
          element.value = sectionData[inputId];
          // Trigger change event to update calculations
          element.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  private static saveSession(name: string, data: any): void {
    try {
      localStorage.setItem(`mining_session_${name}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private static loadSession(name: string): any {
    try {
      const data = localStorage.getItem(`mining_session_${name}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  private static updateSessionSelect(): void {
    const select = document.getElementById('session-select') as HTMLSelectElement;
    if (!select) return;

    // Clear existing options except first
    select.innerHTML = '<option value="">Select session...</option>';
    
    // Get all saved sessions
    const sessions: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mining_session_')) {
        sessions.push(key.replace('mining_session_', ''));
      }
    }
    
    // Add session options
    sessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session;
      option.textContent = session;
      select.appendChild(option);
    });
  }

  private static exportSectionData(section: string): void {
    const inputs = document.querySelectorAll(`#${section} input, #${section} select`);
    const data: Record<string, any> = {};
    
    inputs.forEach(input => {
      const element = input as HTMLInputElement | HTMLSelectElement;
      if (element.id) {
        data[element.id] = element.value;
      }
    });
    
    // Convert to CSV
    const csv = ToolsManager.convertToCSV(data);
    ToolsManager.downloadFile(csv, `${section}-data.csv`, 'text/csv');
  }

  private static convertToCSV(data: Record<string, any>): string {
    const headers = ['Parameter', 'Value'];
    const rows = Object.entries(data).map(([key, value]) => [key, value]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
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
