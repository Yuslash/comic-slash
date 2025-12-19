'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSeriesById, getChapters } from '@/lib/api/comic';
import { Series, Chapter } from '@/types/comic';
import ComicLoader from '@/components/ui/ComicLoader';

export default function ReaderSeriesPage() {
    const params = useParams();
    const seriesId = params.seriesId as string;
    const [series, setSeries] = useState<Series | undefined>(undefined);
    const [chapters, setChapters] = useState<Chapter[]>([]);

    useEffect(() => {
        const init = async () => {
            if (seriesId) {
                const s = await getSeriesById(seriesId);
                setSeries(s);
                const c = await getChapters(seriesId);
                setChapters(c);
            }
        };
        init();
    }, [seriesId]);

    return (
        <ComicLoader isLoading={!series}>
            {series && (
                <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
                    {/* Hero Section */}
                    <div className="relative h-[50vh] w-full overflow-hidden">
                        <div className="absolute inset-0 bg-neutral-900">
                            <img src={series.coverImage} className="w-full h-full object-cover opacity-30 blur-sm" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto flex gap-8 items-end">
                            <div className="w-48 aspect-[2/3] bg-black border border-white/20 hidden md:block shrink-0 shadow-2xl">
                                <img src={series.coverImage} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex gap-2 mb-4">
                                    {series.tags.map(tag => (
                                        <span key={tag} className="bg-[#ccff00]/10 border border-[#ccff00]/20 px-3 py-1 text-xs font-rajdhani text-[#ccff00] uppercase tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-6xl md:text-8xl font-teko uppercase leading-none mb-4 text-white drop-shadow-lg">{series.title}</h1>
                                <p className="font-rajdhani text-xl text-gray-300 max-w-2xl leading-relaxed mb-6">{series.description}</p>
                                <div className="flex items-center gap-6 font-rajdhani text-sm text-gray-400 uppercase tracking-widest">
                                    <span>By {series.author}</span>
                                    <span>•</span>
                                    <span>{series.status}</span>
                                    <span>•</span>
                                    <span>{chapters.length} Chapters</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-8">
                        <div className="mb-8 border-b border-white/10 pb-4">
                            <h3 className="font-teko text-3xl uppercase text-gray-400">Chapters</h3>
                        </div>

                        <div className="grid gap-2">
                            {chapters.length === 0 ? (
                                <div className="text-gray-500 font-rajdhani">No chapters released yet.</div>
                            ) : (
                                chapters.map(chapter => (
                                    <Link key={(chapter as any)._id || chapter.id} href={`/reader/${seriesId}/${(chapter as any)._id || chapter.id}`} className="group block">
                                        <div className="flex items-center justify-between p-4 bg-neutral-900/30 border-l-2 border-transparent hover:bg-neutral-900 hover:border-[#ccff00] transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="font-teko text-gray-500 text-2xl group-hover:text-[#ccff00] w-12 text-center">
                                                    {chapter.order.toString().padStart(2, '0')}
                                                </div>
                                                <div className="font-rajdhani font-semibold text-lg group-hover:text-white text-gray-300 uppercase tracking-wide">
                                                    {chapter.title}
                                                </div>
                                            </div>
                                            <div className="font-rajdhani text-xs text-gray-600 uppercase tracking-widest">
                                                {new Date(chapter.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ComicLoader>
    );
}
