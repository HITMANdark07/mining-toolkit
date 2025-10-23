// Footer component
"use client";
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336-4.5 4.5 0 00-6.336-4.486c-.062.052-.122.107-.178.165m0 0a4.496 4.496 0 01-5.982 6.039m5.982-6.039a4.496 4.496 0 00-5.982 6.039m0 0H3" />
            </svg>
            <span className="text-lg font-semibold">Integrated Mining Engineering Suite</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm">
              Developed by <span className="text-teal-400 font-semibold">Mritunjay Kumar</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Professional mining engineering tools for modern operations
            </p>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>© 2025 Integrated Mining Engineering Suite. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
