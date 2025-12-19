'use client';

import { SprayCan } from 'lucide-react';
import { useEffect, useState, ReactNode } from 'react';
import './ComicLoader.css';

export interface ComicLoaderProps {
    isLoading?: boolean;
    children?: ReactNode;
    minLoadTime?: number;
    progress?: number;
}

export default function ComicLoader({
    isLoading,
    children,
    minLoadTime = 1500,
    progress: manualProgress
}: ComicLoaderProps) {

    // Default to true if isLoading is undefined (auto-load mode)
    const [isVisible, setIsVisible] = useState(isLoading ?? true);
    const [animationClass, setAnimationClass] = useState('animate-splat-in');
    const [progress, setProgress] = useState(0);
    const [mountTime] = useState(Date.now());

    // Handle Loading Logic (Entry/Exit)
    useEffect(() => {
        if (typeof isLoading === 'boolean') {
            if (isLoading) {
                // Start Loading
                setIsVisible(true);
                setAnimationClass('animate-splat-in');
                setProgress(0);
            } else {
                // Stop Loading (Trigger Exit)
                const elapsed = Date.now() - mountTime;
                const introDuration = 1000;
                const remaining = Math.max(0, introDuration - elapsed);

                const exitTimer = setTimeout(() => {
                    setAnimationClass('animate-dissolve-out');

                    const hideTimer = setTimeout(() => {
                        setIsVisible(false);
                    }, 800);

                    return () => clearTimeout(hideTimer);
                }, remaining);

                return () => clearTimeout(exitTimer);
            }
        }
    }, [isLoading, mountTime]);

    // Progress Bar Simulation
    useEffect(() => {
        if (!isVisible) return;

        if (typeof manualProgress === 'number') {
            setProgress(manualProgress);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                // Variable speed for realism
                const jump = Math.random() * (prev > 80 ? 1.5 : 4);
                return Math.min(prev + jump, 100);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isVisible, manualProgress]);

    // If not visible and done loading, render children
    if (!isVisible && isLoading === false) {
        return <>{children}</>;
    }

    return (
        <>
            {/* The Page Content (Wrapped) */}
            {children && (
                <div className={isVisible ? "fixed inset-0 overflow-hidden pointer-events-none" : ""}>
                    {children}
                </div>
            )}

            {/* The Loader Overlay */}
            {isVisible && (
                <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] bg-halftone ${animationClass}`}>
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                         <div className="absolute top-10 left-10 text-9xl text-white font-black opacity-10 rotate-12 select-none">POW!</div>
                         <div className="absolute bottom-20 right-10 text-9xl text-white font-black opacity-10 -rotate-12 select-none">ZAP!</div>
                    </div>

                    <div className="relative w-full max-w-3xl px-6 flex flex-col items-center">

                        {/* Funky Text */}
                        <div className="relative mb-12 transform -rotate-2">
                            <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white text-outline-heavy z-10 relative">
                                LOADING
                                <span className="absolute -right-8 top-0 text-[#ccff00] animate-bounce">.</span>
                                <span className="absolute -right-4 top-0 text-[#ccff00] animate-bounce delay-75">.</span>
                                <span className="absolute -right-0 top-0 text-[#ccff00] animate-bounce delay-150">.</span>
                            </h2>
                            {/* Shadow/Offset text for depth */}
                            <h2 className="absolute top-2 left-2 text-7xl md:text-9xl font-black italic tracking-tighter text-[#ccff00] opacity-100 z-0 select-none">
                                LOADING...
                            </h2>
                        </div>

                        {/* The Bar Container */}
                        <div className="relative h-20 w-full bg-[#1a1a1a] border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] rotate-1 overflow-visible">
                            
                            {/* Background Striping Pattern */}
                            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#333_0px,#333_10px,#1a1a1a_10px,#1a1a1a_20px)]"></div>

                            {/* The Liquid/Paint Fill */}
                            <div
                                className="h-full bg-[#ccff00] relative overflow-hidden transition-all duration-75 ease-out border-r-[6px] border-black"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Diagonal Stripes Texture on the fill */}
                                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,#000_0px,#000_5px,transparent_5px,transparent_10px)]"></div>
                                
                                {/* Highlight Shine */}
                                <div className="absolute top-2 left-0 w-full h-3 bg-white opacity-40 rounded-full"></div>
                            </div>

                            {/* Spray Can & Particles Container */}
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 ease-out z-20"
                                style={{ left: `${progress}%` }}
                            >
                                {/* The Spray Can Icon */}
                                <div className="relative -ml-8 -mt-20 transform -rotate-12 hover:rotate-0 transition-transform">
                                    <SprayCan size={80} strokeWidth={1.5} className="text-white fill-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
                                    
                                    {/* Nozzle Spray Effect (Mist) */}
                                    <div className="absolute bottom-0 -left-6 w-12 h-12 bg-[#ccff00] blur-xl opacity-80 animate-pulse"></div>
                                    
                                    {/* Random Droplets */}
                                    <div className="absolute top-10 -left-4 w-2 h-2 bg-[#ccff00] rounded-full animate-ping"></div>
                                    <div className="absolute top-14 -left-8 w-3 h-3 bg-[#ccff00] rounded-full animate-bounce delay-100"></div>
                                </div>
                            </div>

                        </div>

                        {/* Percentage Speech Bubble */}
                        <div className="absolute -right-4 -bottom-16 md:-right-12 md:-top-16 z-30 animate-wiggle">
                            <div className="relative bg-white border-[5px] border-black px-6 py-3 shadow-[8px_8px_0px_#ccff00]">
                                <span className="text-5xl font-black font-mono text-black tracking-widest">
                                    {Math.round(progress)}%
                                </span>
                                {/* Speech Bubble Triangle */}
                                <div className="absolute -bottom-4 left-6 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black"></div>
                                <div className="absolute -bottom-[11px] left-[26px] w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[16px] border-t-white"></div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}