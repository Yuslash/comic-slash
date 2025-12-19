import React from 'react';

/**
 * Parses a string with simple Markdown-like syntax into React elements.
 * Supports:
 * - **bold** : <strong>bold</strong>
 * - *italic* : <em>italic</em>
 * 
 * Note: nesting is not fully supported in this simple regex version, 
 * but it handles sequential tags.
 */
export const parseRichText = (text: string): React.ReactNode => {
    if (!text) return null;

    // Split by markers
    // Regex matches:
    // 1. **bold**
    // 2. *italic*
    // We utilize capturing groups to split the string including the matches

    // Pattern: (\*\*.*?\*\*)|(\*.*?\*)
    // We iterate to find matches and push parts

    // Easier approach: Use a simple tokenizer loop or valid recursive logic.
    // Given the simplicity requested, let's use a split with regex that keeps delimiters.

    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <span key={index}>{part}</span>;
    });
};
