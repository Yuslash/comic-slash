import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface ReaderMenuProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
    isAutoReveal: boolean;
    setIsAutoReveal: (isAuto: boolean) => void;
    onRevealAll: () => void;
}

export const ReaderMenu: React.FC<ReaderMenuProps> = ({ isMenuOpen, setIsMenuOpen, isAutoReveal, setIsAutoReveal, onRevealAll }) => {
    return (
        <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`group flex items-center gap-2 border-2 px-3 py-1.5 transition-all shadow-[4px_4px_0px_transparent] hover:shadow-[4px_4px_0px_#ccff00] hover:-translate-y-0.5
                    ${isMenuOpen ? 'bg-[#ccff00] border-black text-black' : 'bg-black border-white text-white hover:border-[#ccff00]'}
                `}
            >
                <span className="font-rajdhani font-bold text-sm tracking-widest uppercase hidden md:inline">SYSTEM</span>
                <Settings size={18} className={`transition-transform duration-500 ${isMenuOpen ? 'rotate-90' : 'group-hover:rotate-180'}`} />
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-72 bg-black border-4 border-white shadow-[8px_8px_0px_#ccff00] z-[2000] animate-in slide-in-from-top-2 duration-200 font-rajdhani">
                    {/* Decorative Header */}
                    <div className="bg-[#ccff00] p-2 border-b-4 border-black flex justify-between items-center">
                        <span className="text-black font-black italic tracking-tighter text-lg">READER_OPTS //</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse delay-75" />
                        </div>
                    </div>

                    <div className="p-4 space-y-3 bg-[repeating-linear-gradient(45deg,#111_0px,#111_10px,#000_10px,#000_20px)]">

                        {/* No Spoilers Button */}
                        <button
                            onClick={() => {
                                onRevealAll();
                                setIsMenuOpen(false);
                            }}
                            className="w-full group relative bg-gray-900 border-2 border-gray-700 hover:border-[#ccff00] p-3 text-left transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#ccff00]"
                        >
                            <div className="flex justify-between items-center z-10 relative">
                                <div>
                                    <div className="text-[#ccff00] text-[10px] font-bold mb-1 opacity-70 group-hover:opacity-100 uppercase tracking-widest">CMD: REVEAL_ALL</div>
                                    <div className="text-white font-bold text-sm uppercase tracking-wider">No Spoilers</div>
                                </div>
                                <div className="opacity-50 group-hover:opacity-100 group-hover:text-[#ccff00] transition-opacity">
                                    ⚡
                                </div>
                            </div>
                        </button>

                        {/* Auto Reveal Toggle */}
                        <button
                            onClick={() => {
                                setIsAutoReveal(!isAutoReveal);
                            }}
                            className={`w-full group relative border-2 p-3 text-left transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#ccff00]
                                ${isAutoReveal ? 'bg-[#ccff00]/10 border-[#ccff00]' : 'bg-gray-900 border-gray-700 hover:border-[#ccff00]'}
                            `}
                        >
                            <div className="flex justify-between items-center z-10 relative">
                                <div>
                                    <div className="text-[#ccff00] text-[10px] font-bold mb-1 opacity-70 group-hover:opacity-100 uppercase tracking-widest">MODE: AUTO_PLAY</div>
                                    <div className="text-white font-bold text-sm uppercase tracking-wider">Auto Reveal (3s)</div>
                                </div>

                                {/* Custom Toggle Switch */}
                                <div className={`w-10 h-5 border-2 border-white bg-black relative transition-colors group-hover:border-[#ccff00]`}>
                                    <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white transition-all duration-300 ${isAutoReveal ? 'left-[22px] bg-[#ccff00]' : 'left-0.5 bg-gray-500'}`} />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-2 bg-black text-[10px] text-center text-gray-500 font-mono border-t-2 border-white">
                        SYSTEM_READY :: v1.0.5
                    </div>
                </div>
            )}
        </div>
    );
};
