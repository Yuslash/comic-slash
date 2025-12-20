'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComicReader from '@/components/comic/ComicReader';
import { getChapterById } from '@/lib/api/comic';
import { Chapter } from '@/types/comic';
import ComicLoader from '@/components/ui/ComicLoader';

export default function ReaderChapterPage() {
    const params = useParams();
    const router = useRouter();
    const seriesId = params.seriesId as string;
    const chapterId = params.chapterId as string;
    const [chapter, setChapter] = useState<Chapter | undefined>(undefined);
    const [error, setError] = useState(false);
    const [locked, setLocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');

    useEffect(() => {
        const init = async () => {
            if (chapterId && chapterId !== 'undefined') {
                const chap = await getChapterById(chapterId);
                if (chap) {
                    setChapter(chap);
                    if (chap.password) {
                        setLocked(true);
                    }
                } else {
                    setError(true);
                }
            } else {
                setError(true);
            }
        };
        init();
    }, [chapterId, seriesId]);

    const handleUnlock = () => {
        if (!chapter || !chapter.password) return;
        if (passwordInput === chapter.password) {
            setLocked(false);
        } else {
            alert('Incorrect Password');
        }
    };

    if (error) return <div className="h-screen bg-black text-red-500 flex items-center justify-center font-rajdhani">Chapter Not Available.</div>;

    return (
        <ComicLoader isLoading={!chapter}>
            {chapter && (
                <>
                    {locked ? (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] text-white">
                            <div className="max-w-md w-full p-8 border border-white/10 bg-neutral-900">
                                <h1 className="text-4xl font-teko uppercase text-[#ccff00] mb-2">Restricted Access</h1>
                                <p className="font-rajdhani text-gray-400 mb-6">This chapter is password protected.</p>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 text-white focus:border-[#ccff00] outline-none tracking-widest mb-4 font-rajdhani"
                                    placeholder="ENTER PASSWORD"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                />
                                <button
                                    onClick={handleUnlock}
                                    className="w-full bg-[#ccff00] text-black font-teko text-xl py-3 hover:bg-white transition-colors uppercase"
                                >
                                    Unlock Chapter
                                </button>
                                <button
                                    onClick={() => router.back()}
                                    className="w-full text-gray-500 font-rajdhani text-sm mt-4 hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ComicReader
                            initialData={chapter.data && chapter.data.length > 0 ? chapter.data : undefined}
                            title={chapter.title}
                            backLink={`/reader/${seriesId}`}
                        />
                    )}
                </>
            )}
        </ComicLoader>
    );
}
