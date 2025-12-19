'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import ImageUploadModal from './ImageUploadModal';

interface EditableImageProps {
    src: string;
    alt: string;
    className?: string;
    onUpdate: (newUrl: string, fileId?: string) => void;
    folderPath?: string;
    fileName?: string;
}

export default function EditableImage({ src, alt, className, onUpdate, folderPath, fileName }: EditableImageProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={`relative group cursor-pointer ${className}`} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(true);
            }}>
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400/111/333?text=Image+Missing';
                    }}
                />

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-[#ccff00] text-black px-4 py-2 flex items-center gap-2 font-teko text-xl uppercase tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Pencil size={16} />
                        Edit
                    </div>
                </div>
            </div>

            {showModal && (
                <ImageUploadModal
                    onClose={() => setShowModal(false)}
                    onUploadConfigured={(url, fileId) => {
                        onUpdate(url, fileId);
                    }}
                    folderPath={folderPath}
                    fileName={fileName}
                />
            )}
        </>
    );
}
