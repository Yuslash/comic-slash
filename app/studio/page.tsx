'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Series } from '@/types/comic';
import { getSeries, createSeries, updateSeries } from '@/lib/api/comic';
import { getMe } from '@/lib/api/auth';
import EditableImage from '@/components/ui/EditableImage';
import ComicLoader from '@/components/ui/ComicLoader';

export default function StudioDashboard() {
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const user = await getMe();
            if (!user) {
                router.push('/login');
                return;
            }
            try {
                // Fetch ONLY my series
                const allSeries = await getSeries('new', true);
                setSeriesList(allSeries);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const handleCreateSeries = async () => {
        if (!newTitle) return;
        try {
            const newSeries = await createSeries({
                title: newTitle,
                author: newAuthor || 'Anonymous',
                description: "New Series",
                tags: []
            });
            setSeriesList([...seriesList, newSeries]);
            setShowCreateModal(false);
            setNewTitle('');
            setNewAuthor('');
        } catch (e) {
            alert('Error creating series');
        }
    };

    return (
        <ComicLoader isLoading={loading}>
            <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
                {/* ... existing content ... */}
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link href="/" className="text-gray-400 hover:text-[#ccff00] font-rajdhani uppercase tracking-wider flex items-center gap-2 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-6xl font-teko uppercase text-white mb-2">My Studio</h1>
                            <p className="font-rajdhani text-gray-400 tracking-widest uppercase">Manage your serialized Works</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#ccff00] text-black font-teko text-2xl px-8 py-2 hover:bg-white transition-colors uppercase tracking-wide"
                        >
                            + Create New Series
                        </button>
                    </div>

                    {/* Series Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {seriesList.map(series => (
                            <div key={(series as any)._id || series.id} className="relative group mb-4">
                                <div className="relative aspect-[2/3] bg-neutral-900 border border-white/10 overflow-hidden group-hover:border-[#ccff00] transition-colors">
                                    <EditableImage
                                        src={series.coverImage || 'https://placehold.co/400x600/222/fff?text=No+Cover'}
                                        alt={series.title}
                                        className="w-full h-full"
                                        onUpdate={async (url, fileId) => {
                                            // Update series cover
                                            try {
                                                await updateSeries((series as any)._id || series.id, { coverImage: url, coverImageId: fileId });
                                                // Refresh locally
                                                setSeriesList(seriesList.map(s => (s as any)._id === (series as any)._id ? { ...s, coverImage: url } : s));
                                            } catch (e) { console.error(e) }
                                        }}
                                    />
                                    <Link href={`/studio/${(series as any)._id || series.id}`} className="absolute inset-0 z-0 pointer-events-none"></Link>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                                        <h2 className="text-4xl font-teko uppercase leading-none mb-1 group-hover:text-[#ccff00] transition-colors">{series.title}</h2>
                                        <p className="font-rajdhani text-sm text-gray-400">{series.author}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 text-xs font-rajdhani border border-white/20 pointer-events-none">
                                        {series.status ? series.status.toUpperCase() : 'ONGOING'}
                                    </div>
                                </div>
                                <Link href={`/studio/${(series as any)._id || series.id}`} className="absolute inset-0 z-10"></Link>
                            </div>
                        ))}
                    </div>

                    {/* Create Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                            <div className="bg-[#111] border border-white/20 p-8 w-full max-w-md relative">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                >
                                    ✕
                                </button>
                                <h2 className="text-4xl font-teko uppercase mb-6 text-[#ccff00]">New Series</h2>

                                <div className="space-y-4 font-rajdhani">
                                    <div>
                                        <label className="block text-gray-400 mb-1 text-sm uppercase tracking-wider">Title</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full bg-black border border-white/20 p-3 text-white focus:border-[#ccff00] outline-none"
                                            placeholder="Enter series title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1 text-sm uppercase tracking-wider">Author</label>
                                        <input
                                            type="text"
                                            value={newAuthor}
                                            onChange={(e) => setNewAuthor(e.target.value)}
                                            className="w-full bg-black border border-white/20 p-3 text-white focus:border-[#ccff00] outline-none"
                                            placeholder="Pen name..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateSeries}
                                        className="w-full bg-[#ccff00] text-black font-teko text-xl py-3 mt-4 hover:bg-white transition-colors uppercase"
                                    >
                                        Create Series
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ComicLoader>
    );
}
