import React, { useState, useEffect, useRef } from 'react';
import { Dialogue } from '@/types/comic';
import { parseRichText } from '@/lib/textUtils';

interface DraggableBubbleProps {
    dialogue: Dialogue;
    index: number;
    onUpdate?: (index: number, updates: Partial<Dialogue>, historyMode?: 'push' | 'replace') => void;
    isEditable?: boolean;
    isSelected?: boolean;
}

export default function DraggableBubble({ dialogue, index, onUpdate, isEditable = false, isSelected = false }: DraggableBubbleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(dialogue.text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditText(dialogue.text);
    }, [dialogue.text]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isEditable) {
            e.stopPropagation();
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (onUpdate && editText !== dialogue.text) {
            onUpdate(index, { text: editText });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
    };

    const [isDragging, setIsDragging] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef({ x: 0, y: 0 }); // Mouse start position
    const startPos = useRef({ x: 0, y: 0 });  // Bubble start position (%)

    // Local state for smooth dragging without triggering global updates/autosave
    const [currentPos, setCurrentPos] = useState({ x: dialogue.x, y: dialogue.y });

    // Sync local state with props when NOT dragging (so undo/redo works)
    useEffect(() => {
        if (!isDragging) {
            setCurrentPos({ x: dialogue.x, y: dialogue.y });
        }
    }, [dialogue.x, dialogue.y, isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing || !isEditable) return;
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') return;

        e.preventDefault();
        e.stopPropagation();

        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { x: currentPos.x, y: currentPos.y };
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !bubbleRef.current) return;

            const parent = bubbleRef.current.offsetParent as HTMLElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();

            const deltaX = e.clientX - dragStart.current.x;
            const deltaY = e.clientY - dragStart.current.y;

            const deltaPercentX = (deltaX / parentRect.width) * 100;
            const deltaPercentY = (deltaY / parentRect.height) * 100;

            let newX = startPos.current.x + deltaPercentX;
            let newY = startPos.current.y + deltaPercentY;

            newX = Math.round(newX * 10) / 10;
            newY = Math.round(newY * 10) / 10;

            // Update LOCAL state only
            setCurrentPos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // Commit to Global State / History ONLY on drag end
                if (onUpdate) {
                    onUpdate(index, { x: currentPos.x, y: currentPos.y }, 'push');
                }
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, index, onUpdate, currentPos.x, currentPos.y]);
    // Note: Dependent on currentPos inside effect might serve no purpose for math, but okay.
    // Actually we use startPos ref for math, so currentPos dependency is not strictly needed for calc.

    const style: React.CSSProperties = {
        left: `${currentPos.x}%`,
        top: `${currentPos.y}%`,
        position: 'absolute',
        zIndex: isDragging ? 200 : 100,
        width: dialogue.width ? `${dialogue.width}%` : 'auto',
        maxWidth: dialogue.width ? 'none' : '45vw',
        cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        touchAction: 'none'
    };

    // 1. Determine the background color in one place
    const backgroundColor = dialogue.style === 'shout'
        ? 'var(--neon-green)'
        : (dialogue.bgColor || '#ffffff'); // Default to white if undefined

    // 2. Apply it to the bubble style
    const bubbleStyle: React.CSSProperties = {
        background: backgroundColor,
        fontSize: dialogue.fontSize ? `${dialogue.fontSize}px` : 'inherit',
        fontWeight: dialogue.fontWeight || 'normal',
        fontStyle: dialogue.fontStyle || 'normal',
        // Use border for selection to guarantee visibility (transparent when not selected to prevent layout shift)
        border: isSelected ? '2px solid #ccff00' : '2px solid transparent',
        boxShadow: isDragging
            ? '0 10px 20px rgba(0,0,0,0.5)'
            : (isSelected ? '0 4px 10px rgba(0,0,0,0.5)' : 'none'),
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.1s, box-shadow 0.1s, border-color 0.1s'
    };

    return (
        <div
            ref={bubbleRef}
            className="bubble-wrap"
            style={style}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {dialogue.speaker && (
                <div style={{
                    position: 'absolute',
                    top: '-1.8em',
                    left: '0',
                    // 3. Apply the same color here
                    background: backgroundColor,
                    color: 'black',
                    padding: '0 4px',
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    zIndex: 101,
                    whiteSpace: 'nowrap'
                }}>
                    {dialogue.speaker}
                </div>
            )}
            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bubble-input"
                    style={{
                        ...bubbleStyle,
                        width: '100%',
                        minHeight: '50px',
                        resize: 'none',
                        overflow: 'hidden',
                        color: 'black',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        border: 'none',
                        outline: '2px solid var(--neon-green)',
                        padding: '10px'
                    }}
                />
            ) : (
                <div
                    className="bubble"
                    style={bubbleStyle}
                >
                    {parseRichText(dialogue.text)}
                </div>
            )}
        </div>
    );
}
