import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Target, X, ChevronRight, ChevronLeft, CornerDownRight } from "lucide-react";

export interface TourStep {
    target: string; // CSS Selector matches an ID or Class
    title: string;
    content: string;
    disableNext?: boolean;
    validate?: () => boolean; // New: Function to check if step is complete
    disableMask?: boolean; // New: Allow interaction with entire screen (no dimming)
}

interface TourGuideProps {
    steps: TourStep[];
    isOpen: boolean;
    onClose: () => void;
    stepIndex?: number;
    onStepChange?: (index: number) => void;
}

const TourGuide = ({ steps, isOpen, onClose, stepIndex, onStepChange }: TourGuideProps) => {
    const isControlled = stepIndex !== undefined;
    const [internalStep, setInternalStep] = useState(0);
    const currentStep = isControlled ? stepIndex : internalStep;

    // Fix: Track furthest progress to allow backtracking without re-validation blocking
    const [maxStepReached, setMaxStepReached] = useState(0);

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [currentElement, setCurrentElement] = useState<HTMLElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipStyle, setTooltipStyle] = useState({
        opacity: 0,
        top: 0,
        left: 0,
    });

    // Drag State
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 }); // Stores mouse position at start of drag
    const initialOffsetRef = useRef({ x: 0, y: 0 }); // Stores existing offset at start

    // 1. Init
    useEffect(() => {
        if (isOpen) {
            if (!isControlled) setInternalStep(0);
            setMaxStepReached(0); // Reset progress on open
            setIsReady(true);
        } else {
            setIsReady(false);
            setTargetRect(null);
            setCurrentElement(null);
            setMaxStepReached(0);
        }
    }, [isOpen, isControlled]);

    // Track max step
    useEffect(() => {
        setMaxStepReached(prev => Math.max(prev, currentStep));
    }, [currentStep]);

    // 2. Find Target
    useEffect(() => {
        if (!isOpen || !isReady || !steps || steps.length === 0) return;

        const step = steps[currentStep];
        if (!step) return;

        const updateTargetPosition = () => {
            const element = document.querySelector(step.target) as HTMLElement;

            if (element) {
                setCurrentElement(element);
                element.scrollIntoView({ behavior: "smooth", block: "center" });

                const rect = element.getBoundingClientRect();
                setTargetRect({
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height,
                    bottom: rect.bottom + window.scrollY,
                    right: rect.right + window.scrollX,
                    x: rect.x,
                    y: rect.y,
                    toJSON: rect.toJSON
                });
            }
        };

        updateTargetPosition();
        // Retry for dynamic content
        const timer = setTimeout(updateTargetPosition, 300);

        window.addEventListener("resize", updateTargetPosition);
        window.addEventListener("scroll", updateTargetPosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", updateTargetPosition);
            window.removeEventListener("scroll", updateTargetPosition);
        };
    }, [currentStep, isOpen, isReady, steps]);

    // Reset drag on step change
    useEffect(() => {
        setDragOffset({ x: 0, y: 0 });
    }, [currentStep, isOpen]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        initialOffsetRef.current = { ...dragOffset };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setDragOffset({
                x: initialOffsetRef.current.x + dx,
                y: initialOffsetRef.current.y + dy
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // 3. Smart Positioning
    useLayoutEffect(() => {
        if (!targetRect || !tooltipRef.current) return;

        const tooltip = tooltipRef.current;
        const rect = tooltip.getBoundingClientRect();
        const tipWidth = rect.width;
        const tipHeight = rect.height;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 15;

        const targetTop = targetRect.top - window.scrollY;
        const targetLeft = targetRect.left - window.scrollX;
        const targetHeight = targetRect.height;
        const targetWidth = targetRect.width;

        // Default: Bottom
        let top = targetTop + targetHeight + padding;

        // Overflow Bottom -> Try Top
        if (top + tipHeight > viewportHeight - 10) {
            const spaceAbove = targetTop - tipHeight - padding;
            if (spaceAbove > 10) {
                top = spaceAbove;
            } else {
                // If both tight, pick largest space
                const spaceBelow = viewportHeight - (targetTop + targetHeight);
                if (spaceAbove > spaceBelow) top = spaceAbove;
                else top = Math.min(top, viewportHeight - tipHeight - 10);
            }
        }

        // Horizontal Center
        let left = targetLeft + targetWidth / 2 - tipWidth / 2;

        // Clamp Horizontal
        if (left < 10) left = 10;
        if (left + tipWidth > viewportWidth - 10) left = viewportWidth - tipWidth - 10;

        setTooltipStyle({
            top,
            left,
            opacity: 1,
        });

    }, [targetRect, currentStep]);

    // 4. Navigation Handlers
    const handleNext = () => {
        const step = steps[currentStep];
        if (step.validate && !step.validate()) {
            return; // Block if not valid
        }

        const nextStep = currentStep + 1;
        if (onStepChange) onStepChange(nextStep);
        if (!isControlled) {
            if (nextStep < steps.length) setInternalStep(nextStep);
            else onClose();
        }
    };

    const handlePrev = () => {
        const prevStep = currentStep - 1;
        if (prevStep >= 0) {
            if (onStepChange) onStepChange(prevStep);
            if (!isControlled) setInternalStep(prevStep);
        }
    };

    if (!isOpen || !steps[currentStep] || !targetRect) return null;
    const stepData = steps[currentStep];
    const isStepLocked = stepData.validate && !stepData.validate() && currentStep >= maxStepReached;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none font-sans text-white">

            {/* --- BLOCKING OVERLAY --- */}
            {!stepData.disableMask && (
                <>
                    <div className="fixed top-0 left-0 w-full bg-[#0a0a0a]/80 pointer-events-auto transition-all duration-300 ease-out" style={{ height: targetRect.top - 5 }} />
                    <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a]/80 pointer-events-auto transition-all duration-300 ease-out" style={{ top: targetRect.bottom + 5 }} />
                    <div className="fixed left-0 bg-[#0a0a0a]/80 pointer-events-auto transition-all duration-300 ease-out" style={{ top: targetRect.top - 5, height: targetRect.height + 10, width: targetRect.left - 5 }} />
                    <div className="fixed right-0 bg-[#0a0a0a]/80 pointer-events-auto transition-all duration-300 ease-out" style={{ top: targetRect.top - 5, height: targetRect.height + 10, left: targetRect.right + 5 }} />
                </>
            )}

            {/* --- HIGHLIGHT BOX --- */}
            <div
                className="fixed transition-all duration-300 ease-out z-[10000]"
                style={{
                    top: targetRect.top - 10,
                    left: targetRect.left - 10,
                    width: targetRect.width + 20,
                    height: targetRect.height + 20,
                }}
            >
                <div className="absolute inset-0 border border-dashed border-[#ccff00]/50 rounded-sm" />
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ccff00]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ccff00]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ccff00]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ccff00]" />
                <div className="absolute -top-6 left-0 bg-[#ccff00] text-black text-[10px] font-bold px-2 py-0.5 font-teko tracking-widest uppercase">
                    Focus Target
                </div>
            </div>

            {/* --- TOOLTIP CARD --- */}
            <div
                ref={tooltipRef}
                className="absolute pointer-events-auto z-[10001] transition-all duration-300 ease-out"
                style={{
                    top: tooltipStyle.top + dragOffset.y,
                    left: tooltipStyle.left + dragOffset.x,
                    opacity: tooltipStyle.opacity,
                    cursor: isDragging ? 'grabbing' : 'auto'
                }}
            >
                {/* Card Container */}
                <div
                    className="w-[360px] bg-[#121212] border border-[#333] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0)' }} // Standard box for card, button has the cut
                >
                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] bg-white pointer-events-none mix-blend-overlay"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />

                    {/* Progress Bar (Thin Top Line) */}
                    <div className="h-[2px] w-full bg-[#222]">
                        <div
                            className="h-full bg-[#ccff00] transition-all duration-300 ease-out shadow-[0_0_10px_#ccff00]"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <div className="p-6 relative z-10">
                        {/* Header */}
                        <div
                            className="flex justify-between items-start mb-4 cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex flex-col pointer-events-none">
                                <span className="text-[#ccff00] text-xs font-teko tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                                    // Step {currentStep + 1} of {steps.length}
                                </span>
                                <h3 className="text-3xl font-bold text-white font-teko uppercase leading-[0.85] tracking-wide">
                                    {stepData.title}
                                </h3>
                            </div>
                            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Content */}
                        <p className="text-gray-400 text-sm font-rajdhani leading-relaxed mb-8 font-medium border-l border-[#333] pl-3">
                            {stepData.content}
                        </p>

                        {/* Validation Warning - Only show if current step is the frontier and invalid */}
                        {isStepLocked && (
                            <div className="mb-6 bg-[#ccff00]/10 border border-[#ccff00]/20 p-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[#ccff00] animate-pulse" />
                                <span className="text-[#ccff00] text-[10px] font-mono uppercase tracking-widest">
                                    Complete action to proceed
                                </span>
                            </div>
                        )}

                        {/* Footer / Buttons */}
                        <div className="flex justify-between items-center mt-2">

                            {/* PREV BUTTON (Subtle, Left) */}
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className={`
                                    flex items-center gap-2 text-sm font-bold font-teko tracking-widest uppercase transition-colors pr-4
                                    ${currentStep === 0
                                        ? "text-gray-800 cursor-not-allowed"
                                        : "text-gray-500 hover:text-white"
                                    }
                                `}
                            >
                                <ChevronLeft size={14} /> PREV
                            </button>

                            {/* NEXT BUTTON (Solid Lime, Right, Cut Top-Left Corner) */}
                            <button
                                onClick={handleNext}
                                disabled={isStepLocked}
                                className={`
                                    relative group
                                    bg-[#ccff00] hover:bg-[#b3e600]
                                    text-black font-teko font-bold text-xl tracking-wide uppercase
                                    pl-6 pr-5 py-2
                                    flex items-center gap-2
                                    transition-all duration-200
                                    ${isStepLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]'}
                                `}
                                // This clip-path cuts the TOP-LEFT corner to match your reference image
                                style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)' }}
                            >
                                <span className="mt-0.5">{currentStep === steps.length - 1 ? "Finish" : "Next Step"}</span>
                                {currentStep !== steps.length - 1 && (
                                    <ChevronRight size={18} strokeWidth={3} className="text-black" />
                                )}
                                {currentStep === steps.length - 1 && (
                                    <CornerDownRight size={18} strokeWidth={3} className="text-black" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourGuide;