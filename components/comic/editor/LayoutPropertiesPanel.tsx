import React from 'react';
import { FrameNode, SplitNode, AutoLayoutConfig } from '@/types/comic';
import {
    AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
    ArrowRight, ArrowDown, LayoutGrid, Maximize
} from 'lucide-react';

interface LayoutPropertiesPanelProps {
    node: FrameNode | SplitNode;
    onUpdate: (updates: any) => void;
}

export default function LayoutPropertiesPanel({ node, onUpdate }: LayoutPropertiesPanelProps) {
    const layout = node.layout || {};

    const updateLayout = (key: keyof AutoLayoutConfig, value: any) => {
        onUpdate({
            layout: {
                ...layout,
                [key]: value
            }
        });
    };

    // Helper for numeric inputs
    const handleNumChange = (key: 'gap' | 'padding', val: string) => {
        const num = parseInt(val) || 0;
        updateLayout(key, num);
    };

    const isSplit = node.type === 'split';

    return (
        <div className="flex flex-col gap-4">
            {/* 1. Direction & Resizing (Mainly for Splits or Flex Frames) */}
            {isSplit && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onUpdate({ direction: 'horizontal' })}
                        className={`flex items-center justify-center gap-2 p-1.5 rounded border ${node.direction === 'horizontal' ? 'bg-[#ccff00]/20 border-[#ccff00] text-[#ccff00]' : 'border-gray-700 text-gray-400 hover:text-white'}`}
                        title="Horizontal Direction"
                    >
                        <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={() => onUpdate({ direction: 'vertical' })}
                        className={`flex items-center justify-center gap-2 p-1.5 rounded border ${node.direction === 'vertical' ? 'bg-[#ccff00]/20 border-[#ccff00] text-[#ccff00]' : 'border-gray-700 text-gray-400 hover:text-white'}`}
                        title="Vertical Direction"
                    >
                        <ArrowDown size={16} />
                    </button>
                </div>
            )}

            {/* 2. Padding & Gap (The "Auto Layout" Inputs) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black border border-[#333] rounded p-1 flex items-center group focus-within:border-[#ccff00]">
                    <div className="p-1.5 text-gray-500 group-focus-within:text-[#ccff00]">
                        <Maximize size={14} />
                    </div>
                    <input
                        type="number"
                        min="0"
                        value={typeof layout.padding === 'number' ? layout.padding : 0}
                        onChange={(e) => handleNumChange('padding', e.target.value)}
                        className="w-full bg-transparent text-white text-xs font-mono outline-none px-1"
                        placeholder="Pad"
                    />
                </div>

                <div className="bg-black border border-[#333] rounded p-1 flex items-center group focus-within:border-[#ccff00]">
                    <div className="p-1.5 text-gray-500 group-focus-within:text-[#ccff00]">
                        <LayoutGrid size={14} />
                    </div>
                    <input
                        type="number"
                        min="0"
                        value={layout.gap || 0}
                        onChange={(e) => handleNumChange('gap', e.target.value)}
                        className="w-full bg-transparent text-white text-xs font-mono outline-none px-1"
                        placeholder="Gap"
                    />
                </div>
            </div>

            {/* 3. Alignment Matrix (Simplified 3x3 grid concept or Flex controls) */}
            <div className="space-y-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Alignment</div>
                <div className="grid grid-cols-3 gap-1 bg-black p-1 border border-[#333] rounded">
                    {/* Justify Controls (Main Axis) */}
                    <button
                        onClick={() => updateLayout('justify', 'start')}
                        className={`p-1 flex justify-center rounded hover:bg-white/10 ${layout.justify === 'start' ? 'text-[#ccff00]' : 'text-gray-500'}`}
                    ><AlignHorizontalJustifyStart size={14} /></button>
                    <button
                        onClick={() => updateLayout('justify', 'center')}
                        className={`p-1 flex justify-center rounded hover:bg-white/10 ${layout.justify === 'center' ? 'text-[#ccff00]' : 'text-gray-500'}`}
                    ><AlignHorizontalJustifyCenter size={14} /></button>
                    <button
                        onClick={() => updateLayout('justify', 'end')}
                        className={`p-1 flex justify-center rounded hover:bg-white/10 ${layout.justify === 'end' ? 'text-[#ccff00]' : 'text-gray-500'}`}
                    ><AlignHorizontalJustifyEnd size={14} /></button>

                    {/* Align Controls (Cross Axis) */}
                    <button
                        onClick={() => updateLayout('align', 'start')}
                        className={`p-1 flex justify-center rounded hover:bg-white/10 ${layout.align === 'start' ? 'text-[#ccff00]' : 'text-gray-500'}`}
                    ><AlignVerticalJustifyStart size={14} /></button>
                    <button
                        onClick={() => updateLayout('align', 'center')}
                        className={`p-1 flex justify-center rounded hover:bg-white/10 ${layout.align === 'center' ? 'text-[#ccff00]' : 'text-gray-500'}`}
                    ><AlignVerticalJustifyCenter size={14} /></button>
                    <button
                        onClick={() => updateLayout('align', 'end')}
                        className={`p-1 flex justify-center rounded hover:bg-white/10 ${layout.align === 'end' ? 'text-[#ccff00]' : 'text-gray-500'}`}
                    ><AlignVerticalJustifyEnd size={14} /></button>
                </div>
            </div>
        </div>
    );
}
