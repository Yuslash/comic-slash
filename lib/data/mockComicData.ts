import { ComicData } from '@/types/comic';

export const READER_DATA: ComicData = [
    {
        id: 1,
        root: {
            id: 'split-1',
            type: 'split',
            direction: 'horizontal',
            childrenSizes: [50, 50],
            children: [
                {
                    id: 'frame-1a',
                    type: 'frame',
                    image: 'https://placehold.co/900x1200/222/555?text=CHARACTER+A',
                    imageConfig: { scale: 100, x: 50, y: 50 }
                },
                {
                    id: 'frame-1b',
                    type: 'frame',
                    image: 'https://placehold.co/900x1200/333/666?text=CHARACTER+B',
                    imageConfig: { scale: 100, x: 50, y: 50 }
                }
            ]
        },
        dialogue: [
            { text: "Grace, run the diagnostics again. Something is wrong.", x: 5, y: 80, style: "normal" },
            { text: "I told you! The probability is 99.9%!", x: 90, y: 15, style: "shout" }
        ]
    },
    {
        id: 2,
        root: {
            id: 'frame-2a',
            type: 'frame',
            image: 'https://placehold.co/1920x800/550000/fff?text=IMPACT!',
            imageConfig: { scale: 100, x: 50, y: 50 }
        },
        dialogue: [
            { text: "BOOM!", x: 10, y: 20, style: "shout" }
        ]
    },
    {
        id: 3,
        root: {
            id: 'split-3',
            type: 'split',
            direction: 'vertical',
            childrenSizes: [50, 25, 25],
            children: [
                {
                    id: 'frame-3a',
                    type: 'frame',
                    image: 'https://placehold.co/800x1200/112211/fff?text=FULL+BODY',
                    imageConfig: { scale: 100, x: 50, y: 50 }
                },
                {
                    id: 'frame-3b',
                    type: 'frame',
                    image: 'https://placehold.co/600x600/221122/fff?text=EYES',
                    imageConfig: { scale: 100, x: 50, y: 50 }
                },
                {
                    id: 'frame-3c',
                    type: 'frame',
                    image: 'https://placehold.co/600x600/333333/fff?text=HAND',
                    imageConfig: { scale: 100, x: 50, y: 50 }
                }
            ]
        },
        dialogue: [
            { text: "It's finally over...", x: 10, y: 90, style: "normal" }
        ]
    }
];
