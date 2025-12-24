import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';

interface CollapsiblePanelProps {
    title: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    defaultOpen?: boolean;
    headerRight?: React.ReactNode;
    id?: string;
}

export default function CollapsiblePanel({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    headerRight,
    id
}: CollapsiblePanelProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div id={id} className="border-b border-[#333] last:border-b-0">
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors group select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {isOpen ? (
                        <ChevronDown size={14} className="text-gray-500 group-hover:text-white" />
                    ) : (
                        <ChevronRight size={14} className="text-gray-500 group-hover:text-white" />
                    )}
                    {Icon && <Icon size={14} className="text-[#ccff00]" />}
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-rajdhani">
                        {title}
                    </span>
                </div>
                {headerRight && (
                    <div onClick={(e) => e.stopPropagation()}>
                        {headerRight}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="p-3 pt-0 animate-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
