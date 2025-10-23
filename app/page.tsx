"use client";
import { useEffect } from "react";
import { Utils } from "../lib/utils";
import { EconomicsCalculator } from "../lib/economics";
import { GeotechnicalCalculator } from "../lib/geotechnical";
import { OperationsCalculator } from "../lib/operations";
import { DesignCalculator } from "../lib/design";
import { ToolsManager } from "../lib/tools";

export default function Home() {
  useEffect(() => {
    const initializeApp = () => {
      try {

        // Initialize navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        const showSection = (id: string) => {
          document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
          const el = document.getElementById(id);
          if (el) {
            el.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        };

        navButtons.forEach(btn => {
          btn.addEventListener('click', () => showSection(btn.getAttribute('data-target') || ''));
        });

        // Build Dashboard
        Utils.buildDashboard();

        // Setup modals
        const modalBackdrop = document.getElementById('modal-backdrop');
        const modalContent = document.getElementById('modal-content');
        
        const openModal = (contentHtml: string) => {
          if (modalContent) modalContent.innerHTML = contentHtml;
          if (modalBackdrop) {
            modalBackdrop.classList.remove('hidden');
            modalBackdrop.classList.add('flex');
          }
        };

        const closeModal = () => {
          if (modalBackdrop) {
            modalBackdrop.classList.add('hidden');
            modalBackdrop.classList.remove('flex');
          }
          if (modalContent) modalContent.innerHTML = '';
        };

        modalBackdrop?.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) closeModal();
        });

        document.getElementById('btn-glossary')?.addEventListener('click', () => openModal(Utils.getGlossaryHTML()));
        document.getElementById('btn-converter')?.addEventListener('click', () => openModal(Utils.getConverterHTML()));

        // Setup converter logic
        document.getElementById('convert-run')?.addEventListener('click', Utils.converterLogic);

        // Render all sections
        EconomicsCalculator.renderEconomics(document.getElementById('economics')!);
        GeotechnicalCalculator.renderGeotechnical(document.getElementById('geotechnical')!);
        DesignCalculator.renderDesign(document.getElementById('design')!);
        OperationsCalculator.renderOperations(document.getElementById('operations')!);
        ToolsManager.renderTools(document.getElementById('tools')!);

        // Show dashboard by default
        showSection('dashboard');

      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <svg className="h-9 w-9 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336-4.5 4.5 0 00-6.336-4.486c-.062.052-.122 .107-.178 .165m0 0a4.496 4.496 0 01-5.982 6.039m0 0H3" /></svg>
              <h1 className="text-2xl font-bold">Integrated Mining Engineering Suite</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-3">
              <button className="nav-btn px-3 py-2 rounded-md hover:bg-slate-100" data-target="dashboard">Dashboard</button>
              <button className="nav-btn px-3 py-2 rounded-md hover:bg-slate-100" data-target="economics">Economics</button>
              <button className="nav-btn px-3 py-2 rounded-md hover:bg-slate-100" data-target="geotechnical">Geotechnical</button>
              <button className="nav-btn px-3 py-2 rounded-md hover:bg-slate-100" data-target="design">Design & Stability</button>
              <button className="nav-btn px-3 py-2 rounded-md hover:bg-slate-100" data-target="operations">Operations</button>
              <button className="nav-btn px-3 py-2 rounded-md hover:bg-slate-100" data-target="tools">Tools</button>
              <button id="btn-converter" className="px-3 py-2 rounded-md hover:bg-slate-100">Converter</button>
              <button id="btn-glossary" className="px-3 py-2 rounded-md hover:bg-slate-100">Glossary</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <section id="dashboard" className="app-section">
          <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
          <div id="kpi-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">Life-of-Mine Cumulative Cash Flow</h3>
              <div className="relative h-80"><canvas id="lomChart"></canvas></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4" id="quick-actions"></div>
            </div>
          </div>
        </section>

        <section id="economics" className="app-section hidden"></section>
        <section id="geotechnical" className="app-section hidden"></section>
        <section id="design" className="app-section hidden"></section>
        <section id="operations" className="app-section hidden"></section>
        <section id="tools" className="app-section hidden"></section>
      </main>

      <div id="modal-backdrop" className="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto" id="modal-content"></div>
      </div>
      
      {/* Tooltip for stereonet */}
      <div id="tooltip" className="fixed bg-black text-white px-2 py-1 rounded text-sm pointer-events-none opacity-0 z-50"></div>
    </div>
  );
}
