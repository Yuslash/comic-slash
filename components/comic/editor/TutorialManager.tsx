import React, { useState, useEffect } from 'react';
import TourGuide, { TourStep } from '@/components/ui/TourGuide'; // Adjust path as needed
import { Scene, LayoutNode, SplitNode } from '@/types/comic'; // Adjust path as needed
import { Terminal, ShieldCheck, ChevronRight, X } from 'lucide-react';

const STORAGE_KEY = 'comic-studio-tutorial-completed';

interface TutorialManagerProps {
    selectedFrameIds: string[];
    scene: Scene;
}

export default function TutorialManager({ selectedFrameIds, scene }: TutorialManagerProps) {
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    // Initial check
    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
            setHasChecked(true);
            setShowWelcome(true);
        }
    }, []);

    // --- Validation Logic (Kept exactly as provided) ---

    // 1. Selection
    const isFrameSelected = selectedFrameIds.length > 0;
    const isMultiSelected = selectedFrameIds.length > 1;

    // 2. Tree Traversal Helpers
    const traverseTree = (node: LayoutNode, callback: (node: LayoutNode) => void) => {
        callback(node);
        if (node.type === 'split' && 'children' in node) {
            (node as SplitNode).children.forEach(child => traverseTree(child, callback));
        }
    };

    // 3. Count Splits
    const splitCount = React.useMemo(() => {
        let count = 0;
        traverseTree(scene.root, (node) => {
            if (node.type === 'split') count++;
        });
        return count;
    }, [scene]);

    const hasUserSplit = splitCount > 1;

    // 4. Check for Gaps
    const hasGap = React.useMemo(() => {
        let found = false;
        traverseTree(scene.root, (node) => {
            if (node.type === 'split' && (node as SplitNode).gap && (node as SplitNode).gap! > 0) {
                found = true;
            }
        });
        return found;
    }, [scene]);

    // 5. Check for Equalization
    const isEqualized = React.useMemo(() => {
        let found = false;
        traverseTree(scene.root, (node) => {
            if (node.type === 'split') {
                const sizes = (node as SplitNode).childrenSizes;
                if (sizes.length > 1) {
                    const avg = 100 / sizes.length;
                    const isEven = sizes.every(s => Math.abs(s - avg) < 1);
                    if (isEven) found = true;
                }
            }
        });
        return found;
    }, [scene]);

    // 6. Check for Removed Frame
    const frameCount = React.useMemo(() => {
        let count = 0;
        traverseTree(scene.root, (node) => {
            if (node.type === 'frame') count++;
        });
        return count;
    }, [scene]);

    // 7. Check for Resized Split (User dragged handle)
    const hasResized = React.useMemo(() => {
        let found = false;
        traverseTree(scene.root, (node) => {
            if (node.type === 'split') {
                const sizes = (node as SplitNode).childrenSizes;
                if (sizes.length > 1) {
                    // Check if sizes are NOT equal (user changed them from default)
                    const avg = 100 / sizes.length;
                    const isEven = sizes.every(s => Math.abs(s - avg) < 1);
                    if (!isEven) found = true;
                }
            }
        });
        return found;
    }, [scene]);

    // --- Steps Definition ---
    const steps: TourStep[] = [
        {
            target: '#studio-header',
            title: 'Welcome to the Studio',
            content: 'This is your mission control. Import, Export, and manage your comic project from the top bar.',
        },
        {
            target: '#main-viewport',
            title: '1. Select a Frame',
            content: 'To begin, click on any frame in the canvas to select it.',
            validate: () => isFrameSelected,
            disableNext: !isFrameSelected, // Optional: strictly enforce validation
            disableMask: true,
        },
        {
            target: '#panel-scene',
            title: '2. Split the Layout',
            content: 'Use the Split Buttons in the sidebar to divide the selected frame. Try creating a new panel now.',
            validate: () => hasUserSplit,
        },
        {
            target: '#split-resizer',
            title: '3. Resize Panels',
            content: 'Hover over the gaps between panels until you see a green highlight, then drag to resize.',
            validate: () => hasResized,
        },
        {
            target: '#main-viewport',
            title: '4. Multi-Select',
            content: 'Hold SHIFT and click multiple frames to select them at once. Try selecting two frames.',
            validate: () => isMultiSelected,
            disableMask: true,
        },
        {
            target: '#gap-slider',
            title: '5. Add Gaps',
            content: 'With multiple frames selected, drag the "Multi-Gap" slider to widen the space between them.',
            validate: () => hasGap,
        },
        {
            target: '#btn-equalize',
            title: '6. Equalize Sizes',
            content: 'If your frames are messy, click the Equalize button to make them perfectly even.',
            validate: () => isEqualized,
        },
        {
            target: '#btn-remove-multi',
            title: '7. Remove Frame',
            content: 'Made a mistake? Click the trash icon in the Multi-Select panel to remove frames.',
            validate: () => frameCount < 3,
        },
        {
            target: '#btn-add-scene',
            title: 'Add New Scenes',
            content: 'Finally, need more pages? Click here to insert a new blank scene into your timeline.',
        }
    ];

    const startTour = () => {
        setShowWelcome(false);
        setIsTourOpen(true);
    };

    const skipTour = () => {
        setShowWelcome(false);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    const handleTourClose = () => {
        setIsTourOpen(false);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    return (
        <>
            {showWelcome && (
                <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">

                    {/* Background Grid Texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(20,20,20,0.5)_2px,transparent_2px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* Main Card */}
                    <div
                        className="relative w-[500px] bg-[#0a0a0a] border border-[#333] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden group"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}
                    >
                        {/* Top Accent Line (Scanline) */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent opacity-50" />

                        {/* Noise Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] bg-white pointer-events-none mix-blend-overlay"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                        />

                        <div className="p-10 relative z-10 flex flex-col items-center text-center">

                            {/* Icon / Badge */}
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-[#ccff00] blur-xl opacity-20 animate-pulse" />
                                <div className="w-16 h-16 bg-[#ccff00]/10 border border-[#ccff00] flex items-center justify-center rounded-sm relative">
                                    <Terminal size={32} className="text-[#ccff00]" />
                                    {/* Corner accents for the icon */}
                                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#ccff00]" />
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#ccff00]" />
                                </div>
                            </div>

                            {/* Headline */}
                            <div className="mb-6">
                                <h2 className="text-5xl font-bold font-teko text-white uppercase tracking-wider mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                    System <span className="text-[#ccff00]">Initialized</span>
                                </h2>
                                <div className="flex items-center justify-center gap-3 text-gray-500 text-xs font-rajdhani tracking-[0.25em] uppercase">
                                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secure Connection</span>
                                    <span className="w-1 h-1 bg-[#ccff00] rounded-full" />
                                    <span>V.1.0.4</span>
                                </div>
                            </div>

                            {/* Body Text */}
                            <p className="text-gray-400 font-rajdhani text-lg leading-relaxed mb-10 max-w-sm">
                                Welcome to the <span className="text-white font-bold">Studio Mainframe</span>.
                                <br />
                                To maximize your creative output, we recommend initiating the tactical onboarding sequence.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-6 w-full justify-center">
                                {/* SKIP Button */}
                                <button
                                    onClick={skipTour}
                                    className="px-6 py-3 text-gray-500 hover:text-white font-teko text-xl tracking-widest uppercase transition-colors"
                                >
                                    Skip
                                </button>

                                {/* START Button */}
                                <button
                                    onClick={startTour}
                                    className="relative group bg-[#ccff00] hover:bg-white text-black px-8 py-3 pr-10 font-teko text-xl font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                    style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)' }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Initiate Tour <ChevronRight size={18} strokeWidth={3} />
                                    </span>
                                </button>
                            </div>

                            {/* Decorative footer text */}
                            <div className="absolute bottom-4 right-10 opacity-20 font-mono text-[10px] text-[#ccff00]">
                                // AWAITING_INPUT...
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <TourGuide
                steps={steps}
                isOpen={isTourOpen}
                onClose={handleTourClose}
            />
        </>
    );
}