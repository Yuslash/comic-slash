import { Series, Chapter, ComicData } from '@/types/comic';

// Mock Data Generators
const createMockSeries = (id: string, title: string): Series => ({
    id,
    title,
    author: 'Anonymous',
    coverImage: 'https://placehold.co/600x900/1a1a1a/cccccc?text=' + encodeURIComponent(title),
    description: 'A thrilling sci-fi adventure in a cyberpunk world.',
    tags: ['Sci-Fi', 'Action', 'Cyberpunk'],
    status: 'ongoing',
    updatedAt: new Date().toISOString()
});

const createMockChapter = (id: string, seriesId: string, order: number, title: string): Chapter => ({
    id,
    seriesId,
    title,
    order,
    coverImage: 'https://placehold.co/600x900/2a2a2a/cccccc?text=' + encodeURIComponent(title),
    data: [], // Starts empty
    updatedAt: new Date().toISOString()
});

// Initial Store Data
const INITIAL_SERIES: Series[] = [
    createMockSeries('series-1', 'Neon Genesis'),
    createMockSeries('series-2', 'Void Walker')
];

const INITIAL_CHAPTERS: Chapter[] = [
    createMockChapter('chap-1', 'series-1', 1, 'The Awakening'),
    createMockChapter('chap-2', 'series-1', 2, 'City of Lights'),
    createMockChapter('chap-3', 'series-2', 1, 'Into the Void')
];

// Storage Keys
const SERIES_KEY = 'comic-slash-series';
const CHAPTERS_KEY = 'comic-slash-chapters';

// Helper to check environment
const isBrowser = typeof window !== 'undefined';

// Store Implementation
export const store = {
    // --- SERIES ---
    getAllSeries: (): Series[] => {
        if (!isBrowser) return INITIAL_SERIES;
        const stored = localStorage.getItem(SERIES_KEY);
        if (!stored) {
            localStorage.setItem(SERIES_KEY, JSON.stringify(INITIAL_SERIES));
            return INITIAL_SERIES;
        }
        return JSON.parse(stored);
    },

    getSeriesById: (id: string): Series | undefined => {
        const all = store.getAllSeries();
        return all.find(s => s.id === id);
    },

    saveSeries: (series: Series) => {
        if (!isBrowser) return;
        const all = store.getAllSeries();
        const existingIndex = all.findIndex(s => s.id === series.id);

        let newAll;
        if (existingIndex >= 0) {
            newAll = [...all];
            newAll[existingIndex] = series;
        } else {
            newAll = [...all, series];
        }

        localStorage.setItem(SERIES_KEY, JSON.stringify(newAll));
    },

    createSeries: (title: string, author: string): Series => {
        const newSeries: Series = {
            id: `series-${Date.now()}`,
            title,
            author,
            description: 'New Series Description',
            tags: [],
            status: 'ongoing',
            updatedAt: new Date().toISOString(),
            coverImage: 'https://placehold.co/600x900/1a1a1a/cccccc?text=New+Series'
        };
        store.saveSeries(newSeries);
        return newSeries;
    },

    // --- CHAPTERS ---
    getChaptersBySeries: (seriesId: string): Chapter[] => {
        if (!isBrowser) return INITIAL_CHAPTERS.filter(c => c.seriesId === seriesId);
        const stored = localStorage.getItem(CHAPTERS_KEY);
        let all: Chapter[] = [];

        if (!stored) {
            localStorage.setItem(CHAPTERS_KEY, JSON.stringify(INITIAL_CHAPTERS));
            all = INITIAL_CHAPTERS;
        } else {
            all = JSON.parse(stored);
        }

        return all.filter(c => c.seriesId === seriesId).sort((a, b) => a.order - b.order);
    },

    getChapterById: (id: string): Chapter | undefined => {
        if (!isBrowser) return INITIAL_CHAPTERS.find(c => c.id === id);
        const stored = localStorage.getItem(CHAPTERS_KEY);
        const all: Chapter[] = stored ? JSON.parse(stored) : INITIAL_CHAPTERS;
        return all.find(c => c.id === id);
    },

    saveChapter: (chapter: Chapter) => {
        if (!isBrowser) return;
        const stored = localStorage.getItem(CHAPTERS_KEY);
        const all: Chapter[] = stored ? JSON.parse(stored) : INITIAL_CHAPTERS;

        const existingIndex = all.findIndex(c => c.id === chapter.id);
        let newAll;
        if (existingIndex >= 0) {
            newAll = [...all];
            newAll[existingIndex] = chapter;
        } else {
            newAll = [...all, chapter];
        }

        localStorage.setItem(CHAPTERS_KEY, JSON.stringify(newAll));
    },

    createChapter: (seriesId: string): Chapter => {
        const existing = store.getChaptersBySeries(seriesId);
        const nextOrder = existing.length > 0 ? Math.max(...existing.map(c => c.order)) + 1 : 1;

        const newChapter: Chapter = {
            id: `chap-${Date.now()}`,
            seriesId,
            title: `Chapter ${nextOrder}`,
            order: nextOrder,
            data: [], // Start empty
            updatedAt: new Date().toISOString(),
            coverImage: 'https://placehold.co/600x900/2a2a2a/cccccc?text=New+Chapter'
        };
        store.saveChapter(newChapter);
        return newChapter;
    }
};
