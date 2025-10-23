// Global modal component
"use client";
import React from 'react';
import { useAppContext } from '../lib/context';

export const GlobalModal: React.FC = () => {
  const { state, closeModal } = useAppContext();

  if (!state.modal.isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{state.modal.title}</h3>
          <button
            onClick={closeModal}
            className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="modal-content">
          {state.modal.content}
        </div>
      </div>
    </div>
  );
};
