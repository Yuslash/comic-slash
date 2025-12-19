import React, { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export default function ExportModal({ isOpen, onClose, data }: ExportModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const jsonStr = JSON.stringify(data, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center font-sans">
            {/* --- INJECTED STYLES FOR THE CYBERPUNK LOOK --- */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Teko:wght@400;600&display=swap');
                
                :root {
                    --neon-green: #ccff00;
                    --dark-bg: #0a0a0a;
                }

                .font-teko { font-family: 'Teko', sans-serif; }
                .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
                
                /* CRT SCANLINES */
                .scanlines {
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    background-size: 100% 2px, 3px 100%;
                }

                /* CUSTOM SCROLLBAR */
                .cyber-scrollbar::-webkit-scrollbar { width: 8px; }
                .cyber-scrollbar::-webkit-scrollbar-track { background: #111; }
                .cyber-scrollbar::-webkit-scrollbar-thumb { background: #333; border: 1px solid #000; }
                .cyber-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--neon-green); }

                /* ANGLED CORNERS CLIP PATH */
                .clip-angled { clip-path: polygon(0 0, 100% 0, 100% 95%, 97% 100%, 0 100%); }
                .clip-button { clip-path: polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%); }
            `}</style>

            {/* --- BACKDROP & EFFECTS --- */}
            <div className="absolute inset-0 bg-[#0a0a0a] bg-opacity-95 backdrop-blur-sm" onClick={onClose}></div>
            <div className="absolute inset-0 scanlines pointer-events-none opacity-40"></div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_60%,black_100%)] z-10"></div>

            {/* --- MODAL CONTAINER --- */}
            <div className="relative w-full max-w-5xl mx-4 z-20 flex flex-col animation-fade-in-up">
                
                {/* DECORATIVE BORDER WRAPPER */}
                <div className="relative bg-[#0a0a0a] border border-[#333] clip-angled flex flex-col">
                    
                    {/* --- HEADER --- */}
                    <div className="flex justify-between items-center p-6 border-b border-[#222] bg-[#0f0f0f]">
                        <h2 className="text-4xl font-teko text-white uppercase tracking-widest flex items-center gap-3">
                            <span className="text-[#ccff00] text-5xl leading-none font-bold">//</span>
                            SYSTEM EXPORT
                        </h2>
                        
                        <button 
                            onClick={onClose}
                            className="group flex items-center gap-2 text-gray-500 hover:text-[#ccff00] transition-colors font-rajdhani font-bold text-xl tracking-wider uppercase"
                        >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">&lt;</span>
                            [ CLOSE ]
                        </button>
                    </div>

                    {/* --- BODY --- */}
                    <div className="p-8 bg-black/50 relative">
                        {/* DECORATIVE HUD ELEMENTS */}
                        <div className="absolute top-4 left-0 w-1 h-12 bg-[#ccff00]"></div>
                        <div className="absolute bottom-8 right-0 w-1 h-12 bg-[#ccff00]"></div>

                        <p className="text-gray-400 mb-4 font-rajdhani text-lg pl-2 border-l-2 border-[#333]">
                            RAW DATA SEQUENCE:
                        </p>

                        {/* --- DATA DISPLAY (EXPANDED) --- */}
                        <div className="relative group">
                            {/* Glowing border effect on hover */}
                            <div className="absolute -inset-[1px] transition-opacity rounded-sm pointer-events-none"></div>
                            
                            <textarea
                                readOnly
                                value={jsonStr}
                                className="w-full h-[50vh] bg-[#050505] text-[#ccff00] font-mono text-sm p-6 focus:outline-none resize-none cyber-scrollbar border border-[#222] focus:border-[#ccff00]/50 transition-colors shadow-inner"
                                spellCheck={false}
                                style={{
                                    fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
                                    lineHeight: '1.5'
                                }}
                            />
                        </div>

                        {/* --- FOOTER ACTIONS --- */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleCopy}
                                className={`
                                    relative px-12 py-4 font-teko text-2xl tracking-[0.15em] uppercase transition-all duration-200 clip-button
                                    ${copied 
                                        ? 'bg-white text-black hover:bg-gray-200' 
                                        : 'bg-[#ccff00] text-black hover:bg-[#b3e600] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3 relative z-10 font-bold">
                                    {copied ? (
                                        <>
                                            <span>SUCCESS</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </>
                                    ) : (
                                        <>
                                            <span>COPY TO CLIPBOARD</span>
                                            <span className="bg-black/20 px-2 text-sm py-1 rounded">CTRL+C</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}