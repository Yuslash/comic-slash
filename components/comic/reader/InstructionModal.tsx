import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InstructionModalProps {
    onClose: (dontShowAgain: boolean) => void;
}

export function InstructionModal({ onClose }: InstructionModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md p-6 mx-4 overflow-hidden border border-cyan-500/50 rounded-lg bg-black/90 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-in zoom-in-95 duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold font-rajdhani text-white tracking-wide">
                        SPOILER PROTECTION
                    </h2>
                    <button
                        onClick={() => onClose(dontShowAgain)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4 font-rajdhani">
                    <p className="text-lg text-gray-300 leading-relaxed">
                        This chapter is hidden to prevent spoilers.
                    </p>
                    <div className="p-4 rounded-md bg-cyan-950/30 border border-cyan-500/30">
                        <p className="text-cyan-300 font-semibold flex items-center gap-2">
                            <span className="text-xl">👆</span> Click on frames to reveal them
                        </p>
                        <p className="text-sm text-cyan-400/70 mt-1">
                            If you want to remove all blurred click No Spoilers button in the menu to reveal everything at once.
                        </p>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-cyan-600 border-cyan-500' : 'border-gray-600 bg-transparent group-hover:border-cyan-400'}`}>
                            {dontShowAgain && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        <span className="text-gray-400 text-sm group-hover:text-gray-300 select-none">Do not show again</span>
                    </label>

                    <button
                        onClick={() => onClose(dontShowAgain)}
                        className="w-full sm:w-auto px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider uppercase rounded transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)]"
                    >
                        Start Reading
                    </button>
                </div>
            </div>
        </div>
    );
}
