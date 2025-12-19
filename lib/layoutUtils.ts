import { LayoutNode, SplitNode, FrameNode } from '@/types/comic';

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Recursively finds the FrameNode that contains the point (x, y).
 * Coordinates x, y are percentages (0-100).
 */
export function findFrameAt(
    node: LayoutNode,
    x: number,
    y: number,
    currentRect: Rect = { x: 0, y: 0, w: 100, h: 100 }
): FrameNode | null {
    // Check if point is inside current rect
    if (
        x < currentRect.x ||
        x > currentRect.x + currentRect.w ||
        y < currentRect.y ||
        y > currentRect.y + currentRect.h
    ) {
        return null;
    }

    if (node.type === 'frame') {
        return node as FrameNode;
    }

    if (node.type === 'split') {
        const split = node as SplitNode;
        // NOTE: Based on DynamicRenderer.tsx:
        // direction='horizontal' uses 'flex-col' -> Stacks vertically (Top to Bottom)
        // direction='vertical' uses 'flex-row' -> Side by Side (Left to Right)
        const isStackVertical = split.direction === 'horizontal';

        let currentOffset = isStackVertical ? currentRect.y : currentRect.x;

        for (let i = 0; i < split.children.length; i++) {
            const childKey = split.children[i];
            const sizePercent = split.childrenSizes[i];

            // Calculate child rect
            const childRect: Rect = isStackVertical
                ? {
                    x: currentRect.x,
                    y: currentOffset,
                    w: currentRect.w,
                    h: (currentRect.h * sizePercent) / 100
                }
                : {
                    x: currentOffset,
                    y: currentRect.y,
                    w: (currentRect.w * sizePercent) / 100,
                    h: currentRect.h
                };

            const found = findFrameAt(childKey, x, y, childRect);
            if (found) return found;

            // Advance offset
            currentOffset += isStackVertical ? childRect.h : childRect.w;
        }
    }

    return null;
}

/**
 * Recursively collects all FrameNodes from the layout tree.
 * Sorts them by 'order' property if available (numeric/string comparison).
 */
export function collectOrderedFrames(node: LayoutNode): FrameNode[] {
    let frames: FrameNode[] = [];

    if (node.type === 'frame') {
        frames.push(node as FrameNode);
    } else if (node.type === 'split') {
        const split = node as SplitNode;
        split.children.forEach(child => {
            frames = frames.concat(collectOrderedFrames(child));
        });
    }

    // Sort by order
    return frames.sort((a, b) => {
        const orderA = parseInt(a.order?.toString() || '0');
        const orderB = parseInt(b.order?.toString() || '0');
        return orderA - orderB;
    });
}
