'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Series, Chapter } from '@/types/comic';
import { getSeriesById, getChapters, createChapter, updateSeries, updateChapterMetadata, deleteChapter } from '@/lib/api/comic';
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
                    // Fetch mine=true to get unpublished chapters too (and explicit server check)
                    const c = await getChapters(seriesId, true);
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

    const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
    const [chapterToLock, setChapterToLock] = useState<Chapter | null>(null);
    const [passwordInput, setPasswordInput] = useState('');

    const handleDeleteChapter = async () => {
        if (!chapterToDelete) return;
        try {
            await deleteChapter(seriesId, (chapterToDelete as any)._id || chapterToDelete.id);
            setChapters(chapters.filter(c => ((c as any)._id || c.id) !== ((chapterToDelete as any)._id || chapterToDelete.id)));
            setChapterToDelete(null);
        } catch (e) {
            alert('Failed to delete chapter');
        }
    };

    const handleUpdatePassword = async () => {
        if (!chapterToLock) return;
        try {
            // If empty password, it unlocks it (removes password)
            await updateChapterMetadata((chapterToLock as any)._id || chapterToLock.id, { password: passwordInput });

            // Update local state
            setChapters(chapters.map(c => {
                if (((c as any)._id || c.id) === ((chapterToLock as any)._id || chapterToLock.id)) {
                    return { ...c, password: passwordInput || undefined };
                }
                return c;
            }));

            setChapterToLock(null);
            setPasswordInput('');
        } catch (e) {
            alert('Failed to update password');
        }
    };

    const openLockModal = (e: React.MouseEvent, chapter: Chapter) => {
        e.preventDefault();
        e.stopPropagation();
        setChapterToLock(chapter);
        setPasswordInput(chapter.password || '');
    };

    const openDeleteModal = (e: React.MouseEvent, chapter: Chapter) => {
        e.preventDefault();
        e.stopPropagation();
        setChapterToDelete(chapter);
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
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const newStatus = !series.published;
                                                await updateSeries(seriesId, { published: newStatus });
                                                setSeries({ ...series, published: newStatus });
                                            } catch (e) { alert("Failed to update status"); }
                                        }}
                                        className={`px-4 py-1 text-sm font-teko uppercase tracking-widest border transition-colors ${series.published
                                            ? 'bg-[#ccff00] text-black border-[#ccff00] hover:bg-white hover:border-white'
                                            : 'bg-transparent text-gray-500 border-gray-500 hover:text-white hover:border-white'
                                            }`}
                                    >
                                        {series.published ? 'PUBLISHED' : 'DRAFT (HOLD)'}
                                    </button>
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

                                <div className="max-w-xl">
                                    <textarea
                                        value={series.description || ''}
                                        onChange={(e) => setSeries({ ...series, description: e.target.value })}
                                        className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-[#ccff00] p-2 -ml-2 text-gray-400 font-rajdhani text-lg leading-relaxed outline-none resize-none min-h-[100px] transition-colors mb-2"
                                        placeholder="Add a description..."
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                await updateSeries(seriesId, { description: series.description });
                                                alert("Description Saved!");
                                            } catch (error) {
                                                console.error("Failed to update description");
                                            }
                                        }}
                                        className="bg-[#ccff00] text-black font-teko text-lg px-4 py-1 hover:bg-white transition-colors uppercase tracking-wide"
                                    >
                                        Save Description
                                    </button>
                                </div>
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
                                        <div key={(chapter as any)._id || chapter.id} className="relative group block">
                                            <Link href={`/studio/${seriesId}/${(chapter as any)._id || chapter.id}`}>
                                                <div className="flex items-center gap-6 p-4 bg-neutral-900/50 border border-white/5 hover:border-[#ccff00]/50 transition-colors relative">
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
                                                            <span className="font-teko text-2xl text-[#ccff00] transition-colors">#{chapter.order}</span>
                                                            <h3 className="font-teko text-3xl text-white uppercase flex items-center gap-3">
                                                                {chapter.title}
                                                                {chapter.password && (
                                                                    <span className="text-xs border border-yellow-500/50 text-yellow-500 px-2 py-0.5 rounded-sm font-rajdhani tracking-widest">
                                                                        LOCKED
                                                                    </span>
                                                                )}
                                                            </h3>
                                                        </div>
                                                        <p className="font-rajdhani text-xs text-gray-500 uppercase tracking-wider">
                                                            Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    {/* Right side container */}
                                                    <div className="flex items-center gap-4">
                                                        {/* Edit Label - Hides on hover */}
                                                        <div className="font-rajdhani text-sm text-gray-500 group-hover:opacity-0 transition-opacity duration-200 uppercase tracking-widest px-4 absolute right-4">
                                                            Edit &rarr;
                                                        </div>

                                                        {/* Action Buttons - Shows on hover */}
                                                        <div className="flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    try {
                                                                        const newStatus = !chapter.published;
                                                                        // Check dependency: Cannot publish chapter if series is DRAFT
                                                                        if (newStatus === true && !series.published) {
                                                                            alert("You cannot publish a chapter while the Series is in DRAFT/HOLD mode. Please publish the series first.");
                                                                            return;
                                                                        }

                                                                        await updateChapterMetadata((chapter as any)._id || chapter.id, { published: newStatus });
                                                                        setChapters(chapters.map(c => (c as any)._id === (chapter as any)._id ? { ...c, published: newStatus } : c));
                                                                    } catch (err) { alert('Failed to update publish status'); }
                                                                }}
                                                                className={`w-10 h-10 flex items-center justify-center border transition-colors bg-black ${chapter.published
                                                                    ? 'text-[#ccff00] border-[#ccff00] hover:bg-[#ccff00] hover:text-black'
                                                                    : 'text-gray-600 border-white/10 hover:text-white hover:border-white'
                                                                    }`}
                                                                title={chapter.published ? "Published (Click to Unpublish)" : "Draft (Click to Publish)"}
                                                            >
                                                                {chapter.published ? '👁' : 'Ø'}
                                                            </button>
                                                            <button
                                                                onClick={(e) => openLockModal(e, chapter)}
                                                                className={`w-10 h-10 flex items-center justify-center border transition-colors ${chapter.password
                                                                    ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-white'
                                                                    : 'bg-black text-gray-400 border-white/20 hover:text-[#ccff00] hover:border-[#ccff00]'
                                                                    }`}
                                                                title={chapter.password ? "Unlock Chapter" : "Lock Chapter"}
                                                            >
                                                                {chapter.password ? '🔒' : '🔓'}
                                                            </button>
                                                            <button
                                                                onClick={(e) => openDeleteModal(e, chapter)}
                                                                className="w-10 h-10 flex items-center justify-center bg-black border border-white/20 text-gray-400 hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors"
                                                                title="Delete Chapter"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chapter Delete Modal */}
                        {chapterToDelete && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                                <div className="bg-[#111] border border-red-500/30 p-8 w-full max-w-sm relative shadow-2xl shadow-red-900/20">
                                    <button
                                        onClick={() => setChapterToDelete(null)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                    <h2 className="text-3xl font-teko uppercase mb-4 text-red-500">Delete Chapter?</h2>
                                    <p className="font-rajdhani text-gray-400 mb-6">
                                        Are you sure you want to delete <span className="text-white">"{chapterToDelete.title}"</span>? This cannot be undone.
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setChapterToDelete(null)}
                                            className="flex-1 bg-neutral-800 text-gray-300 font-teko text-xl py-2 hover:bg-neutral-700 transition-colors uppercase"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteChapter}
                                            className="flex-1 bg-red-600 text-white font-teko text-xl py-2 hover:bg-red-500 transition-colors uppercase"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chapter Lock Modal */}
                        {chapterToLock && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                                <div className="bg-[#111] border border-[#ccff00]/30 p-8 w-full max-w-sm relative shadow-2xl shadow-[#ccff00]/10">
                                    <button
                                        onClick={() => setChapterToLock(null)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                    <h2 className="text-3xl font-teko uppercase mb-2 text-[#ccff00]">
                                        {chapterToLock.password ? 'Update Password' : 'Lock Chapter'}
                                    </h2>
                                    <p className="font-rajdhani text-gray-400 mb-6 text-sm">
                                        Set a password to restrict access to this chapter. clear to unlock.
                                    </p>

                                    <div className="space-y-4 font-rajdhani">
                                        <div>
                                            <label className="block text-gray-400 mb-1 text-sm uppercase tracking-wider">Password</label>
                                            <input
                                                type="text"
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                className="w-full bg-black border border-white/20 p-3 text-white focus:border-[#ccff00] outline-none tracking-widest"
                                                placeholder="Enter password..."
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 mt-4">
                                            <button
                                                onClick={handleUpdatePassword}
                                                disabled={!passwordInput && !chapterToLock.password} // Disable if empty and trying to lock new
                                                className="w-full bg-[#ccff00] text-black font-teko text-xl py-2 hover:bg-white transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {chapterToLock.password ? 'Update Password' : 'Lock Chapter'}
                                            </button>

                                            {chapterToLock.password && (
                                                <button
                                                    onClick={async () => {
                                                        setPasswordInput(''); // Clear input state
                                                        // Explicitly call update with empty string
                                                        try {
                                                            await updateChapterMetadata((chapterToLock as any)._id || chapterToLock.id, { password: '' });
                                                            setChapters(chapters.map(c => {
                                                                if (((c as any)._id || c.id) === ((chapterToLock as any)._id || chapterToLock.id)) {
                                                                    return { ...c, password: undefined };
                                                                }
                                                                return c;
                                                            }));
                                                            setChapterToLock(null);
                                                            setPasswordInput('');
                                                        } catch (e) { alert('Failed to unlock'); }
                                                    }}
                                                    className="w-full bg-transparent border border-red-500 text-red-500 font-teko text-xl py-2 hover:bg-red-500 hover:text-white transition-colors uppercase"
                                                >
                                                    Remove Lock (Unlock)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ComicLoader >
    );
}
