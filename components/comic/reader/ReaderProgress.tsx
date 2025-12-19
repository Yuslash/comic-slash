import React from 'react';

interface ReaderProgressProps {
    totalSlides: number;
    currentSlide: number;
}

export const ReaderProgress: React.FC<ReaderProgressProps> = ({ totalSlides, currentSlide }) => {
    return (
        <div className="progress-bar z-[1000]">
            {Array.from({ length: totalSlides }).map((_, i) => (
                <div
                    key={i}
                    className={`dot ${i === currentSlide ? 'active' : ''}`}
                />
            ))}
        </div>
    );
};
