import React, { useState } from 'react';
import { ComicData } from '@/types/comic';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: ComicData) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleImport = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (Array.isArray(parsed)) {
                onImport(parsed);
                onClose();
                setJsonInput('');
                setError('');
            } else {
                setError('Invalid JSON: Root must be an array of scenes.');
            }
        } catch (e) {
            setError('Invalid JSON: Could not parse.');
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#333] p-1 relative">
                {/* Decorative Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-neon-green"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-neon-green"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-neon-green"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-neon-green"></div>

                <div className="bg-black p-6 border border-[#222]">
                    <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
                        <h2 className="text-3xl font-teko uppercase tracking-widest text-white">
                            <span className="text-neon-green mr-2">//</span>Import Data
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white font-bold text-xl">
                            ✕
                        </button>
                    </div>

                    <p className="text-gray-500 mb-4 uppercase tracking-wider text-xs">
                        Paste your JSON data below to load it into the Studio. Warning: This will overwrite your current work.
                    </p>

                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"id": 1, "type": "split", ...}]'
                        className="w-full h-64 bg-[#0f0f0f] border border-[#333] text-neon-green font-mono text-xs p-4 focus:border-neon-green outline-none resize-none mb-4 custom-scrollbar"
                    />

                    {error && (
                        <div className="text-red-500 text-xs uppercase tracking-wider mb-4 text-center font-bold border border-red-900/50 bg-red-900/10 p-2">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-[#1a1a1a] text-gray-400 font-teko text-xl tracking-widest hover:bg-[#222] transition-colors uppercase border border-[#333]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            className="flex-1 py-3 bg-[#ccff00] text-black font-teko text-xl tracking-widest hover:opacity-90 transition-opacity uppercase"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}
                        >
                            Load Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
