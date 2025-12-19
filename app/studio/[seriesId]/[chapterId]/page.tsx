'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComicEditor from '@/components/comic/ComicEditor';
import { getChapterById, saveChapter, getSeriesById } from '@/lib/api/comic';
import { getMe } from '@/lib/api/auth';
import { Chapter } from '@/types/comic';
import ComicLoader from '@/components/ui/ComicLoader';

export default function ChapterEditorPage() {
    const params = useParams();
    const router = useRouter();
    const seriesId = params.seriesId as string;
    const chapterId = params.chapterId as string;
    const [chapter, setChapter] = useState<Chapter | undefined>(undefined);
    const [seriesTitle, setSeriesTitle] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveError, setSaveError] = useState(false);

    // Track if page is unloading to suppress errors
    const isUnmountingRef = useRef(false);

    useEffect(() => {
        const init = async () => {
            const user = await getMe();
            if (!user) {
                router.push('/login');
                return;
            }
            if (chapterId && chapterId !== 'undefined') {
                const chap = await getChapterById(chapterId);
                if (chap) {
                    setChapter(chap);
                    const series = await getSeriesById(seriesId);
                    if (series) setSeriesTitle(series.title);
                }
            }
        };
        init();

        // Native Unload Safety
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            isUnmountingRef.current = true;
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            isUnmountingRef.current = true;
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [chapterId, seriesId, router]);

    const handleSave = async (data: any, isUnmount = false) => {
        if (!chapter) return;

        // If explicitly unmounting OR we detected browser unload, skip UI updates
        const isExiting = isUnmount || isUnmountingRef.current;

        if (!isExiting) {
            setIsSaving(true);
            setSaveError(false);
        }

        try {
            // @ts-ignore
            const id = chapter._id || chapter.id;

            const promise = saveChapter(id, data);

            if (isExiting) {
                // Fire and forget, suppress all errors
                promise.catch(e => console.log("Background save (exit):", e));
                return;
            }

            await promise;
            console.log("Saved chapter to backend");
            setLastSaved(new Date());
        } catch (e) {
            if (isExiting) return; // Suppress error on exit

            console.error("Failed to save", e);
            setSaveError(true);
            // NO ALERT - Alerts are disruptive.
        } finally {
            if (!isExiting) setIsSaving(false);
        }
    };

    return (
        <ComicLoader isLoading={!chapter}>
            {chapter && (
                <div className="h-screen overflow-hidden relative">
                    <ComicEditor
                        initialData={chapter.data && chapter.data.length > 0 ? chapter.data : undefined}
                        onSave={handleSave}
                        backLink={`/studio/${seriesId}`}
                        seriesTitle={seriesTitle}
                        chapterTitle={chapter.title}
                    />

                    {/* Save Status Indicator */}
                    <div className={`absolute bottom-4 right-4 z-[1000] border rounded-full px-3 py-1 text-xs font-mono flex items-center gap-2 pointer-events-none transition-colors duration-300
                        ${saveError
                            ? 'bg-red-900/80 border-red-500/50 text-red-200'
                            : 'bg-black/80 border-white/10 text-gray-400'
                        }
                    `}>
                        {saveError ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span>SAVE FAILED (RETRYING...)</span>
                            </>
                        ) : isSaving ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                                <span className="text-neon-green">SAVING...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-gray-600" />
                                <span>SAVED {lastSaved ? lastSaved.toLocaleTimeString() : ''}</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </ComicLoader>
    );
}
