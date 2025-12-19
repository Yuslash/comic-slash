import React from 'react';
import { LayoutNode, SplitNode, FrameNode } from '@/types/comic';
import Frame from './Frame';

interface DynamicRendererProps {
    node: LayoutNode;
    selectedFrameIds: string[];
    onSelect: (id: string, isMulti: boolean) => void;
    onResizeSplit?: (id: string, newSizes: number[]) => void;
    onUpdateGap?: (id: string, gap: number) => void;
    onUpdateFrame?: (id: string, updates: Partial<any>) => void;
    isReader?: boolean;
    revealedFrameIds?: Set<string>;
    onRevealFrame?: (id: string) => void;
}

export default function DynamicRenderer({
    node,
    selectedFrameIds,
    onSelect,
    onResizeSplit,
    onUpdateGap,
    onUpdateFrame,
    isReader,
    revealedFrameIds,
    onRevealFrame
}: DynamicRendererProps) {
    if (node.type === 'frame') {
        const isRevealed = revealedFrameIds?.has(node.id) ?? false;
        return (
            <Frame
                node={node as FrameNode}
                selectedFrameIds={selectedFrameIds}
                onSelect={onSelect}
                onUpdate={onUpdateFrame}
                isReader={isReader}
                isRevealed={isRevealed}
                onReveal={onRevealFrame ? () => onRevealFrame(node.id) : undefined}
            />
        );
    }

    if (node.type === 'split') {
        const splitNode = node as SplitNode;
        const layout = splitNode.layout || {};
        const isHorizontal = splitNode.direction === 'horizontal'; // Flex-col vs Flex-row logic

        const flexClass = isHorizontal ? 'flex-col' : 'flex-row';

        // Layout Styles
        const paddingStyle = typeof layout.padding === 'number'
            ? `${layout.padding}px`
            : layout.padding
                ? `${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px`
                : undefined;

        const alignItems = layout.align === 'center' ? 'items-center' :
            layout.align === 'end' ? 'items-end' :
                layout.align === 'start' ? 'items-start' : 'items-stretch';

        const justifyContent = layout.justify === 'center' ? 'justify-center' :
            layout.justify === 'end' ? 'justify-end' :
                layout.justify === 'space-between' ? 'justify-between' : 'justify-start';

        return (
            <div
                className={`flex w-full h-full ${flexClass} ${alignItems} ${justifyContent} overflow-visible`}
                style={{
                    gap: `${layout.gap ?? splitNode.gap ?? 0}px`,
                    padding: paddingStyle
                }}
            >
                {splitNode.children.map((child, index) => {
                    const size = splitNode.childrenSizes[index];
                    return (
                        <div
                            key={child.id}
                            style={{
                                flexBasis: `${size}%`,
                                flexGrow: 0,
                                flexShrink: 0,
                                position: 'relative' // For absolute positioning of resizers if needed
                            }}
                            className="overflow-visible"
                        >
                            <DynamicRenderer
                                node={child}
                                selectedFrameIds={selectedFrameIds}
                                onSelect={onSelect}
                                onResizeSplit={onResizeSplit}
                                onUpdateGap={onUpdateGap}
                                onUpdateFrame={onUpdateFrame}
                                isReader={isReader}
                                revealedFrameIds={revealedFrameIds}
                                onRevealFrame={onRevealFrame}
                            />

                            {/* Resizer Handle (except for last child) */}
                            {index < splitNode.children.length - 1 && onResizeSplit && !isReader && (
                                <div
                                    id="split-resizer"
                                    className={`absolute z-30 flex items-center justify-center bg-transparent group/resizer
                                        ${isHorizontal
                                            ? 'bottom-0 left-0 w-full h-6 translate-y-1/2 cursor-ns-resize'
                                            : 'right-0 top-0 w-6 h-full translate-x-1/2 cursor-ew-resize'
                                        }
                                    `}
                                    title="Drag to resize, Double-click to set gap"
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (onUpdateGap) {
                                            const currentGap = splitNode.gap || 0;
                                            const val = prompt("Enter gap size (px):", currentGap.toString());
                                            if (val !== null) {
                                                const num = parseInt(val, 10);
                                                if (!isNaN(num)) onUpdateGap(splitNode.id, num);
                                            }
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();

                                        const startX = e.clientX;
                                        const startY = e.clientY;
                                        const startSizes = [...splitNode.childrenSizes];
                                        const totalSize = splitNode.childrenSizes.reduce((a, b) => a + b, 0);

                                        // We need the parent container dimensions to calculate percentage delta
                                        const container = (e.target as HTMLElement).parentElement?.parentElement;
                                        if (!container) return;
                                        const containerRect = container.getBoundingClientRect();
                                        const containerSize = isHorizontal ? containerRect.height : containerRect.width;

                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                            const deltaPixels = isHorizontal
                                                ? moveEvent.clientY - startY
                                                : moveEvent.clientX - startX;

                                            const deltaPercent = (deltaPixels / containerSize) * totalSize; // usually totalSize is 100

                                            // Update sizes: current index gets +delta, next index gets -delta
                                            const newSizes = [...startSizes];
                                            newSizes[index] = Math.max(5, startSizes[index] + deltaPercent);
                                            newSizes[index + 1] = Math.max(5, startSizes[index + 1] - deltaPercent);

                                            if (onResizeSplit) {
                                                onResizeSplit(splitNode.id, newSizes);
                                            }
                                        };

                                        const handleMouseUp = () => {
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                        };

                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                    }}
                                >
                                    {/* Visible Line - Always visible (faint), bright on hover */}
                                    <div className={`transition-all duration-200 pointer-events-none rounded-full
                                        ${isHorizontal
                                            ? 'w-full h-1 bg-white/20 group-hover/resizer:h-1.5 group-hover/resizer:bg-neon-green'
                                            : 'w-1 h-full bg-white/20 group-hover/resizer:w-1.5 group-hover/resizer:bg-neon-green'
                                        }
                                    `} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return null;
}
