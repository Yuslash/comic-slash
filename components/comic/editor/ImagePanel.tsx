import { useState } from 'react';
import { FrameNode } from '@/types/comic';
import styles from '../EditorSidebar.module.css';
import { Maximize, Move, Upload } from 'lucide-react';
import ImageUploadModal from '@/components/ui/ImageUploadModal';

interface ImagePanelProps {
    frame: FrameNode;
    onUpdate: (updates: Partial<FrameNode>) => void;
    className?: string;
    seriesTitle?: string;
    chapterTitle?: string;
}

export default function ImagePanel({ frame, onUpdate, className, seriesTitle, chapterTitle }: ImagePanelProps) {
    const [showModal, setShowModal] = useState(false);

    // Helper to update image config
    const updateConfig = (field: 'scale' | 'x' | 'y' | 'mirror', val: number | boolean) => {
        const currentConfig = frame.imageConfig || { scale: 100, x: 50, y: 50, mirror: false };
        onUpdate({
            imageConfig: { ...currentConfig, [field]: val }
        });
    };

    const config = frame.imageConfig || { scale: 100, x: 50, y: 50, mirror: false };

    // Sanitize folder path
    const sanitizedSeries = seriesTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unsorted';
    const sanitizedChapter = chapterTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unsorted';
    const folderPath = `/${sanitizedSeries}/${sanitizedChapter}`;

    return (
        <div className={className}>
            <div className="mb-6">
                <label className={styles.label}>Image Source</label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={frame.image || ''}
                        onChange={(e) => onUpdate({ image: e.target.value })}
                        placeholder="https://..."
                        className={`${styles.input} flex-1`}
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#ccff00] text-black p-2 hover:bg-white transition-colors"
                        title="Upload Image"
                    >
                        <Upload size={16} />
                    </button>
                </div>

                {showModal && (
                    <ImageUploadModal
                        onClose={() => setShowModal(false)}
                        onUploadConfigured={(url, fileId) => onUpdate({ image: url, imageId: fileId })}
                        folderPath={folderPath}
                        fileName={`frame_${frame.id}`}
                    />
                )}

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}><Maximize size={10} className="inline mr-1" /> Scale: {config.scale}%</label>
                        <input
                            type="range" min="10" max="200" value={config.scale}
                            onChange={(e) => updateConfig('scale', parseInt(e.target.value))}
                            className={styles.rangeInput}
                        />
                    </div>
                    <div className="flex items-center justify-end h-full pt-4">
                        <label className="flex items-center cursor-pointer text-xs text-gray-400 hover:text-white uppercase">
                            <input
                                type="checkbox"
                                checked={!!config.mirror}
                                onChange={(e) => updateConfig('mirror', e.target.checked)}
                                className="mr-2 accent-neon-green"
                            />
                            Mirror
                        </label>
                    </div>
                </div>

                <div className={`${styles.grid2} mt-2`}>
                    <div>
                        <label className={styles.label}><Move size={10} className="inline mr-1" /> Pos X: {config.x}%</label>
                        <input
                            type="range" min="0" max="100" value={config.x}
                            onChange={(e) => updateConfig('x', parseInt(e.target.value))}
                            className={styles.rangeInput}
                        />
                    </div>
                    <div>
                        <label className={styles.label}><Move size={10} className="inline mr-1" /> Pos Y: {config.y}%</label>
                        <input
                            type="range" min="0" max="100" value={config.y}
                            onChange={(e) => updateConfig('y', parseInt(e.target.value))}
                            className={styles.rangeInput}
                        />
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#333]">
                    <label className={styles.label}>Frame Background</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={frame.backgroundColor || '#000000'}
                            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                            className="h-8 w-8 p-0 border-0 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={frame.backgroundColor || ''}
                            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                            placeholder="#000000"
                            className={styles.input}
                            style={{ height: '2rem', padding: '0.25rem' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
