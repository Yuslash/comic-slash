import React from 'react';
import { Scene, TextLayer } from '@/types/comic';
import styles from '../EditorSidebar.module.css';
import { Trash2, Move, Type, Plus, ChevronLeft, Bold, Italic } from 'lucide-react';

interface TextPanelProps {
    scene: Scene;
    sceneIndex: number;
    onUpdateScene: (index: number, updates: Partial<Scene>, historyMode?: 'push' | 'replace') => void;
    className?: string;
    selectedTextIndex?: number | null;
    onSelectText?: (index: number) => void;
}

export default function TextPanel({
    scene,
    sceneIndex,
    onUpdateScene,
    className,
    selectedTextIndex = null,
    onSelectText
}: TextPanelProps) {

    const handleTextChange = (tIndex: number, field: string, val: any, historyMode: 'push' | 'replace' = 'push') => {
        const newTexts = [...(scene.texts || [])];
        newTexts[tIndex] = { ...newTexts[tIndex], [field]: val };
        onUpdateScene(sceneIndex, { texts: newTexts }, historyMode);
    };

    // Helper to commit the final value to history
    const handleCommitChange = (tIndex: number, field: string, val: any) => {
        handleTextChange(tIndex, field, val, 'push');
    };

    const addText = () => {
        const newText: TextLayer = {
            id: crypto.randomUUID(),
            text: "New Text",
            x: 50,
            y: 50,
            fontSize: 24,
            fontWeight: 'bold',
            fontStyle: 'normal',
            color: '#ffffff'
        };
        const newTexts = [...(scene.texts || []), newText];
        onUpdateScene(sceneIndex, { texts: newTexts });
        if (onSelectText) {
            onSelectText(newTexts.length - 1);
        }
    };

    const removeText = (tIndex: number) => {
        const newTexts = (scene.texts || []).filter((_, i) => i !== tIndex);
        onUpdateScene(sceneIndex, { texts: newTexts });
        if (onSelectText) onSelectText(-1);
    };

    const selectedText = selectedTextIndex !== null && selectedTextIndex >= 0 && scene.texts && scene.texts[selectedTextIndex]
        ? scene.texts[selectedTextIndex]
        : null;

    return (
        <div className={className}>
            {selectedText ? (
                <>
                    <div className="mb-4 pb-4 border-b border-[#222]">
                        <div className="flex justify-between mb-2">
                            <label className={styles.label}>Text Layer {selectedTextIndex! + 1}</label>
                            <button
                                onClick={() => removeText(selectedTextIndex!)}
                                className="text-red-500 hover:text-red-400 text-[10px] uppercase"
                            >
                                <Trash2 size={10} className="inline mr-1" /> Remove
                            </button>
                        </div>

                        <textarea
                            value={selectedText.text}
                            onChange={(e) => handleTextChange(selectedTextIndex!, 'text', e.target.value)}
                            placeholder="Type here..."
                            className={`${styles.input} mb-3 min-h-[60px] resize-y`}
                        />

                        <div className={styles.grid2}>
                            <div>
                                <label className={styles.label}><Move size={10} className="inline mr-1" /> X: {selectedText.x}%</label>
                                <input
                                    type="range" min="0" max="100" value={selectedText.x}
                                    onChange={(e) => handleTextChange(selectedTextIndex!, 'x', parseInt(e.target.value), 'replace')}
                                    onMouseUp={(e) => handleCommitChange(selectedTextIndex!, 'x', parseInt((e.target as HTMLInputElement).value))}
                                    className={styles.rangeInput}
                                />
                            </div>

                            <div>
                                <label className={styles.label}><Move size={10} className="inline mr-1" /> Y: {selectedText.y}%</label>
                                <input
                                    type="range" min="0" max="100" value={selectedText.y}
                                    onChange={(e) => handleTextChange(selectedTextIndex!, 'y', parseInt(e.target.value), 'replace')}
                                    onMouseUp={(e) => handleCommitChange(selectedTextIndex!, 'y', parseInt((e.target as HTMLInputElement).value))}
                                    className={styles.rangeInput}
                                />
                            </div>

                            <div className="col-span-2 mt-2">
                                <label className={styles.label}><Move size={10} className="inline mr-1" /> Width: {selectedText.width || 'Auto'}</label>
                                <input
                                    type="range" min="0" max="100" value={selectedText.width || 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        handleTextChange(selectedTextIndex!, 'width', val === 0 ? undefined : val);
                                    }}
                                    className={styles.rangeInput}
                                />
                                <div className="text-[10px] text-gray-500 text-right">0 = Auto</div>
                            </div>

                            <div className="col-span-2 mt-2">
                                <label className={styles.label}><Type size={10} className="inline mr-1" /> Font Size: {selectedText.fontSize}px</label>
                                <input
                                    type="range" min="12" max="128" value={selectedText.fontSize}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        handleTextChange(selectedTextIndex!, 'fontSize', val);
                                    }}
                                    className={styles.rangeInput}
                                />
                            </div>
                        </div>

                        <div className={`${styles.grid2} mt-3`}>
                            <button
                                className={`p-2 rounded border border-[#333] hover:border-neon-green transition-colors flex items-center justify-center ${selectedText.fontWeight === 'bold' ? 'bg-white/20 text-neon-green' : 'text-gray-400'}`}
                                onClick={() => {
                                    const textarea = document.querySelector(`textarea`) as HTMLTextAreaElement;
                                    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const text = selectedText.text;
                                        const selected = text.substring(start, end);

                                        const isWrapped = start >= 2 && end <= text.length - 2 &&
                                            text.substring(start - 2, start) === "**" &&
                                            text.substring(end, end + 2) === "**";

                                        let newText = isWrapped
                                            ? text.substring(0, start - 2) + selected + text.substring(end + 2)
                                            : text.substring(0, start) + "**" + selected + "**" + text.substring(end);

                                        handleTextChange(selectedTextIndex!, 'text', newText);
                                    } else {
                                        handleTextChange(selectedTextIndex!, 'fontWeight', selectedText.fontWeight === 'bold' ? 'normal' : 'bold');
                                    }
                                }}
                                title="Bold (Select text to apply inline)"
                            >
                                <Bold size={16} />
                            </button>
                            <button
                                className={`p-2 rounded border border-[#333] hover:border-neon-green transition-colors flex items-center justify-center ${selectedText.fontStyle === 'italic' ? 'bg-white/20 text-neon-green' : 'text-gray-400'}`}
                                onClick={() => {
                                    const textarea = document.querySelector(`textarea`) as HTMLTextAreaElement;
                                    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const text = selectedText.text;
                                        const selected = text.substring(start, end);

                                        const isWrapped = start >= 1 && end <= text.length - 1 &&
                                            text.substring(start - 1, start) === "*" &&
                                            text.substring(end, end + 1) === "*" &&
                                            (text.substring(start - 2, start) !== "**");

                                        let newText = isWrapped
                                            ? text.substring(0, start - 1) + selected + text.substring(end + 1)
                                            : text.substring(0, start) + "*" + selected + "*" + text.substring(end);

                                        handleTextChange(selectedTextIndex!, 'text', newText);
                                    } else {
                                        handleTextChange(selectedTextIndex!, 'fontStyle', selectedText.fontStyle === 'italic' ? 'normal' : 'italic');
                                    }
                                }}
                                title="Italic (Select text to apply inline)"
                            >
                                <Italic size={16} />
                            </button>
                        </div>

                        <div className="mt-3">
                            <label className={styles.label}>Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={selectedText.color || '#ffffff'}
                                    onChange={(e) => handleTextChange(selectedTextIndex!, 'color', e.target.value, 'replace')}
                                    onBlur={(e) => handleCommitChange(selectedTextIndex!, 'color', e.target.value)}
                                    className="h-8 w-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedText.color || ''}
                                    onChange={(e) => handleTextChange(selectedTextIndex!, 'color', e.target.value, 'replace')}
                                    onBlur={(e) => handleCommitChange(selectedTextIndex!, 'color', e.target.value)}
                                    placeholder="#"
                                    className={styles.input}
                                    style={{ height: '2rem', padding: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onSelectText && onSelectText(-1)}
                        className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mb-2"
                    >
                        <ChevronLeft size={10} /> Back to List
                    </button>
                </>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="text-gray-500 text-sm italic text-center py-4 border border-dashed border-[#333] rounded">
                        Select text to edit.
                    </div>

                    {scene.texts && scene.texts.length > 0 && (
                        <div className="max-h-48 overflow-y-auto pr-1 space-y-2 mb-3 mt-4 custom-scrollbar">
                            {scene.texts.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelectText && onSelectText(idx)}
                                    className="w-full text-left p-3 bg-black border border-[#333] hover:border-neon-green hover:text-neon-green hover:bg-white/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-[2px] h-full bg-[#333] group-hover:bg-neon-green transition-colors"></div>
                                    <div className="flex items-center gap-3 pl-2">
                                        <span className="font-rajdhani font-bold text-[#666] group-hover:text-neon-green text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                                        <span className="font-rajdhani text-sm truncate text-gray-300 group-hover:text-white flex-1">{t.text || "Empty Text"}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <button onClick={addText} className={`${styles.button} w-full mt-2 border-dashed`}>
                        <Plus size={14} /> ADD TEXT
                    </button>
                </div>
            )}
        </div>
    );
}