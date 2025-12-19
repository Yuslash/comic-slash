"use client";

import React, { useState } from 'react';
import ComicReader from '@/components/comic/ComicReader';
import { ComicData } from '@/types/comic';

export default function PreviewPage() {
    const [comicData, setComicData] = useState<ComicData | null>(null);
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (Array.isArray(parsed)) {
                setComicData(parsed);
                setError('');
            } else {
                setError('Invalid JSON: Root must be an array of scenes.');
            }
        } catch (e) {
            setError('Invalid JSON: Could not parse.');
        }
    };

    if (comicData) {
        return <ComicReader initialData={comicData} />;
    }

    return (
        <div className="w-screen h-screen bg-black text-white font-rajdhani flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background FX */}
            <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/111/111')] opacity-20 bg-cover bg-center pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-[#333] p-1">
                {/* Decorative Corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-neon-green"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-neon-green"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-neon-green"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-neon-green"></div>

                <div className="bg-black p-8 border border-[#222]">
                    <h1 className="text-4xl font-teko uppercase tracking-widest text-white mb-2 text-center">
                        <span className="text-neon-green mr-2">//</span>Preview Mode
                    </h1>
                    <p className="text-gray-500 text-center mb-6 uppercase tracking-wider text-sm">
                        Paste your Studio JSON data below to initialize the reader.
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

                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-[#ccff00] text-black font-teko text-2xl tracking-widest hover:opacity-90 transition-opacity uppercase"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}
                    >
                        Initialize Reader
                    </button>

                    <a href="/" className="block text-center text-gray-600 hover:text-white mt-4 text-xs uppercase tracking-widest transition-colors">
                        &lt; Return to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
