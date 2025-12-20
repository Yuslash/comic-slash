'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Series } from '@/types/comic';
import { getSeries, createSeries, updateSeries, deleteSeries } from '@/lib/api/comic';
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

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);
    const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');

    const handleDeleteSeries = async () => {
        if (!seriesToDelete || deleteConfirmTitle !== seriesToDelete.title) return;
        try {
            await deleteSeries(seriesToDelete._id || seriesToDelete.id);
            setSeriesList(seriesList.filter(s => (s._id || s.id) !== (seriesToDelete._id || seriesToDelete.id)));
            setShowDeleteModal(false);
            setSeriesToDelete(null);
            setDeleteConfirmTitle('');
        } catch (e) {
            alert('Error deleting series');
        }
    };

    const openDeleteModal = (e: React.MouseEvent, series: Series) => {
        e.preventDefault();
        e.stopPropagation();
        setSeriesToDelete(series);
        setShowDeleteModal(true);
        setDeleteConfirmTitle('');
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
                            <div key={series._id || series.id} className="relative group mb-4">
                                <div className="relative aspect-[2/3] bg-neutral-900 border border-white/10 overflow-hidden group-hover:border-[#ccff00] transition-colors">
                                    <EditableImage
                                        src={series.coverImage || 'https://placehold.co/400x600/222/fff?text=No+Cover'}
                                        alt={series.title}
                                        className="w-full h-full"
                                        onUpdate={async (url, fileId) => {
                                            // Update series cover
                                            try {
                                                await updateSeries(series._id || series.id, { coverImage: url, coverImageId: fileId });
                                                // Refresh locally
                                                setSeriesList(seriesList.map(s => (s._id || s.id) === (series._id || series.id) ? { ...s, coverImage: url } : s));
                                            } catch (e) { console.error(e) }
                                        }}
                                    />
                                    <Link href={`/studio/${series._id || series.id}`} className="absolute inset-0 z-0 pointer-events-none"></Link>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                                        <h2 className="text-4xl font-teko uppercase leading-none mb-1 group-hover:text-[#ccff00] transition-colors">{series.title}</h2>
                                        <p className="font-rajdhani text-sm text-gray-400">{series.author}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 pointer-events-none z-20">
                                        <div className="bg-black/80 backdrop-blur px-3 py-1 text-xs font-rajdhani border border-white/20">
                                            {series.status ? series.status.toUpperCase() : 'ONGOING'}
                                        </div>
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                try {
                                                    const newStatus = !series.published;
                                                    await updateSeries(series._id || series.id, { published: newStatus });
                                                    setSeriesList(seriesList.map(s => (s._id || s.id) === (series._id || series.id) ? { ...s, published: newStatus } : s));
                                                } catch (err) { alert('Failed to update publish status'); }
                                            }}
                                            className={`pointer-events-auto px-3 py-1 text-xs font-rajdhani border border-white/20 uppercase transition-colors ${series.published ? 'bg-[#ccff00] text-black border-[#ccff00] font-bold' : 'bg-black/80 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {series.published ? 'PUBLISHED' : 'DRAFT'}
                                        </button>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => openDeleteModal(e, series)}
                                        className="absolute top-4 left-4 bg-red-500/80 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center backdrop-blur bg-opacity-0 group-hover:bg-opacity-100 opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/10 hover:border-red-500"
                                        title="Delete Series"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <Link href={`/studio/${series._id || series.id}`} className="absolute inset-0 z-10"></Link>
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

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && seriesToDelete && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                            <div className="bg-[#111] border border-red-500/30 p-8 w-full max-w-md relative shadow-2xl shadow-red-900/20">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setSeriesToDelete(null); }}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                >
                                    ✕
                                </button>
                                <h2 className="text-4xl font-teko uppercase mb-2 text-red-500">Delete Series?</h2>
                                <p className="font-rajdhani text-gray-400 mb-6 text-sm">
                                    This action cannot be undone. All chapters and images will be permanently lost.
                                </p>

                                <div className="space-y-4 font-rajdhani">
                                    <div>
                                        <label className="block text-gray-400 mb-1 text-sm uppercase tracking-wider">
                                            Type <span className="text-white font-bold">"{seriesToDelete.title}"</span> to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmTitle}
                                            onChange={(e) => setDeleteConfirmTitle(e.target.value)}
                                            className="w-full bg-black border border-white/20 p-3 text-white focus:border-red-500 outline-none placeholder-gray-700"
                                            placeholder={seriesToDelete.title}
                                        />
                                    </div>
                                    <button
                                        onClick={handleDeleteSeries}
                                        disabled={deleteConfirmTitle !== seriesToDelete.title}
                                        className={`w-full font-teko text-xl py-3 mt-4 transition-colors uppercase ${deleteConfirmTitle === seriesToDelete.title
                                            ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                                            : 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Confirm Delete
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
