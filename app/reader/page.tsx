'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSeries } from '@/lib/api/comic';
import { Series } from '@/types/comic';

export default function ReaderFeed() {
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [filter, setFilter] = useState('popular'); // popular, new, trending

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const data = await getSeries(filter);
                setSeriesList(data);
            } catch (e) {
                console.error("Failed to fetch series for reader", e);
            }
        };
        fetchSeries();
    }, [filter]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-8xl font-teko uppercase text-white mb-4 tracking-tighter">
                        Comic<span className="text-[#ccff00]">.Reader</span>
                    </h1>
                    <p className="font-rajdhani text-gray-400 tracking-[0.5em] uppercase text-sm">Global Repository</p>
                </div>

                {/* Filter Bar */}
                <div className="flex justify-center gap-8 mb-12 border-b border-white/10 pb-4">
                    {['Popular', 'Trending', 'New'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f.toLowerCase())}
                            className={`font-teko text-3xl uppercase transition-colors ${filter === f.toLowerCase() ? 'text-[#ccff00]' : 'text-gray-600 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Series Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {seriesList.map(series => (
                        <Link key={(series as any)._id || series.id} href={`/reader/${(series as any)._id || series.id}`} className="group">
                            <div className="relative aspect-[2/3] bg-neutral-900 overflow-hidden mb-3">
                                <img src={series.coverImage} alt={series.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0" />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-rajdhani border border-white/10 uppercase tracking-widest">
                                    {series.status}
                                </div>
                            </div>
                            <h2 className="text-3xl font-teko uppercase leading-none mb-1 group-hover:text-[#ccff00] transition-colors">{series.title}</h2>
                            <p className="font-rajdhani text-xs text-gray-500 uppercase tracking-wider">{series.author}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
