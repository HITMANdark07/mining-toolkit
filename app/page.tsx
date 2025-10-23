"use client";
import React from "react";
import { AppProvider } from "../lib/context";
import { Navigation } from "../components/Navigation";
import { MainContent } from "../components/MainContent";
import { GlobalModal } from "../components/GlobalModal";
import { Footer } from "../components/Footer";

export default function Home() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
        <Navigation />
        <MainContent />
        <Footer />
        <GlobalModal />
      </div>
    </AppProvider>
  );
}