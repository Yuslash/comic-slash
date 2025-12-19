"use client";

import React, { useState, useEffect } from 'react';
import { ComicData, Scene, LayoutNode, FrameNode, SplitNode } from '@/types/comic';
import EditorSidebar from './EditorSidebar';
import ComicSceneRenderer from './ComicSceneRenderer';
import TutorialManager from './editor/TutorialManager';
import LayerSidebar from './LayerSidebar';
import { useHistory } from '@/hooks/useHistory';


const INITIAL_DATA: ComicData = [
    {
        id: Date.now(),
        root: {
            id: 'root-1',
            type: 'split',
            direction: 'vertical', // Side by side
            children: [
                {
                    id: 'frame-1',
                    type: 'frame',

                } as any, // Cast to avoid strict check during dev
                {
                    id: 'frame-2',
                    type: 'frame',
                    image: '',
                    imageConfig: { scale: 100, x: 50, y: 50, mirror: false }
                } as any
            ],
            childrenSizes: [50, 50]
        } as any,
        dialogue: [
            { text: "Welcome to the Creator!", x: 50, y: 50, style: "normal" }
        ]
    }
];

interface ComicEditorProps {
    initialData?: ComicData;
    onSave?: (data: ComicData, isUnmount?: boolean) => void;
    backLink?: string;
    seriesTitle?: string;
    chapterTitle?: string;
}

export default function ComicEditor({ initialData, onSave, backLink, seriesTitle, chapterTitle }: ComicEditorProps) {
    // 1. History State
    const {
        state: comicData,
        set: setComicData,
        undo,
        redo,
        canUndo,
        canRedo
    } = useHistory<ComicData>(initialData || INITIAL_DATA);

    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [selectedFrameIds, setSelectedFrameIds] = useState<string[]>([]);

    // New: Selected Dialogue & Text Index
    const [selectedDialogueIndex, setSelectedDialogueIndex] = useState<number | null>(null);
    const [selectedTextIndex, setSelectedTextIndex] = useState<number | null>(null);

    // Auto-Save & Unmount Handling
    const latestDataRef = React.useRef(comicData);
    const isDirtyRef = React.useRef(false);
    const onSaveRef = React.useRef(onSave);
    const initializedRef = React.useRef(false);

    // Keep refs synced
    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    // Debounced Auto-Save
    useEffect(() => {
        latestDataRef.current = comicData;

        // Skip the first run (mount) so we don't save just because we loaded
        if (!initializedRef.current) {
            initializedRef.current = true;
            return;
        }

        isDirtyRef.current = true; // Mark dirty on change

        const timer = setTimeout(() => {
            if (onSaveRef.current) {
                onSaveRef.current(comicData);
                isDirtyRef.current = false;
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [comicData]); // DEPENDENCY on onSave removed to prevent loops

    // Save on Unmount (Refresh/Navigate away)
    useEffect(() => {
        return () => {
            // Only save if dirty
            if (isDirtyRef.current && onSaveRef.current) {
                console.log("Saving on unmount...");
                onSaveRef.current(latestDataRef.current, true);
            }
        };
    }, []);

    // 2. Keyboard Shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for CTRL or CMD
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                } else if (e.key === 'y') {
                    // Ctrl+Y is standard Redo on Windows sometimes
                    e.preventDefault();
                    redo();
                } else if (e.key.toLowerCase() === 's') {
                    e.preventDefault();
                    if (onSave) onSave(comicData);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, comicData, onSave]);

    // Ensure client-side rendering consistency for Date.now() if needed, 
    // though here we just use it for initial state which is fine.

    // 3. Derived State for Safety
    // Immediately clamp index for rendering. Don't wait for useEffect.
    const safeIndex = Math.min(currentSceneIndex, Math.max(0, comicData.length - 1));
    const activeScene = comicData[safeIndex];

    // Sync state if mismatched (side effect)
    useEffect(() => {
        if (currentSceneIndex !== safeIndex) {
            setCurrentSceneIndex(safeIndex);
        }
    }, [currentSceneIndex, safeIndex]);

    // Safety: If no active scene (e.g. empty data), show loader
    if (!activeScene) {
        return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Scene...</div>;
    }

    useEffect(() => {
        const handleCornerUpdate = (e: any) => {
            const { frameId, cornerIndex, x, y } = e.detail;
            const root = activeScene.root;

            // Update the specific node
            const newRoot = updateNodeInTree(root, frameId, (node) => {
                const frame = node as FrameNode;
                const defaultCorners = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
                const currentCorners = [...(frame.corners || defaultCorners)];
                currentCorners[cornerIndex] = { x, y };
                return { ...frame, corners: currentCorners };
            });

            handleUpdateScene(safeIndex, { root: newRoot });
        };

        window.addEventListener('update-corner', handleCornerUpdate);
        return () => window.removeEventListener('update-corner', handleCornerUpdate);
    }, [activeScene, safeIndex, comicData]);
    // Optimization: define update logic outside or use functional state update if possible, 
    // but handleUpdateScene uses state directly. Let's keep it simple.


    // Selection Handler
    const handleSelectFrame = (id: string, isMulti: boolean) => {
        if (isMulti) {
            setSelectedFrameIds(prev => {
                if (prev.includes(id)) {
                    return prev.filter(f => f !== id);
                }
                return [...prev, id];
            });
        } else {
            setSelectedFrameIds([id]);
        }
        // Deselect dialogue when selecting frame
        setSelectedDialogueIndex(null);
    };

    // Deselect if clicking background (optional, handled by renderer usually)
    const handleDeselectAll = () => {
        setSelectedFrameIds([]);
        setSelectedDialogueIndex(null);
    };

    const handleSelectDialogue = (index: number) => {
        setSelectedDialogueIndex(index);
        // Optional: Deselect frames when selecting dialogue?
        setSelectedFrameIds([]);
        setSelectedTextIndex(null);
    };

    const handleSelectText = (index: number) => {
        setSelectedTextIndex(index);
        setSelectedDialogueIndex(null);
        setSelectedFrameIds([]);
    };

    const handleUpdateScene = (index: number, updates: Partial<Scene>, historyMode: 'push' | 'replace' = 'push') => {
        const newData = [...comicData];
        newData[index] = { ...newData[index], ...updates };
        setComicData(newData, historyMode === 'replace');
    };

    const handleAddScene = () => {
        const newScene: Scene = {
            id: Date.now(),
            root: {
                id: `root-${Date.now()}`,
                type: 'frame',
                image: '',
                imageConfig: { scale: 100, x: 50, y: 50, mirror: false }
            } as any,
            dialogue: []
        };
        setComicData([...comicData, newScene]);
        setCurrentSceneIndex(comicData.length);
        setSelectedFrameIds([]);
        setSelectedDialogueIndex(null);
    };

    const handleDeleteScene = (index: number) => {
        if (comicData.length <= 1) {
            alert("You need at least one scene!");
            return;
        }
        const newData = comicData.filter((_, i) => i !== index);
        setComicData(newData);
        if (currentSceneIndex >= newData.length) {
            setCurrentSceneIndex(newData.length - 1);
        }
        setSelectedFrameIds([]);
        setSelectedDialogueIndex(null);
    };

    const handleExport = () => {
        const jsonStr = JSON.stringify(comicData, null, 2);
        console.log(jsonStr);
        alert("Check console for copy-paste data! (Also copied to clipboard)");
        navigator.clipboard.writeText(jsonStr);
    };

    const nextSlide = () => {
        if (currentSceneIndex < comicData.length - 1) {
            setCurrentSceneIndex(prev => prev + 1);
            setSelectedFrameIds([]);
            setSelectedDialogueIndex(null);
        }
    };

    const prevSlide = () => {
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex(prev => prev - 1);
            setSelectedFrameIds([]);
            setSelectedDialogueIndex(null);
        }
    };


    const handleImport = (data: ComicData) => {
        setComicData(data);
        setCurrentSceneIndex(0);
        setSelectedFrameIds([]);
        setSelectedDialogueIndex(null);
    };

    // Helper to update node in tree
    const updateNodeInTree = (root: LayoutNode, id: string, transform: (node: LayoutNode) => LayoutNode): LayoutNode => {
        if (root.id === id) {
            return transform(root);
        }
        if (root.type === 'split' && 'children' in root) {
            const split = root as SplitNode;
            return {
                ...split,
                children: split.children.map(child => updateNodeInTree(child, id, transform))
            } as LayoutNode;
        }
        return root;
    };

    const handleUpdateFrame = (frameId: string, updates: Partial<FrameNode>) => {
        const newRoot = updateNodeInTree(activeScene.root, frameId, (node) => ({
            ...node,
            ...updates
        }));
        handleUpdateScene(safeIndex, { root: newRoot });
    };

    const handleSplitFrame = (frameId: string, direction: 'horizontal' | 'vertical') => {
        const newRoot = updateNodeInTree(activeScene.root, frameId, (node) => {
            // Transform current frame into a SplitNode containing [OldFrame, NewFrame]
            return {
                id: `split-${Date.now()}`,
                type: 'split',
                direction,
                childrenSizes: [50, 50],
                children: [
                    { ...node, id: node.id }, // Keep old frame as first child (preserving content)
                    {
                        id: `frame-${Date.now()}`,
                        type: 'frame',
                        image: '',
                        imageConfig: { scale: 100, x: 50, y: 50, mirror: false }
                    } as FrameNode
                ]
            } as SplitNode;
        });
        handleUpdateScene(safeIndex, { root: newRoot });
    };

    const handleResizeSplit = (splitId: string, newSizes: number[]) => {
        const newRoot = updateNodeInTree(activeScene.root, splitId, (node) => ({
            ...node,
            childrenSizes: newSizes
        } as SplitNode));
        handleUpdateScene(safeIndex, { root: newRoot });
    };

    // Helper to find parent split of a frame
    const updateParentSplit = (root: LayoutNode, childId: string, updates: Partial<SplitNode>): LayoutNode => {
        if (root.type === 'split' && 'children' in root) {
            const split = root as SplitNode;
            // Check if direct child
            if (split.children.some(c => c.id === childId)) {
                return { ...split, ...updates };
            }
            // Recurse
            return {
                ...split,
                children: split.children.map(c => updateParentSplit(c, childId, updates))
            } as LayoutNode;
        }
        return root;
    };

    const handleUpdateGap = (frameId: string, gap: number) => {
        // If we are in multi-select mode and the target frame is one of them, update ALL selected frames
        if (selectedFrameIds.length > 1 && selectedFrameIds.includes(frameId)) {
            let newRoot = activeScene.root;
            // We need to update parent split for EACH selected frame
            // Ideally we find all unique parents and update them
            selectedFrameIds.forEach(id => {
                newRoot = updateParentSplit(newRoot, id, { gap });
            });
            handleUpdateScene(safeIndex, { root: newRoot });
        } else {
            // Single update
            const newRoot = updateParentSplit(activeScene.root, frameId, { gap });
            handleUpdateScene(safeIndex, { root: newRoot });
        }
    };

    const handleResetFrame = (frameId: string) => {
        handleUpdateFrame(frameId, {
            corners: undefined, // Reset polygon
            imageConfig: { scale: 100, x: 50, y: 50, mirror: false } // Reset image
        });
    };

    const handleRemoveFrames = () => {
        if (!selectedFrameIds.length) return;

        // Recursive removal
        const removeRec = (node: LayoutNode, idsToRemove: string[]): LayoutNode | null => {
            // If this node is one of the ones to remove, return null
            if (idsToRemove.includes(node.id)) return null;

            if (node.type === 'split' && 'children' in node) {
                const split = node as SplitNode;

                // Process children
                // We need to keep indices in sync for sizes, so we map first then filter
                const processedChildren = split.children.map((child, index) => ({
                    node: removeRec(child, idsToRemove),
                    size: split.childrenSizes[index]
                })).filter(item => item.node !== null); // Remove nulls

                // If no children left, this split is dead
                if (processedChildren.length === 0) return null;

                // If 1 child left, collapse this split (return the child directly)
                // This brings the child up a level, taking the split's place
                if (processedChildren.length === 1) {
                    return processedChildren[0].node;
                }

                // If multiple children left, normalize sizes
                const currentTotal = processedChildren.reduce((sum, item) => sum + item.size, 0);
                const normalizedSizes = processedChildren.map(item => (item.size / currentTotal) * 100);

                return {
                    ...split,
                    children: processedChildren.map(item => item.node!),
                    childrenSizes: normalizedSizes
                } as SplitNode;
            }

            return node;
        };

        const currentRoot = activeScene.root;
        const newRoot = removeRec(currentRoot, selectedFrameIds);

        // Safety: If root became null (removed everything), recreate a default frame
        if (!newRoot) {
            const defaultRoot: FrameNode = {
                id: `frame-${Date.now()}`,
                type: 'frame',
                image: '',
                imageConfig: { scale: 100, x: 50, y: 50, mirror: false }
            };
            handleUpdateScene(safeIndex, { root: defaultRoot });
            setSelectedFrameIds([defaultRoot.id]); // Select the new frame
        } else {
            handleUpdateScene(safeIndex, { root: newRoot });
            setSelectedFrameIds([]); // Clear selection
        }
        setSelectedDialogueIndex(null);
    };

    const handleEqualizeSizes = () => {
        if (selectedFrameIds.length < 2) return;

        const countSelectedDescendants = (node: LayoutNode): number => {
            if (node.type === 'frame') {
                return selectedFrameIds.includes(node.id) ? 1 : 0;
            }
            if (node.type === 'split' && 'children' in node) {
                const split = node as SplitNode;
                return split.children.reduce((sum, child) => sum + countSelectedDescendants(child), 0);
            }
            return 0;
        };

        // Recursive function to update weights
        const updateWeightsRec = (node: LayoutNode): LayoutNode => {
            if (node.type === 'split') {
                const split = node as SplitNode;
                // Calculate selected counts for each child
                const childCounts = split.children.map(c => countSelectedDescendants(c));
                const totalSelectedInSplit = childCounts.reduce((a, b) => a + b, 0);

                // If this split contains relevant frames, redistribute sizes
                // BUT: We need to handle non-selected children carefully.
                // Simplified Logic: If user is trying to "Equalize" the whole scene/branch, 
                // we assume they selected everything relevant.
                // We distribute 100% space based on the ratio of selected descendants.
                // If a child has 0 selected descendants, it effectively gets 0 size?
                // That's dangerous.

                // Refinements:
                // If totalSelectedInSplit > 0, we redistribute.
                // If a child has 0 selected, we imply it shouldn't shrink to 0.
                // But for the user's "3 frames" case, all have count=1.

                let newSizes = [...split.childrenSizes];

                if (totalSelectedInSplit > 0) {
                    // Weight children by their selected count
                    // If Child A has 1 selected desc, Child B has 2 selected desc.
                    // A gets 33%, B gets 66%.
                    // This ensures A (1 frame) is visually same size as B's children (2 frames / 2 = 1 frame size).
                    newSizes = childCounts.map(c => (c / totalSelectedInSplit) * 100);

                    // Edge case: If some children have 0 selected, they get 0%?
                    // If the user didn't select them, maybe they want to hide them? Unlikely.
                    // But strictly following "Equalize Selected":
                    // If I select A and B, but C is unselected.
                    // I want A and B to be equal.
                    // My logic makes A and B equal only if they are in the same split.
                    // This Weighted logic is specifically for "Equalize ALL nested".
                }

                // Recurse down
                const newChildren = split.children.map(c => updateWeightsRec(c));

                return {
                    ...split,
                    childrenSizes: newSizes,
                    children: newChildren
                } as SplitNode;
            }
            return node;
        };

        const newRoot = updateWeightsRec(activeScene.root);
        handleUpdateScene(safeIndex, { root: newRoot });
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-bg-dark text-white overflow-hidden font-sans">
            <TutorialManager
                selectedFrameIds={selectedFrameIds}
                scene={activeScene}
            />
            <EditorSidebar
                scene={activeScene}
                sceneIndex={safeIndex}
                totalScenes={comicData.length}
                onUpdateScene={handleUpdateScene}
                onDeleteScene={handleDeleteScene}
                onAddScene={handleAddScene}
                onExport={handleExport}
                onImport={handleImport}
                comicData={comicData}
                selectedFrameIds={selectedFrameIds}
                // @ts-ignore
                selectedDialogueIndex={selectedDialogueIndex}
                // @ts-ignore
                onSelectDialogue={handleSelectDialogue}
                // @ts-ignore
                selectedTextIndex={selectedTextIndex}
                // @ts-ignore
                onSelectText={handleSelectText}
                // @ts-ignore
                onUpdateFrame={handleUpdateFrame}
                onSplitFrame={handleSplitFrame}
                // @ts-ignore
                onUpdateGap={handleUpdateGap}
                // @ts-ignore
                onResetFrame={handleResetFrame}
                // @ts-ignore
                onEqualizeSizes={handleEqualizeSizes}
                // @ts-ignore
                onRemoveFrames={handleRemoveFrames}
                // New Props for Header
                backLink={backLink}
                seriesTitle={seriesTitle}
                chapterTitle={chapterTitle}
            />

            <div
                id="main-viewport"
                className="flex-1 relative bg-black flex items-center justify-center h-full"
                onClick={handleDeselectAll}
            >


                <div
                    className="comic-viewport overflow-visible"
                // Removed stopPropagation to allow clicks on 'dead zones' (margins) to bubble up to main-viewport and deselect.
                >
                    <div className="scene overflow-visible">
                        <ComicSceneRenderer
                            scene={activeScene}
                            onUpdateDialogue={(dIndex, updates, historyMode = 'push') => {
                                const newDialogue = [...activeScene.dialogue];
                                newDialogue[dIndex] = { ...newDialogue[dIndex], ...updates };
                                handleUpdateScene(safeIndex, { dialogue: newDialogue }, historyMode);
                            }}
                            selectedFrameIds={selectedFrameIds}
                            onSelectFrame={handleSelectFrame}
                            onDeselectAll={handleDeselectAll}
                            onResizeSplit={handleResizeSplit}
                            onUpdateGap={handleUpdateGap}
                            onUpdateFrame={handleUpdateFrame}
                            // @ts-ignore
                            selectedDialogueIndex={selectedDialogueIndex}
                            // @ts-ignore
                            onSelectDialogue={handleSelectDialogue}
                            // @ts-ignore
                            selectedTextIndex={selectedTextIndex}
                            // @ts-ignore
                            onSelectText={handleSelectText}
                            onUpdateText={(tIndex: number, updates: Partial<any>, historyMode: 'push' | 'replace' = 'push') => {
                                const newTexts = [...(activeScene.texts || [])];
                                newTexts[tIndex] = { ...newTexts[tIndex], ...updates };
                                handleUpdateScene(safeIndex, { texts: newTexts }, historyMode);
                            }}
                        />
                    </div>
                </div>

                <div id="scene-nav" className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black/70 px-5 py-2 rounded-full flex gap-5 z-[999] border border-white/10 backdrop-blur-md">
                    <button onClick={prevSlide} className="bg-transparent border-none text-white text-xl cursor-pointer hover:text-neon-green transition-colors">◀</button>
                    <span className="font-bold font-rajdhani">{safeIndex + 1} / {comicData.length}</span>
                    <button onClick={nextSlide} className="bg-transparent border-none text-white text-xl cursor-pointer hover:text-neon-green transition-colors">▶</button>
                </div>
            </div>
            {/* Right Sidebar: Layer Order */}
            <LayerSidebar
                scene={activeScene}
                selectedFrameIds={selectedFrameIds}
                onSelectFrame={handleSelectFrame}
            />
        </div>
    );
}
