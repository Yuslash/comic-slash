import React from 'react';
import { FrameNode } from '@/types/comic';

interface FrameProps {
    node: FrameNode;
    selectedFrameIds: string[];
    onSelect: (id: string, isMulti: boolean) => void;
    onUpdate?: (id: string, updates: Partial<FrameNode>) => void;
    isReader?: boolean;
    isRevealed?: boolean;
    onReveal?: () => void;
}

export default function Frame({
    node,
    selectedFrameIds,
    onSelect,
    onUpdate,
    isReader,
    isRevealed: propIsRevealed,
    onReveal
}: FrameProps) {
    const isActive = selectedFrameIds.includes(node.id);
    const shouldShowSpoiler = node.spoiler || isReader;
    const defaultCorners = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
    const corners = node.corners || defaultCorners;

    // Internal state only used if controlled prop is not provided (fallback)
    const [internalRevealed, setInternalRevealed] = React.useState(false);
    const isRevealed = propIsRevealed !== undefined ? propIsRevealed : internalRevealed;

    const handleReveal = () => {
        if (onReveal) {
            onReveal();
        } else {
            setInternalRevealed(true);
        }
    };

    // Use clip-path if corners exist, otherwise rectangle
    const clipPath = `polygon(${corners.map(c => `${c.x}% ${c.y}%`).join(', ')})`;

    // Track Dimensions
    const [dimensions, setDimensions] = React.useState({ w: 0, h: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    w: Math.round(entry.contentRect.width),
                    h: Math.round(entry.contentRect.height)
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const handleCornerDrag = (i: number, clientX: number, clientY: number, rect: DOMRect) => {
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;

        const percentX = (relativeX / rect.width) * 100;
        const percentY = (relativeY / rect.height) * 100;

        const event = new CustomEvent('update-corner', {
            detail: { frameId: node.id, cornerIndex: i, x: percentX, y: percentY }
        });
        window.dispatchEvent(event);
    };

    // Generate heavy "snow" particles using box-shadow
    // This creates a dense field of 1px dots
    const particleShadows = React.useMemo(() => {
        const generateShadows = (count: number, width: number, height: number) => {
            let shadows = '';
            for (let i = 0; i < count; i++) {
                const x = Math.floor(Math.random() * width);
                const y = Math.floor(Math.random() * height);
                shadows += `${x}vw ${y}vh #fff,`;
            }
            return shadows.slice(0, -1);
        };
        // Using vw/vh allows them to spread across the container regardless of size, 
        // effectively tiling if we set container overflow hidden.
        return {
            small: generateShadows(800, 100, 100), // More density
            medium: generateShadows(200, 100, 100),
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full ${isActive ? 'z-10' : ''} group bg-black`}
        >
            {/* The Clipped Content */}
            <div
                className={`absolute inset-0 overflow-hidden ${isActive ? 'z-10' : 'border border-gray-800'}`}
                style={{ clipPath, backgroundColor: node.backgroundColor || '#000000' }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (shouldShowSpoiler && !isRevealed) {
                        handleReveal();
                        return;
                    }
                    const isMulti = e.shiftKey;
                    onSelect(node.id, isMulti);
                }}
            >
                {/* Advanced Spoiler Overlay */}
                {shouldShowSpoiler && (
                    <div
                        className={`absolute inset-0 z-20 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center cursor-pointer transition-opacity duration-700 ease-out overflow-hidden
                            ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                        `}
                    >
                        <style>{`
                            @keyframes static-move {
                                0% { transform: translate(0, 0); }
                                100% { transform: translate(-10vw, -10vh); }
                            }
                        `}</style>

                        {/* Static/Noise Layers */}
                        <div className="absolute inset-0 opacity-60 mix-blend-screen bg-black/50">
                            {/* Layer 1: Dense Noise (Moving) */}
                            <div
                                className="absolute w-[1px] h-[1px] rounded-full"
                                style={{
                                    boxShadow: particleShadows.small,
                                    animation: 'static-move 20s linear infinite alternate', // Alternate to prevent jump
                                    top: 0,
                                    left: 0
                                }}
                            />
                            {/* Layer 2: Sparse Larger Noise (Moving Faster) */}
                            <div
                                className="absolute w-[2px] h-[2px] rounded-full"
                                style={{
                                    boxShadow: particleShadows.medium,
                                    animation: 'static-move 10s linear infinite alternate-reverse', // Alternate reverse
                                    top: 0,
                                    left: 0
                                }}
                            />
                        </div>

                        {/* Text Removed as requested */}
                    </div>
                )}

                {node.image ? (
                    <img
                        src={node.image}
                        alt="Frame content"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/800x1200/331111/ff0000?text=MISSING+IMG';
                        }}
                        style={{
                            objectPosition: node.imageConfig ? `${node.imageConfig.x}% ${node.imageConfig.y}%` : '50% 50%',
                            transform: node.imageConfig ?
                                `scale(${node.imageConfig.scale / 100}) scaleX(${node.imageConfig.mirror ? -1 : 1})`
                                : 'none',
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs cursor-pointer flex-col gap-1">
                        {/* Frame Empty State removed size display */}
                    </div>
                )}
            </div>

            {/* Selection Outline (SVG to match clip-path) */}
            {isActive && (
                <svg
                    className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <polygon
                        points={corners.map(c => `${c.x},${c.y}`).join(' ')}
                        fill="none"
                        stroke="#ccff00"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        style={{ filter: "drop-shadow(0 0 4px #ccff00)" }}
                    />
                </svg>
            )}

            {/* Selection Overlay (only visible on hover if not active) */}
            {!isActive && !isReader && (
                <div
                    className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ clipPath }}
                />
            )}

            {/* Frame Order Input & Spoiler Toggle (Top Left) */}
            {isActive && (
                <div className="absolute top-2 left-2 z-[60] flex items-center gap-2" onMouseDown={e => e.stopPropagation()}>
                    <input
                        type="text"
                        defaultValue={node.order || ''}
                        placeholder="#"
                        className="w-8 h-8 bg-black/80 border border-white/20 text-white text-center text-sm rounded focus:border-neon-green outline-none"
                        onChange={(e) => {
                            if (onUpdate) {
                                onUpdate(node.id, { order: e.target.value });
                            }
                        }}
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // prevent drag/select
                            if (onUpdate) onUpdate(node.id, { spoiler: !node.spoiler });
                            // Reset reveal state if toggled on
                            if (!node.spoiler) {
                                if (onReveal) {
                                    // If we turn spoiler ON, we can't really "unreveal" via callback easily 
                                    // without parent logic, but here we assume the parent resets or we just rely on parent state.
                                    // Actually, if we just toggle spoiler, the parent state for "revealed" might persist.
                                    // Ideal: parent checks (isSpoiler || isReader) && revealedIDs.has(id).
                                    // For now, let's just not reset manually here, rely on parent derived state if possible.
                                    if (!propIsRevealed) setInternalRevealed(false);
                                } else {
                                    setInternalRevealed(false);
                                }
                            }
                        }}
                        className={`
                            px-2 h-8 rounded text-xs font-bold border transition-colors flex items-center gap-1
                            ${node.spoiler
                                ? 'bg-neon-green text-black border-neon-green hover:bg-neon-green/80'
                                : 'bg-black/80 text-gray-400 border-white/20 hover:text-white hover:border-white/50'}
                        `}
                        title="Toggle Spoiler Effect"
                    >
                        {node.spoiler ? '👁️ SPOILER ON' : '👁️ SPOILER OFF'}
                    </button>
                </div>
            )}

            {/* Corner Handles (Only if Active) */}
            {isActive && corners.map((corner, i) => {
                // Determine cursor based on corner index
                // 0: TL, 1: TR, 2: BR, 3: BL
                const cursorClass =
                    i === 0 ? 'cursor-nw-resize' :
                        i === 1 ? 'cursor-ne-resize' :
                            i === 2 ? 'cursor-se-resize' :
                                'cursor-sw-resize';

                return (
                    <div
                        key={i}
                        id={i === 2 && isActive ? "active-corner-handle" : undefined}
                        className={`absolute w-8 h-8 flex items-center justify-center ${cursorClass} z-[100] group/handle`}
                        style={{
                            left: `${corner.x}%`,
                            top: `${corner.y}%`,
                            transform: 'translate(-50%, -50%)',
                            touchAction: 'none' // Prevent scrolling while dragging
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const container = (e.target as HTMLElement).closest('.relative');
                            if (!container) return;
                            const rect = container.getBoundingClientRect();

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                handleCornerDrag(i, moveEvent.clientX, moveEvent.clientY, rect);
                            };

                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    >
                        <div className="w-3 h-3 bg-neon-green border border-white rounded-full shadow-md group-hover/handle:scale-150 transition-transform" />
                    </div>
                );
            })}
        </div>
    );
}
