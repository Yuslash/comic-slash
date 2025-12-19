import React from 'react';
import { Scene } from '@/types/comic';
import DraggableBubble from './DraggableBubble';
import DraggableText from './DraggableText';
import DynamicRenderer from './dynamic/DynamicRenderer';
import { findFrameAt } from '@/lib/layoutUtils';
import { useState } from 'react';

interface ComicSceneRendererProps {
    scene: Scene;
    isActive?: boolean;
    onUpdateDialogue?: (index: number, updates: Partial<Scene['dialogue'][0]>, historyMode?: 'push' | 'replace') => void;
    selectedFrameIds?: string[];
    onSelectFrame?: (id: string, isMulti: boolean) => void;
    onDeselectAll?: () => void;
    onResizeSplit?: (id: string, newSizes: number[]) => void;
    onUpdateGap?: (id: string, gap: number) => void;
    onUpdateFrame?: (id: string, updates: Partial<any>) => void;
    isReader?: boolean;
    revealedFrameIds?: Set<string>;
    onRevealFrame?: (id: string) => void;
    selectedDialogueIndex?: number | null;
    onSelectDialogue?: (index: number) => void;
    // Text Support
    onUpdateText?: (index: number, updates: Partial<any>, historyMode?: 'push' | 'replace') => void;
    selectedTextIndex?: number | null;
    onSelectText?: (index: number) => void;
}

export default function ComicSceneRenderer({
    scene,
    isActive = true,
    onUpdateDialogue,
    selectedFrameIds = [],
    onSelectFrame = () => { },
    onDeselectAll = () => { },
    onResizeSplit = () => { },
    onUpdateGap = () => { },
    onUpdateFrame = () => { },
    isReader = false,
    revealedFrameIds = new Set<string>(), // Default to empty set to prevent crash
    onRevealFrame,
    selectedDialogueIndex = null,
    onSelectDialogue,
    onUpdateText,
    selectedTextIndex = null,
    onSelectText
}: ComicSceneRendererProps) {
    // Helper to bridge the optional prop
    const handleRevealFrame = (id: string) => {
        if (onRevealFrame) onRevealFrame(id);
    };

    // Safety check if root is missing (migration issue)
    if (!scene.root) {
        return <div className="text-red-500">Error: Invalid Scene Structure</div>;
    }

    return (
        <div className="relative w-full h-full bg-black text-white">

            {/* 1. Dynamic Layout Rendering */}
            <div
                className="absolute inset-0 z-0"
                onClick={(e) => {
                    // If bubbling reached here, it's a background click (Frames stop propagation)
                    onDeselectAll();
                }}
            >
                <DynamicRenderer
                    node={scene.root}
                    selectedFrameIds={selectedFrameIds}
                    onSelect={onSelectFrame}
                    onResizeSplit={onResizeSplit}
                    onUpdateGap={onUpdateGap}
                    onUpdateFrame={onUpdateFrame}
                    isReader={isReader}
                    revealedFrameIds={revealedFrameIds}
                    onRevealFrame={handleRevealFrame}
                />
            </div>

            {/* 2. Dialogue Layer (Always on top) */}
            <div className="absolute inset-0 z-50 pointer-events-none">
                {/* Bubbles need pointer-events-auto to be clickable */}
                {scene.dialogue.map((d, i) => {
                    // Check visibility logic:
                    // 1. Find which frame is under this dialogue
                    const targetFrame = findFrameAt(scene.root, d.x, d.y);

                    // 2. Check if that frame is effectively spoiled
                    // (Note: frame.spoiler is explicit, isReader forces spoiler behavior)
                    const isSpoiled = (targetFrame?.spoiler || isReader);

                    // 3. Check if it has been revealed by the user
                    const isRevealed = targetFrame ? revealedFrameIds.has(targetFrame.id) : false;

                    // 4. Hide if spoiled AND NOT revealed
                    // (Only applies if we found a valid target frame. If floating in void, show it?)
                    // Let's assume floating in void is safe to show.
                    const shouldHide = targetFrame && isSpoiled && !isRevealed;

                    return (
                        <div
                            key={i}
                            className={`pointer-events-auto transition-opacity duration-300 ${shouldHide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectDialogue) onSelectDialogue(i);
                            }}
                        >
                            <DraggableBubble
                                dialogue={d}
                                index={i}
                                onUpdate={onUpdateDialogue}
                                isEditable={!!onUpdateDialogue}
                                isSelected={selectedDialogueIndex === i}
                            />
                        </div>
                    );
                })}
            </div>

            {/* 3. Text Layer (Above Dialogue? Or same level? Usually below dialogue bubbles) */}
            {/* Let's put it BELOW dialogue but ABOVE frames. So z-index 40. */}
            <div className="absolute inset-0 z-40 pointer-events-none">
                {scene.texts && scene.texts.map((t, i) => {
                    // Visibility logic similar to bubbles if needed, but for now just show
                    // Check if frame under is revealed?
                    const targetFrame = findFrameAt(scene.root, t.x, t.y);
                    const isSpoiled = (targetFrame?.spoiler || isReader);
                    const isRevealed = targetFrame ? revealedFrameIds.has(targetFrame.id) : false;
                    const shouldHide = targetFrame && isSpoiled && !isRevealed;

                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto transition-opacity duration-300 ${shouldHide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            <DraggableText
                                textLayer={t}
                                index={i}
                                onUpdate={onUpdateText}
                                isEditable={!!onUpdateText}
                                isSelected={selectedTextIndex === i}
                                onSelect={onSelectText}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
