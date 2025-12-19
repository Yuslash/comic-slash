'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageKit from "imagekit-javascript";
import { getUploadAuth } from '@/lib/api/upload';
import { Upload, X } from 'lucide-react';

interface ImageUploadModalProps {
    onClose: () => void;
    onUploadConfigured: (url: string, fileId?: string) => void;
    folderPath?: string;
    fileName?: string;
}

export default function ImageUploadModal({ onClose, onUploadConfigured, folderPath, fileName }: ImageUploadModalProps) {
    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Uploading Protocol...');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const xhrRef = useRef<XMLHttpRequest | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput) {
            onUploadConfigured(urlInput);
            onClose();
        }
    };

    const handleCancel = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
            xhrRef.current = null;
        }
        setUploading(false);
        setProgress(0);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setStatusMessage("Initializing...");

        try {
            // Get Auth Params
            const authParams = await getUploadAuth();

            // Use XHR for Progress Tracking
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', fileName || file.name);
            formData.append('publicKey', "public_u0Sgdl+OSA4JQ/9klNkFLiPalGA=");
            formData.append('signature', authParams.signature);
            formData.append('expire', authParams.expire);
            formData.append('token', authParams.token);
            formData.append('useUniqueFileName', 'true'); // Changed to true to prevent browser caching issues
            formData.append('tags', 'comic-studio');
            if (folderPath) {
                formData.append('folder', folderPath);
            }

            const xhr = new XMLHttpRequest();
            xhrRef.current = xhr;

            xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setProgress(percentComplete);
                    setStatusMessage("Uploading Protocol...");
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    if (result && result.url) {
                        onUploadConfigured(result.url, result.fileId);
                        onClose();
                    }
                } else {
                    console.error('Upload error:', xhr.responseText);
                    if (xhr.status !== 0) {
                        alert('Upload failed: ' + xhr.statusText);
                    }
                }
                setUploading(false);
                xhrRef.current = null;
            };

            xhr.onerror = () => {
                console.error('Upload failed');
                alert('Upload failed network error');
                setUploading(false);
                xhrRef.current = null;
            };

            xhr.onabort = () => {
                console.log('Upload aborted');
                setUploading(false);
                setProgress(0);
            };

            xhr.send(formData);

        } catch (err) {
            console.error(err);
            alert("Upload failed to initialize");
            setUploading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div
                className="bg-[#111] border border-white/20 p-6 w-full max-w-md relative font-rajdhani text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <h2 className="text-3xl font-teko uppercase mb-6 text-[#ccff00]">Select Image</h2>

                <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setMode('upload')}
                        className={`flex-1 py-2 text-center uppercase tracking-wider transition-colors ${mode === 'upload' ? 'bg-white/10 text-white border-b-2 border-[#ccff00]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Upload Device
                    </button>
                    <button
                        onClick={() => setMode('url')}
                        className={`flex-1 py-2 text-center uppercase tracking-wider transition-colors ${mode === 'url' ? 'bg-white/10 text-white border-b-2 border-[#ccff00]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Paste URL
                    </button>
                </div>

                {mode === 'upload' ? (
                    <div className={`text-center py-8 border-2 border-dashed transition-colors relative ${uploading ? 'border-[#ccff00] bg-[#ccff00]/5' : 'border-white/20 hover:border-[#ccff00] cursor-pointer'}`} onClick={() => !uploading && fileInputRef.current?.click()}>
                        {uploading ? (
                            <div className="flex flex-col items-center gap-4 w-full max-w-[200px] mx-auto">
                                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#ccff00] transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="text-[#ccff00] font-teko text-xl tracking-widest">{Math.round(progress)}%</div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider animate-pulse text-center">
                                    {statusMessage}<br />
                                    <span className="text-red-500 font-bold">DO NOT REFRESH</span>
                                </p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/80 border border-red-500/30 text-red-200 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-white">
                                <Upload size={32} />
                                <p className="uppercase tracking-widest text-sm">Click to Browse</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="w-full bg-black border border-white/20 p-3 text-white focus:border-[#ccff00] outline-none"
                            placeholder="https://example.com/image.jpg"
                            autoFocus
                        />
                        <button type="submit" className="bg-[#ccff00] text-black font-teko text-xl py-2 hover:bg-white transition-colors uppercase">
                            Use Image
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
