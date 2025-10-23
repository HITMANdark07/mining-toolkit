"use client";
import React from "react";
import { AppProvider } from "../lib/context";
import { Navigation } from "../components/Navigation";
import { MainContent } from "../components/MainContent";
import { GlobalModal } from "../components/GlobalModal";

export default function Home() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 text-slate-800">
        <Navigation />
        <MainContent />
        <GlobalModal />
      </div>
    </AppProvider>
  );
}