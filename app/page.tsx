'use client';

import Link from 'next/link';
import { Rajdhani, Teko } from 'next/font/google';
import { useState, useEffect } from 'react';

// 1. Font Setup
const rajdhani = Rajdhani({ 
  subsets: ['latin'], 
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani'
});

const teko = Teko({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'], 
  variable: '--font-teko'
});

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className={`relative w-full h-screen overflow-hidden bg-[#0a0a0a] text-white ${rajdhani.variable} ${teko.variable} font-sans selection:bg-[#ccff00] selection:text-black`}>
      
      {/* --- FX LAYERS --- */}
      
      {/* 1. Global Noise Texture (Added) */}
      <div 
        className="pointer-events-none fixed inset-0 z-20 opacity-20 mix-blend-overlay"
        style={{ 
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          filter: 'contrast(100%) brightness(100%)' 
        }}
      />

      {/* 2. CRT Scanlines */}
      <div className="pointer-events-none fixed inset-0 z-30 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* 3. Vignette */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle,transparent_50%,black_100%)]" />

      {/* 4. Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* --- HUD --- */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-2 font-teko text-2xl tracking-widest text-gray-500">
        <span className="text-[#ccff00] animate-pulse">//</span> SYSTEM_READY
      </div>

      <div className="absolute top-8 right-8 z-50 flex flex-col items-end font-rajdhani text-sm text-gray-500">
        <span className="tracking-widest">V.1.0.4</span>
        <div className="flex gap-1 mt-1">
          <div className="w-1.5 h-1.5 bg-[#ccff00]"></div>
          <div className="w-1.5 h-1.5 bg-[#333]"></div>
          <div className="w-1.5 h-1.5 bg-[#333]"></div>
        </div>
      </div>

      {/* --- CENTER STAGE --- */}
      <div className="relative z-50 flex flex-col items-center justify-center h-full w-full max-w-7xl mx-auto p-6">
        
        {/* Title Block */}
        <div className="text-center mb-20 relative group cursor-default">
          <h1 className="text-[6rem] md:text-[8rem] leading-[0.8] font-teko uppercase tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Comic<span className="text-[#ccff00]">.SLASH</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-[1px] w-12 bg-gray-700"></div>
            <p className="font-rajdhani text-lg tracking-[0.4em] text-gray-400 uppercase">
              Cinematic Web Reader
            </p>
            <div className="h-[1px] w-12 bg-gray-700"></div>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
          
          <MenuCard 
            href="/studio"
            index="01"
            title="Open Studio"
            subtitle="Create & Edit"
            theme="neon"
          />

          <MenuCard 
            href="/reader"
            index="02"
            title="Enter Reader"
            subtitle="Start Reading"
            theme="white" 
            active={true}
          />

          <MenuCard 
            href="/preview"
            index="03"
            title="Preview Mode"
            subtitle="Test Assets"
            theme="neon"
          />
          
        </div>

        {/* Footer info */}
        <div className="fixed bottom-8 w-full text-center font-rajdhani text-xs text-gray-600 tracking-widest uppercase opacity-50">
          Immersive Audio-Visual Comic Engine <br/> Optimized for Desktop Viewports
        </div>
      </div>
    </main>
  );
}

// --- IMPROVED COMPONENT ---
function MenuCard({ href, title, subtitle, index, theme, active = false }: any) {
  // Define colors based on "theme" prop to avoid arbitrary value conflicts
  const isNeon = theme === 'neon';
  const hoverBg = isNeon ? 'group-hover:bg-[#ccff00]' : 'group-hover:bg-white';
  const activeBorder = active ? 'border-white/40' : 'border-gray-800';
  
  return (
    <Link href={href} className="group relative block w-full">
      <div 
        className={`
          relative 
          h-56 
          bg-black/80 backdrop-blur-md
          border ${activeBorder}
          hover:border-transparent
          transition-all duration-300 ease-out
          overflow-hidden
        `}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 80%, 85% 100%, 0 100%)'
        }}
      >
        {/* 1. SLIDING BACKGROUND */}
        <div className={`absolute inset-0 z-0 translate-y-full transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${hoverBg} group-hover:translate-y-0`} />

        {/* 2. CARD TEXTURE (Kept this for card-specific detail) */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>

        {/* 3. CONTENT CONTAINER */}
        <div className="relative z-10 p-8 flex flex-col justify-between h-full">
          
          {/* Top Row: Index */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4 group-hover:border-black/10 transition-colors duration-300">
            <span className={`font-teko text-2xl tracking-widest transition-colors duration-300 ${active ? 'text-[#ccff00]' : 'text-gray-600'} group-hover:text-black`}>
              // {index}
            </span>
            {/* Animated Icon */}
            <div className="w-2 h-2 bg-[#ccff00] opacity-0 group-hover:opacity-100 group-hover:bg-black transition-all duration-300 rotate-45" />
          </div>

          {/* Bottom Row: Text */}
          <div className="pb-2">
            <h2 className={`
              font-teko text-5xl uppercase leading-[0.85] mb-2
              transition-colors duration-300
              text-white group-hover:text-black
            `}>
              {title}
            </h2>
            <p className={`
              font-rajdhani font-semibold text-sm tracking-[0.15em] uppercase
              transition-colors duration-300
              text-gray-500 group-hover:text-black/70
            `}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}