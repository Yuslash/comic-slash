
export interface Dialogue {
    text: string;
    x: number;
    y: number;
    style: 'normal' | 'shout';
    bgColor?: string;
    width?: number;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: 'normal' | 'italic';
    speaker?: string;
}

export interface TextLayer {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontWeight: 'normal' | 'bold' | number;
    fontStyle: 'normal' | 'italic';
    color: string;
    width?: number; // Optional max width
    rotation?: number;
    opacity?: number;
}

export interface ImageConfig {
    scale: number; // Percentage, default 100
    x: number;     // Percentage, default 50
    y: number;     // Percentage, default 50
    mirror?: boolean; // Optional for backward compatibility
}

export type NodeType = 'frame' | 'split';

export interface AutoLayoutConfig {
    padding?: number | { top: number; right: number; bottom: number; left: number };
    gap?: number;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'space-between';
}

export interface BaseLayoutNode {
    id: string;
    type: NodeType;
    parent?: string;
    layout?: AutoLayoutConfig;
}

export interface FrameNode extends BaseLayoutNode {
    type: 'frame';
    image?: string;
    imageId?: string; // ImageKit File ID for cleanup
    imageConfig?: ImageConfig;
    // Corners for the polygonal shape (percentages relative to the frame box)
    // Default: [{x:0,y:0}, {x:100,y:0}, {x:100,y:100}, {x:0,100}]
    corners?: { x: number; y: number }[];
    order?: number | string;
    spoiler?: boolean;
    backgroundColor?: string;
}

export interface SplitNode extends BaseLayoutNode {
    type: 'split';
    direction: 'horizontal' | 'vertical';
    children: LayoutNode[]; // Recursive reference
    childrenSizes: number[]; // Percentages, summing to 100
    gap?: number; // Gap between children in pixels
}

export type LayoutNode = FrameNode | SplitNode;

export interface Scene {
    id: number;
    // root is likely a SplitNode or FrameNode
    root: LayoutNode;
    dialogue: Dialogue[];
    texts?: TextLayer[];
}

export type ComicData = Scene[];

export interface Chapter {
    _id?: string;
    id: string;
    seriesId: string;
    title: string;
    order: number;
    coverImage?: string;
    description?: string;
    data: ComicData;
    password?: string;
    published?: boolean;
    updatedAt: string;
}

export interface Series {
    _id?: string;
    id: string;
    title: string;
    author: string;
    coverImage?: string;
    description?: string;
    coverImageId?: string; // Correct for missing field seen in code
    tags: string[];
    status: 'ongoing' | 'completed' | 'hiatus';
    published?: boolean;
    updatedAt: string;
}
