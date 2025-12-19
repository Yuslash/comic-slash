import React from 'react';
import { Scene, LayoutNode, SplitNode, FrameNode } from '@/types/comic';

interface LayerSidebarProps {
    scene: Scene;
    selectedFrameIds: string[];
    onSelectFrame: (id: string, isMulti: boolean) => void;
}

export default function LayerSidebar({ scene, selectedFrameIds, onSelectFrame }: LayerSidebarProps) {

    // Flatten the tree to a list of frames for the layer view
    const getFrames = (node: LayoutNode): FrameNode[] => {
        if (node.type === 'frame') {
            return [node as FrameNode];
        }
        if (node.type === 'split' && 'children' in node) {
            return (node as SplitNode).children.flatMap(getFrames);
        }
        return [];
    };

    const frames = getFrames(scene.root);

    return (
        <div className="w-64 bg-black border-l-4 border-white flex flex-col h-full font-rajdhani">
            {/* Header */}
            <div className="p-4 border-b-4 border-white bg-[#ccff00] flex justify-between items-center">
                <span className="text-black font-black italic tracking-tighter text-xl">LAYERS</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-black" />
                    <div className="w-1.5 h-1.5 bg-black" />
                    <div className="w-1.5 h-1.5 bg-black" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[repeating-linear-gradient(45deg,#111_0px,#111_10px,#0a0a0a_10px,#0a0a0a_20px)]">
                {frames.map((frame, index) => {
                    const isSelected = selectedFrameIds.includes(frame.id);
                    return (
                        <div
                            key={frame.id}
                            className={`
                                relative p-3 cursor-pointer flex items-center gap-3 transition-all group
                                border-2 
                                ${isSelected
                                    ? 'bg-gray-900 border-[#ccff00] shadow-[4px_4px_0px_#ccff00] translate-x-1 -translate-y-1'
                                    : 'bg-black border-gray-800 hover:border-gray-500 hover:-translate-y-0.5'
                                }
                            `}
                            onClick={(e) => onSelectFrame(frame.id, e.shiftKey)}
                        >
                            {/* Number Badge */}
                            <div className={`
                                w-7 h-7 flex items-center justify-center text-sm font-bold border-2
                                ${isSelected ? 'bg-[#ccff00] text-black border-black' : 'bg-gray-900 text-gray-500 border-gray-700 group-hover:text-white'}
                            `}>
                                {frame.order || index + 1}
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className={`text-sm font-bold uppercase tracking-wide ${isSelected ? 'text-[#ccff00]' : 'text-gray-400 group-hover:text-white'}`}>
                                    {frame.image ? 'Image Frame' : 'Empty Frame'}
                                </span>
                                <span className="text-[10px] text-gray-600 font-mono">ID: {frame.id.slice(0, 6)}</span>
                            </div>

                            {/* Spoiler Indicator */}
                            {frame.spoiler && (
                                <div className="absolute right-2 top-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" title="Spoiler Active" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-2 border-t-2 border-white bg-black text-center">
                <div className="text-[10px] text-[#ccff00] font-mono opacity-50">TOTAL_FRAMES: {frames.length}</div>
            </div>
        </div>
    );
}
