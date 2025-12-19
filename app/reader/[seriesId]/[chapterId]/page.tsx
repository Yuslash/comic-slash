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

    useEffect(() => {
        const init = async () => {
            if (chapterId && chapterId !== 'undefined') {
                const chap = await getChapterById(chapterId);
                if (chap) {
                    setChapter(chap);
                } else {
                    setError(true);
                }
            } else {
                setError(true);
            }
        };
        init();
    }, [chapterId, seriesId]);

    if (error) return <div className="h-screen bg-black text-red-500 flex items-center justify-center font-rajdhani">Chapter Not Available.</div>;
    if (!chapter) return <ComicLoader />;

    return (
        // Pass undefined as initialData if data is empty, so it falls back to demo data if we wanted, 
        // BUT here we want to show what we have. If empty, the reader might just be blank, which is correct.
        <ComicReader
            initialData={chapter.data && chapter.data.length > 0 ? chapter.data : undefined}
            title={chapter.title}
            backLink={`/reader/${seriesId}`}
        />
    );
}
