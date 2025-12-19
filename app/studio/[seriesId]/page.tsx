'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Series, Chapter } from '@/types/comic';
import { getSeriesById, getChapters, createChapter, updateSeries, updateChapterMetadata } from '@/lib/api/comic';
import { getMe } from '@/lib/api/auth';
import EditableImage from '@/components/ui/EditableImage';
import ComicLoader from '@/components/ui/ComicLoader';

export default function SeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const seriesId = params.seriesId as string;
    const [series, setSeries] = useState<Series | undefined>(undefined);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const user = await getMe();
            if (!user) {
                router.push('/login');
                return;
            }
            if (seriesId) {
                const s = await getSeriesById(seriesId);
                if (s) {
                    setSeries(s);
                    const c = await getChapters(seriesId);
                    setChapters(c);
                }
            }
            setLoading(false);
        };
        init();
    }, [seriesId, router]);

    const handleCreateChapter = async () => {
        try {
            const nextOrder = chapters.length + 1;
            const newChapter = await createChapter(seriesId, {
                title: `Chapter ${nextOrder}`,
                order: nextOrder
            });
            setChapters([...chapters, newChapter]);
        } catch (e) {
            alert('Failed to create chapter');
        }
    };

    return (
        <ComicLoader isLoading={loading}>
            <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
                {/* Content... */}
                {!series ? (
                    <div className="p-8 text-white font-rajdhani">Series Not Found</div>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <Link href="/studio" className="text-gray-500 hover:text-[#ccff00] mb-8 inline-block font-rajdhani uppercase tracking-widest">
                            &lt; Back to Dashboard
                        </Link>

                        <div className="flex gap-12 mb-16">
                            <div className="w-1/3 aspect-[2/3] max-w-sm bg-neutral-900 border border-white/10 shrink-0">
                                <EditableImage
                                    src={series.coverImage || 'https://placehold.co/400x600/222/fff?text=No+Cover'}
                                    alt={series.title}
                                    className="w-full h-full"
                                    folderPath={`/${series.title.replace(/[^a-zA-Z0-9]/g, '_')}`} // Sanitize title for folder
                                    fileName="cover"
                                    onUpdate={async (url) => {
                                        try {
                                            await updateSeries(seriesId, { coverImage: url });
                                            setSeries({ ...series, coverImage: url });
                                        } catch (e) {
                                            console.error(e);
                                            alert("Failed to update cover");
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <div className="inline-block bg-[#ccff00] text-black px-2 py-0.5 text-xs font-bold uppercase mb-4 font-rajdhani tracking-wider">
                                    {series.status}
                                </div>
                                <h1 className="text-7xl font-teko uppercase leading-none mb-2 text-white">{series.title}</h1>
                                <p className="text-2xl text-gray-500 font-teko uppercase mb-8">By {series.author}</p>

                                <div className="flex gap-2 mb-6">
                                    {series.tags && series.tags.map(tag => (
                                        <span key={tag} className="border border-white/20 px-3 py-1 text-xs font-rajdhani text-gray-400 uppercase tracking-widest">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <p className="max-w-xl text-gray-400 font-rajdhani text-lg leading-relaxed">
                                    {series.description}
                                </p>
                            </div>
                        </div>

                        {/* Chapters Section */}
                        <div className="border-t border-white/10 pt-12">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-4xl font-teko uppercase text-white">Chapters</h2>
                                <button
                                    onClick={handleCreateChapter}
                                    className="bg-white text-black font-teko text-xl px-6 py-2 hover:bg-[#ccff00] transition-colors uppercase tracking-wide"
                                >
                                    + New Chapter
                                </button>
                            </div>

                            <div className="space-y-4">
                                {chapters.length === 0 ? (
                                    <div className="text-gray-600 font-rajdhani italic">No chapters created yet. Start writing!</div>
                                ) : (
                                    chapters.map(chapter => (
                                        <Link key={(chapter as any)._id || chapter.id} href={`/studio/${seriesId}/${(chapter as any)._id || chapter.id}`} className="block group">
                                            <div className="flex items-center gap-6 p-4 bg-neutral-900/50 border border-white/5 hover:border-[#ccff00]/50 transition-colors">
                                                <div className="w-32 aspect-video bg-black shrink-0 relative overflow-hidden group/chapter-img z-20">
                                                    <EditableImage
                                                        src={chapter.coverImage || 'https://placehold.co/320x180/333/666?text=Chapter'}
                                                        alt={chapter.title}
                                                        className="w-full h-full"
                                                        folderPath={`/${series.title.replace(/[^a-zA-Z0-9]/g, '_')}`}
                                                        fileName={`chapter_${chapter.order}_cover`}
                                                        onUpdate={async (url) => {
                                                            try {
                                                                await updateChapterMetadata((chapter as any)._id || chapter.id, { coverImage: url });
                                                                // Refresh
                                                                setChapters(chapters.map(c => (c as any)._id === (chapter as any)._id ? { ...c, coverImage: url } : c));
                                                            } catch (e) { console.error(e) }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-4 mb-1">
                                                        <span className="font-teko text-2xl text-[#ccff00] group-hover:text-white transition-colors">#{chapter.order}</span>
                                                        <h3 className="font-teko text-3xl text-white uppercase">{chapter.title}</h3>
                                                    </div>
                                                    <p className="font-rajdhani text-xs text-gray-500 uppercase tracking-wider">
                                                        Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="font-rajdhani text-sm text-gray-500 group-hover:text-[#ccff00] transition-colors uppercase tracking-widest px-4">
                                                    Edit &rarr;
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ComicLoader>
    );
}
