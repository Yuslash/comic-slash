import React from 'react';
import { ArrowLeft, Zap, Play, Eye, EyeOff } from 'lucide-react';

interface ReaderHeaderProps {
    title?: string;
    backLink?: string;
    currentSlideIndex: number;
    isAutoReveal: boolean;
    setIsAutoReveal: (isAuto: boolean) => void;
    onRevealAll: () => void;
    isAllRevealed: boolean;
    isUIHidden: boolean;
    setIsUIHidden: (hidden: boolean) => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
    title,
    backLink,
    currentSlideIndex,
    isAutoReveal,
    setIsAutoReveal,
    onRevealAll,
    isAllRevealed,
    isUIHidden,
    setIsUIHidden
}) => {
    // If UI is hidden, ONLY show the Unhide button (floating)
    if (isUIHidden) {
        return (
            <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
                <button
                    onClick={() => setIsUIHidden(false)}
                    className="group bg-black/50 border-2 border-white/20 p-2 hover:bg-black hover:border-[#ccff00] hover:shadow-[0_0_10px_#ccff00] transition-all rounded-full"
                    title="Show UI"
                >
                    <Eye size={20} className="text-white group-hover:text-[#ccff00]" />
                </button>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 right-0 p-4 z-[1000] flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-6">
                {backLink && (
                    <a href={backLink} className="group flex items-center gap-2 px-3 py-1.5 bg-black border-2 border-white hover:border-[#ccff00] hover:shadow-[4px_4px_0px_#ccff00] transition-all hover:-translate-y-0.5">
                        <ArrowLeft size={16} className="text-white group-hover:text-[#ccff00] transition-colors" />
                        <span className="text-white font-bold text-sm tracking-widest uppercase group-hover:text-[#ccff00] transition-colors">BACK</span>
                    </a>
                )}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#ccff00] animate-pulse" />
                        <span className="text-[#ccff00] text-[10px] font-bold tracking-[0.2em]">READING_MODE //</span>
                    </div>
                    <div className="text-xl md:text-3xl font-black italic tracking-tighter text-white uppercase" style={{ textShadow: '2px 2px 0px #000' }}>
                        {title || `Chapter 01 / Scene ${currentSlideIndex + 1}`}
                    </div>
                </div>
            </div>

            {/* Right SideInline Controls */}
            <div className="pointer-events-auto flex items-center gap-3">
                {/* Reveal All Button */}
                <button
                    onClick={onRevealAll}
                    disabled={isAllRevealed}
                    className={`group flex items-center gap-2 px-3 py-1.5 bg-black border-2 transition-all 
                        ${isAllRevealed
                            ? 'border-gray-800 text-gray-600 cursor-not-allowed'
                            : 'border-white text-white hover:border-[#ccff00] hover:text-[#ccff00] hover:shadow-[4px_4px_0px_#ccff00] hover:-translate-y-0.5'
                        }`}
                >
                    <Zap size={14} className={isAllRevealed ? 'text-gray-600' : 'fill-current'} />
                    <span className="font-bold text-xs md:text-sm tracking-widest uppercase">
                        {isAllRevealed ? 'REVEALED' : 'NO SPOILERS'}
                    </span>
                </button>

                {/* Auto Reveal Toggle Button */}
                <button
                    onClick={() => !isAllRevealed && setIsAutoReveal(!isAutoReveal)}
                    disabled={isAllRevealed}
                    className={`group flex items-center gap-3 px-3 py-1.5 border-2 transition-all 
                        ${isAllRevealed
                            ? 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
                            : (isAutoReveal
                                ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-[4px_4px_0px_white]'
                                : 'bg-black border-white text-white hover:border-[#ccff00] hover:text-[#ccff00] hover:shadow-[4px_4px_0px_#ccff00] hover:-translate-y-0.5')
                        }
                    `}
                >
                    <div className="flex items-center gap-2">
                        <Play size={14} className={isAutoReveal ? 'fill-black' : 'fill-current'} />
                        <span className="font-bold text-xs md:text-sm tracking-widest uppercase">
                            AUTO (3s)
                        </span>
                    </div>
                    {/* Toggle Indicator */}
                    <div className={`w-6 h-3 border relative transition-colors ${isAutoReveal ? 'border-black bg-black/20' : 'border-current'}`}>
                        <div className={`absolute top-0.5 bottom-0.5 w-2 transition-all duration-300 ${isAutoReveal ? 'right-0.5 bg-black' : 'left-0.5 bg-gray-500 group-hover:bg-[#ccff00]'}`} />
                    </div>
                </button>

                {/* Hide UI Button */}
                <button
                    onClick={() => setIsUIHidden(true)}
                    className="group px-3 py-1.5 bg-black border-2 border-white hover:border-[#ccff00] hover:shadow-[4px_4px_0px_#ccff00] transition-all hover:-translate-y-0.5 flex items-center justify-center"
                    title="Hide UI (H)"
                >
                    <EyeOff size={16} className="text-white group-hover:text-[#ccff00]" />
                </button>
            </div>
        </div>
    );
};
