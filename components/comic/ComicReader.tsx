"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ComicData } from '@/types/comic';
import ComicSceneRenderer from './ComicSceneRenderer';
import FilmStrip from '@/components/ui/FilmStrip';
import { collectOrderedFrames } from '@/lib/layoutUtils';
import { READER_DATA } from '@/lib/data/mockComicData';

// New Components
import { ReaderHeader } from './reader/ReaderHeader';
import { ReaderNavigation } from './reader/ReaderNavigation';
import { ReaderProgress } from './reader/ReaderProgress';
import { InstructionModal } from './reader/InstructionModal';

interface ComicReaderProps {
    initialData?: ComicData;
    title?: string;
    backLink?: string;
}

export default function ComicReader({ initialData, title, backLink }: ComicReaderProps) {
    const data = initialData || READER_DATA;
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = data.length;

    // --- State for Menu & Spoilers ---
    const [revealedFrames, setRevealedFrames] = useState<Record<string, Set<string>>>({});
    const [isAutoReveal, setIsAutoReveal] = useState(false);
    const [isAllRevealed, setIsAllRevealed] = useState(false); // New state to track if "Reveal All" was used
    const [isUIHidden, setIsUIHidden] = useState(false); // Immersive Mode
    const [showInstruction, setShowInstruction] = useState(false);

    const currentScene = data[currentSlide];

    const moveSlide = (direction: number) => {
        let newSlide = currentSlide + direction;
        if (newSlide < 0) newSlide = 0;
        if (newSlide >= totalSlides) newSlide = totalSlides - 1;
        setCurrentSlide(newSlide);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') moveSlide(1);
            if (e.key === 'ArrowLeft') moveSlide(-1);
            if (e.key === 'h') setIsUIHidden(prev => !prev); // Shortcut for Hide UI
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    // --- Spoiler Logic ---

    // Reveal a specific frame
    const revealFrame = useCallback((sceneId: string | number, frameId: string) => {
        setRevealedFrames(prev => {
            const safeId = String(sceneId);
            const sceneSet = new Set(prev[safeId] || []);
            sceneSet.add(frameId);
            return { ...prev, [safeId]: sceneSet };
        });
    }, []);

    // Reveal ALL frames in ENTIRE CHAPTER
    const revealAllInChapter = useCallback(() => {
        const newRevealedState: Record<string, Set<string>> = {};

        data.forEach(scene => {
            if (scene.root) {
                const frames = collectOrderedFrames(scene.root);
                const allIds = new Set(frames.map(f => f.id));
                newRevealedState[String(scene.id)] = allIds;
            }
        });

        setRevealedFrames(newRevealedState);
        setIsAllRevealed(true); // Mark as all revealed
        setIsAutoReveal(false); // Disable auto reveal logically
    }, [data]);

    useEffect(() => {
        const hasSeen = localStorage.getItem('comic_reader_instruction_seen');
        if (!hasSeen) {
            setShowInstruction(true);
        }
    }, []);

    const handleInstructionClose = (dontShowAgain: boolean) => {
        if (dontShowAgain) {
            localStorage.setItem('comic_reader_instruction_seen', 'true');
        }
        setShowInstruction(false);
    };

    // Auto Reveal Timer
    useEffect(() => {
        if (!isAutoReveal || !currentScene?.root || isAllRevealed) return; // Stop if all revealed

        const interval = setInterval(() => {
            const safeId = String(currentScene.id);
            const frames = collectOrderedFrames(currentScene.root);
            const revealed = revealedFrames[safeId] || new Set();

            // Find first unrevealed frame (sorted by order logic in utils)
            const nextFrame = frames.find(f => !revealed.has(f.id));

            if (nextFrame) {
                revealFrame(safeId, nextFrame.id);
            } else {
                // Optional: Stop auto reveal if done? 
                // setIsAutoReveal(false);
            }
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [isAutoReveal, currentScene, revealedFrames, revealFrame, isAllRevealed]);


    return (
        <div className="w-screen h-screen bg-bg-dark text-white font-rajdhani overflow-hidden relative animate-in fade-in duration-1000">
            {/* CRT & Overlay FX */}
            <div className="scanlines"></div>
            <div className="vignette"></div>

            {/* Film Strips */}
            <FilmStrip />

            {/* Top Bar */}
            <ReaderHeader
                title={title}
                backLink={backLink}
                currentSlideIndex={currentSlide}
                isAutoReveal={isAutoReveal}
                setIsAutoReveal={setIsAutoReveal}
                onRevealAll={revealAllInChapter}
                isAllRevealed={isAllRevealed}
                isUIHidden={isUIHidden}
                setIsUIHidden={setIsUIHidden}
            />

            {/* Navigation */}
            <ReaderNavigation
                onPrev={() => moveSlide(-1)}
                onNext={() => moveSlide(1)}
            />

            {/* Progress Bar */}
            {!isUIHidden && (
                <ReaderProgress
                    totalSlides={totalSlides}
                    currentSlide={currentSlide}
                />
            )}

            {/* Viewport & Track */}
            <div
                className="comic-viewport z-0 pt-[60px] pb-[60px]"
            >
                <div
                    className="comic-track"
                    style={{
                        width: `${totalSlides * 100}%`,
                        transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`
                    }}
                >

                    {data.map((scene, index) => {
                        const isVisible = Math.abs(currentSlide - index) <= 1;

                        return (
                            <div
                                key={scene.id}
                                style={{
                                    width: `${100 / totalSlides}%`,
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    flexGrow: 0
                                }}
                            >
                                {isVisible ? (
                                    <div className="scene">
                                        <ComicSceneRenderer
                                            scene={scene}
                                            isReader={true}
                                            revealedFrameIds={revealedFrames[String(scene.id)]}
                                            onRevealFrame={(id) => revealFrame(scene.id, id)}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full" /> // Placeholder
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Instructional Modal */}
            {showInstruction && (
                <InstructionModal onClose={handleInstructionClose} />
            )}
        </div>

    );
}
