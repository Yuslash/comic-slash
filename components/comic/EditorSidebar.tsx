import React, { useState } from 'react';
import { Scene, ComicData, FrameNode, LayoutNode } from '@/types/comic';
import ExportModal from './ExportModal';
import ImportModal from './ImportModal';
import styles from './EditorSidebar.module.css';
import Link from 'next/link';
import {
    Trash2, Plus, Download, Upload,
    Layers, MessageSquare, Type,
    Columns, Rows, MousePointer2, RotateCcw, ArrowLeft
} from 'lucide-react';
import DialoguePanel from './editor/DialoguePanel';
import TextPanel from './editor/TextPanel';
import ImagePanel from './editor/ImagePanel';
import CollapsiblePanel from '../ui/CollapsiblePanel';


interface EditorSidebarProps {
    scene: Scene;
    sceneIndex: number;
    totalScenes: number;
    onUpdateScene: (index: number, updates: Partial<Scene>, historyMode?: 'push' | 'replace') => void;
    onDeleteScene: (index: number) => void;
    onAddScene: () => void;
    onExport: () => void;
    onImport: (data: ComicData) => void;
    comicData: any;
    selectedFrameIds: string[];
    onUpdateFrame?: (frameId: string, updates: Partial<FrameNode>) => void;
    onSplitFrame?: (frameId: string, direction: 'horizontal' | 'vertical') => void;
    onUpdateGap?: (frameId: string, gap: number) => void;
    onResetFrame?: (frameId: string) => void;
    onEqualizeSizes?: () => void;
    onRemoveFrames?: () => void;
    // New
    backLink?: string;
    seriesTitle?: string;
    chapterTitle?: string;
    // Dialogue Selection
    selectedDialogueIndex?: number | null;
    onSelectDialogue?: (index: number) => void;
    // Text Selection
    selectedTextIndex?: number | null;
    onSelectText?: (index: number) => void;
}

// Helper to find a node by ID (BFS)
const findNode = (root: LayoutNode, id: string): LayoutNode | null => {
    if (root.id === id) return root;
    if (root.type === 'split' && 'children' in root) {
        for (const child of (root as any).children) {
            const found = findNode(child, id);
            if (found) return found;
        }
    }
    return null;
};

export default function EditorSidebar({
    scene,
    sceneIndex,
    totalScenes,
    onUpdateScene,
    onDeleteScene,
    onAddScene,
    onImport,
    comicData,
    selectedFrameIds,
    onUpdateFrame,
    onSplitFrame,
    onUpdateGap,
    onResetFrame,
    onEqualizeSizes,
    onRemoveFrames,
    backLink,
    seriesTitle,
    chapterTitle,
    selectedDialogueIndex = null,
    onSelectDialogue,
    selectedTextIndex = null,
    onSelectText
}: EditorSidebarProps) {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Find the currently selected frame node (if single)
    const singleSelectedId = selectedFrameIds.length === 1 ? selectedFrameIds[0] : null;
    const activeNode = singleSelectedId && scene.root ? findNode(scene.root, singleSelectedId) : null;
    const isFrameSelected = activeNode?.type === 'frame';
    const selectedFrame = isFrameSelected ? (activeNode as FrameNode) : null;

    // Multi-selection state
    const isMultiSelect = selectedFrameIds.length > 1;

    return (
        <div className={styles.sidebarContainer}>
            {/* 1. TOP HEADER */}
            <div id="studio-header" className={styles.header}>
                <div className="flex flex-col overflow-hidden max-w-[70%]">
                    {seriesTitle ? (
                        <>
                            {/* Back Button Row */}
                            {backLink && (
                                <Link
                                    href={backLink}
                                    className="flex items-center gap-1 text-gray-500 hover:text-[#ccff00] transition-colors font-rajdhani text-xs uppercase tracking-widest mb-2"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Back to Studio</span>
                                </Link>
                            )}

                            {/* Title Block */}
                            <div className="text-white text-sm font-bold font-teko uppercase truncate leading-none mb-1">
                                {seriesTitle}
                            </div>
                            <div className="text-[#ccff00] text-xs font-rajdhani uppercase tracking-wide truncate">
                                {chapterTitle || 'Untitled Chapter'}
                            </div>
                        </>
                    ) : (
                        <div className={styles.title}>
                            <span className={styles.accent}>//</span> STUDIO
                        </div>
                    )}
                </div>

                <div className="flex gap-1 ml-auto">
                    <button onClick={() => setIsImportOpen(true)} className={styles.iconBtn} title="Import">
                        <Upload size={18} />
                    </button>
                    <button onClick={() => setIsExportOpen(true)} className={styles.iconBtn} title="Export">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* 2. MAIN SCROLLABLE AREA */}
            <div className={styles.scrollArea}>

                {/* PANEL: LAYERS / SCENE */}
                <CollapsiblePanel
                    id="panel-scene"
                    title={`Scene ${sceneIndex + 1}`}
                    icon={Layers}
                    headerRight={
                        <button onClick={() => onDeleteScene(sceneIndex)} className="text-red-500 hover:text-white transition-colors p-1" title="Delete Scene">
                            <Trash2 size={12} />
                        </button>
                    }
                >
                    <div className="pt-2">
                        {isMultiSelect ? (
                            <div className="flex flex-col gap-3">
                                <div className="text-sm font-bold text-neon-green flex items-center gap-2">
                                    <Layers size={14} /> MULTI-SELECT ({selectedFrameIds.length})
                                    <button
                                        id="btn-remove-multi"
                                        onClick={onRemoveFrames}
                                        title="Remove Selected"
                                        className="ml-auto text-red-500 hover:text-red-400 p-1 rounded hover:bg-white/10"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Multiple items selected.
                                </div>
                                <button id="btn-equalize" onClick={onEqualizeSizes} className={styles.layoutBtn}>
                                    <Columns size={16} /> <span>Equalize Sizes</span>
                                </button>
                                {/* Multi-gap control can go into Layout Panel if desired, keeping simple for now */}
                                <div className="mt-2">
                                    <label className={styles.label}>Gap</label>
                                    <input
                                        id="gap-slider"
                                        type="range" min="0" max="50" defaultValue={0}
                                        onChange={(e) => onUpdateGap && selectedFrameIds.length && onUpdateGap(selectedFrameIds[0], parseInt(e.target.value))}
                                        className="w-full accent-neon-green"
                                    />
                                </div>
                            </div>
                        ) : activeNode ? (
                            <div className="flex flex-col gap-3">
                                <div className="text-xs text-gray-400 font-mono mb-2">
                                    ID: {activeNode.id.slice(0, 8)}...
                                    <span className="bg-gray-800 text-white px-1 ml-2 rounded">{activeNode.type}</span>
                                </div>

                                {activeNode.type === 'frame' && (
                                    <>
                                        <label className={styles.label}>Split</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className={styles.layoutBtn} onClick={() => onSplitFrame && onSplitFrame(activeNode.id, 'vertical')}>
                                                <Columns size={16} /> Vertical
                                            </button>
                                            <button className={styles.layoutBtn} onClick={() => onSplitFrame && onSplitFrame(activeNode.id, 'horizontal')}>
                                                <Rows size={16} /> Horizontal
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm italic text-center py-4 border border-dashed border-[#333] rounded">
                                Select a frame...
                            </div>
                        )}
                    </div>
                </CollapsiblePanel>

                {/* PANEL: LAYOUT REMOVED AS REQUESTED */}

                {/* PANEL: FILL (Image) */}
                {selectedFrame && (
                    <CollapsiblePanel
                        title="Fill"
                        icon={Layers}
                        defaultOpen={true}
                    >
                        <ImagePanel
                            frame={selectedFrame}
                            onUpdate={(updates) => onUpdateFrame && onUpdateFrame(selectedFrame.id, updates)}
                            className={styles.inputGroup}
                            seriesTitle={seriesTitle}
                            chapterTitle={chapterTitle}
                        />
                        <div className="flex gap-2 mt-4 pt-4 border-t border-[#333]">
                            <button onClick={() => onResetFrame && onResetFrame(selectedFrame.id)} className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded">Reset</button>
                            <button onClick={onRemoveFrames} className="flex-1 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs rounded">Remove</button>
                        </div>
                    </CollapsiblePanel>
                )}

                {/* PANEL: DIALOGUE */}
                <CollapsiblePanel
                    title="Dialogue"
                    icon={MessageSquare}
                    defaultOpen={false}
                >
                    <DialoguePanel
                        scene={scene}
                        sceneIndex={sceneIndex}
                        onUpdateScene={onUpdateScene}
                        selectedDialogueIndex={selectedDialogueIndex}
                        onSelectDialogue={onSelectDialogue}
                    />
                </CollapsiblePanel>

                {/* PANEL: TEXT */}
                <CollapsiblePanel
                    title="Text"
                    icon={Type}
                    defaultOpen={false}
                >
                    <TextPanel
                        scene={scene}
                        sceneIndex={sceneIndex}
                        onUpdateScene={onUpdateScene}
                        selectedTextIndex={selectedTextIndex}
                        onSelectText={onSelectText}
                    />
                </CollapsiblePanel>

            </div>

            {/* 3. STICKY FOOTER */}
            <div className={styles.footer}>
                <button id="btn-add-scene" onClick={onAddScene} className={styles.primaryBtn}>
                    <Plus size={20} className="inline mr-2" /> Insert New Scene
                </button>
            </div>

            {/* MODALS */}
            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                data={comicData}
            />

            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={onImport}
            />
        </div>
    );
}
