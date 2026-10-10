import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f8] text-[#1a2238] relative selection:bg-[#c8a227] selection:text-white">
      {/* Ambient background glows — Gov India navy/gold palette */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#1a2a5e]/6 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#c8a227]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-[#1a2a5e]/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0 cyber-grid opacity-40" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
