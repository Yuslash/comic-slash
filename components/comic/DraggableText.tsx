import React, { useState, useEffect, useRef } from 'react';
import { TextLayer } from '@/types/comic';
import { parseRichText } from '@/lib/textUtils';

interface DraggableTextProps {
    textLayer: TextLayer;
    index: number;
    onUpdate?: (index: number, updates: Partial<TextLayer>, historyMode?: 'push' | 'replace') => void;
    isEditable?: boolean;
    isSelected?: boolean;
    onSelect?: (index: number) => void;
}

export default function DraggableText({
    textLayer,
    index,
    onUpdate,
    isEditable = false,
    isSelected = false,
    onSelect
}: DraggableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(textLayer.text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditText(textLayer.text);
    }, [textLayer.text]);

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
        if (onUpdate && editText !== textLayer.text) {
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
    const textRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef({ x: 0, y: 0 }); // Mouse start position
    const startPos = useRef({ x: 0, y: 0 });  // Text start position (%)

    // Local state for smooth dragging without triggering global updates/autosave
    const [currentPos, setCurrentPos] = useState({ x: textLayer.x, y: textLayer.y });

    // Sync local state with props when NOT dragging
    useEffect(() => {
        if (!isDragging) {
            setCurrentPos({ x: textLayer.x, y: textLayer.y });
        }
    }, [textLayer.x, textLayer.y, isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing || !isEditable) return;
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') return;

        e.preventDefault();
        e.stopPropagation();

        if (onSelect) onSelect(index);

        dragStart.current = { x: e.clientX, y: e.clientY };
        startPos.current = { x: currentPos.x, y: currentPos.y };
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !textRef.current) return;

            const parent = textRef.current.offsetParent as HTMLElement;
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

    const style: React.CSSProperties = {
        left: `${currentPos.x}%`,
        top: `${currentPos.y}%`,
        position: 'absolute',
        zIndex: isDragging ? 200 : 100,
        width: textLayer.width ? `${textLayer.width}%` : 'auto',
        maxWidth: textLayer.width ? 'none' : '45vw',
        cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
        touchAction: 'none',
        transform: 'translate(-50%, -50%)' // Center align by default
    };

    const textStyle: React.CSSProperties = {
        color: textLayer.color,
        fontSize: `${textLayer.fontSize}px`,
        fontWeight: textLayer.fontWeight,
        fontStyle: textLayer.fontStyle,
        border: isSelected ? '1px dashed #00ffff' : '1px solid transparent', // Different color for text selection
        padding: '4px',
        whiteSpace: 'pre-wrap',
        textAlign: 'center',
        background: isSelected ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
    };

    return (
        <div
            ref={textRef}
            style={style}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {isEditing ? (
                <textarea
                    ref={inputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        ...textStyle,
                        width: '100%',
                        minWidth: '100px',
                        minHeight: '1.5em',
                        resize: 'none',
                        overflow: 'hidden',
                        fontFamily: 'inherit',
                        outline: '1px solid cyan',
                        background: 'rgba(0,0,0,0.8)'
                    }}
                />
            ) : (
                <div style={textStyle}>
                    {parseRichText(textLayer.text)}
                </div>
            )}
        </div>
    );
}

