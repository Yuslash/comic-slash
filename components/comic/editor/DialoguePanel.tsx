import React from 'react';
import { Scene } from '@/types/comic';
import styles from '../EditorSidebar.module.css';
import { Trash2, Move, Type, Plus, ChevronLeft, Bold, Italic } from 'lucide-react';

interface DialoguePanelProps {
    scene: Scene;
    sceneIndex: number;
    onUpdateScene: (index: number, updates: Partial<Scene>, historyMode?: 'push' | 'replace') => void;
    className?: string;
    selectedDialogueIndex?: number | null;
    onSelectDialogue?: (index: number) => void;
}

export default function DialoguePanel({
    scene,
    sceneIndex,
    onUpdateScene,
    className,
    selectedDialogueIndex = null,
    onSelectDialogue
}: DialoguePanelProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDialogueChange = (dIndex: number, field: string, val: any, historyMode: 'push' | 'replace' = 'push') => {
        const newDialogue = [...scene.dialogue];
        newDialogue[dIndex] = { ...newDialogue[dIndex], [field]: val };
        onUpdateScene(sceneIndex, { dialogue: newDialogue }, historyMode);
    };

    // Helper to commit the final value to history (for sliders/color pickers)
    const handleCommitChange = (dIndex: number, field: string, val: any) => {
        handleDialogueChange(dIndex, field, val, 'push');
    };

    const addDialogue = () => {
        const newDialogue = [...scene.dialogue, { text: "New Text", x: 50, y: 50, style: "normal" as const, fontWeight: 'bold' }];
        onUpdateScene(sceneIndex, { dialogue: newDialogue });
        if (onSelectDialogue) {
            onSelectDialogue(newDialogue.length - 1);
        }
    };

    const removeDialogue = (dIndex: number) => {
        const newDialogue = scene.dialogue.filter((_, i) => i !== dIndex);
        onUpdateScene(sceneIndex, { dialogue: newDialogue });
        if (onSelectDialogue) onSelectDialogue(-1);
    };

    const selectedDialogue = selectedDialogueIndex !== null && selectedDialogueIndex >= 0
        ? scene.dialogue[selectedDialogueIndex]
        : null;

    return (
        <div className={className}>
            {selectedDialogue ? (
                <>
                    <div className="mb-4 pb-4 border-b border-[#222]">
                        <div className="flex justify-between mb-2">
                            <label className={styles.label}>Bubble {selectedDialogueIndex! + 1}</label>
                            <button
                                onClick={() => removeDialogue(selectedDialogueIndex!)}
                                className="text-red-500 hover:text-red-400 text-[10px] uppercase"
                            >
                                <Trash2 size={10} className="inline mr-1" /> Remove
                            </button>
                        </div>

                        <div className="mb-3">
                            <label className={styles.label}>Speaker Name</label>
                            <input
                                type="text"
                                value={selectedDialogue.speaker || ''}
                                onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'speaker', e.target.value)}
                                placeholder="Who is talking?"
                                className={styles.input}
                            />
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            value={selectedDialogue.text}
                            onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'text', e.target.value)}
                            placeholder="Dialogue text..."
                            className={`${styles.input} mb-3`}
                        />

                        <div className={styles.grid2}>
                            <div>
                                <label className={styles.label}><Move size={10} className="inline mr-1" /> X: {selectedDialogue.x}%</label>
                                <input
                                    type="range" min="0" max="100" value={selectedDialogue.x}
                                    onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'x', parseInt(e.target.value), 'replace')}
                                    onMouseUp={(e) => handleCommitChange(selectedDialogueIndex!, 'x', parseInt((e.target as HTMLInputElement).value))}
                                    className={styles.rangeInput}
                                />
                            </div>

                            <div>
                                <label className={styles.label}><Move size={10} className="inline mr-1" /> Y: {selectedDialogue.y}%</label>
                                <input
                                    type="range" min="0" max="100" value={selectedDialogue.y}
                                    onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'y', parseInt(e.target.value), 'replace')}
                                    onMouseUp={(e) => handleCommitChange(selectedDialogueIndex!, 'y', parseInt((e.target as HTMLInputElement).value))}
                                    className={styles.rangeInput}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className={styles.label}><Move size={10} className="inline mr-1" /> Width: {selectedDialogue.width || 'Auto'}</label>
                                <input
                                    type="range" min="0" max="100" value={selectedDialogue.width || 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        handleDialogueChange(selectedDialogueIndex!, 'width', val === 0 ? undefined : val);
                                    }}
                                    className={styles.rangeInput}
                                />
                                <div className="text-[10px] text-gray-500 text-right">0 = Auto</div>
                            </div>

                            <div className="col-span-2 mt-2">
                                <label className={styles.label}><Type size={10} className="inline mr-1" /> Font Size: {selectedDialogue.fontSize || 'Default'}px</label>
                                <input
                                    type="range" min="4" max="64" value={selectedDialogue.fontSize || 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        handleDialogueChange(selectedDialogueIndex!, 'fontSize', val === 0 ? undefined : val);
                                    }}
                                    className={styles.rangeInput}
                                />
                                <div className="text-[10px] text-gray-500 text-right">0 = Default</div>
                            </div>
                        </div>

                        <div className={`${styles.grid2} mt-3`}>
                            <button
                                className={`p-1.5 rounded border border-[#333] hover:border-neon-green transition-colors flex-1 flex items-center justify-center gap-1 ${selectedDialogue.fontWeight === 'bold' ? 'bg-white/20 text-neon-green' : 'text-gray-400'}`}
                                onClick={() => {
                                    const targetInput = inputRef.current;

                                    if (targetInput && targetInput.selectionStart !== targetInput.selectionEnd) {
                                        const start = targetInput.selectionStart || 0;
                                        const end = targetInput.selectionEnd || 0;
                                        const text = selectedDialogue.text;
                                        const selected = text.substring(start, end);

                                        const isWrapped = start >= 2 && end <= text.length - 2 &&
                                            text.substring(start - 2, start) === "**" &&
                                            text.substring(end, end + 2) === "**";

                                        let newText = isWrapped
                                            ? text.substring(0, start - 2) + selected + text.substring(end + 2)
                                            : text.substring(0, start) + "**" + selected + "**" + text.substring(end);

                                        handleDialogueChange(selectedDialogueIndex!, 'text', newText);
                                    } else {
                                        handleDialogueChange(selectedDialogueIndex!, 'fontWeight', selectedDialogue.fontWeight === 'bold' ? 'normal' : 'bold');
                                    }
                                }}
                                title="Bold (Select text to apply inline)"
                            >
                                <Bold size={14} /> <span className="text-[10px]">BOLD</span>
                            </button>
                            <button
                                className={`p-1.5 rounded border border-[#333] hover:border-neon-green transition-colors flex-1 flex items-center justify-center gap-1 ${selectedDialogue.fontStyle === 'italic' ? 'bg-white/20 text-neon-green' : 'text-gray-400'}`}
                                onClick={() => {
                                    const targetInput = inputRef.current;

                                    if (targetInput && targetInput.selectionStart !== targetInput.selectionEnd) {
                                        const start = targetInput.selectionStart || 0;
                                        const end = targetInput.selectionEnd || 0;
                                        const text = selectedDialogue.text;
                                        const selected = text.substring(start, end);

                                        const isWrapped = start >= 1 && end <= text.length - 1 &&
                                            text.substring(start - 1, start) === "*" &&
                                            text.substring(end, end + 1) === "*" &&
                                            (text.substring(start - 2, start) !== "**");

                                        let newText = isWrapped
                                            ? text.substring(0, start - 1) + selected + text.substring(end + 1)
                                            : text.substring(0, start) + "*" + selected + "*" + text.substring(end);

                                        handleDialogueChange(selectedDialogueIndex!, 'text', newText);
                                    } else {
                                        handleDialogueChange(selectedDialogueIndex!, 'fontStyle', selectedDialogue.fontStyle === 'italic' ? 'normal' : 'italic');
                                    }
                                }}
                                title="Italic (Select text to apply inline)"
                            >
                                <Italic size={14} /> <span className="text-[10px]">ITALIC</span>
                            </button>
                        </div>

                        <div className="mt-3">
                            <label className={styles.label}><Type size={10} className="inline mr-1" /> Style</label>
                            <select
                                value={selectedDialogue.style}
                                onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'style', e.target.value)}
                                className={styles.select}
                            >
                                <option value="normal">Normal</option>
                                <option value="shout">Shout</option>
                            </select>
                        </div>

                        <div className="mt-3">
                            <label className={styles.label}>Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={selectedDialogue.bgColor || '#ffffff'}
                                    onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'bgColor', e.target.value, 'replace')}
                                    onBlur={(e) => handleCommitChange(selectedDialogueIndex!, 'bgColor', e.target.value)}
                                    className="h-8 w-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedDialogue.bgColor || ''}
                                    onChange={(e) => handleDialogueChange(selectedDialogueIndex!, 'bgColor', e.target.value, 'replace')}
                                    onBlur={(e) => handleCommitChange(selectedDialogueIndex!, 'bgColor', e.target.value)}
                                    placeholder="#"
                                    className={styles.input}
                                    style={{ height: '2rem', padding: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelectDialogue && onSelectDialogue(-1)}
                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mb-2"
                    >
                        <ChevronLeft size={10} /> Back to List
                    </button>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="text-gray-500 text-sm italic text-center py-4 border border-dashed border-[#333] rounded">
                        Select a bubble in the viewport to edit.
                    </div>

                    {scene.dialogue.length > 0 && (
                        <div className="max-h-48 overflow-y-auto pr-1 space-y-2 mb-3 mt-4 custom-scrollbar">
                            {scene.dialogue.map((d, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelectDialogue && onSelectDialogue(idx)}
                                    className="w-full text-left p-3 bg-black border border-[#333] hover:border-neon-green hover:text-neon-green hover:bg-white/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-[2px] h-full bg-[#333] group-hover:bg-neon-green transition-colors"></div>
                                    <div className="flex items-center gap-3 pl-2">
                                        <span className="font-rajdhani font-bold text-[#666] group-hover:text-neon-green text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                                        <span className="font-rajdhani text-sm uppercase truncate text-gray-300 group-hover:text-white flex-1">{d.text || "Empty Dialogue"}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <button onClick={addDialogue} className={`${styles.button} w-full mt-2 border-dashed`}>
                        <Plus size={14} /> ADD BUBBLE
                    </button>
                </div>
            )}
        </div>
    );
}