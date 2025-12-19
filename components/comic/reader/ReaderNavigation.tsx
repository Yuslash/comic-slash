import React from 'react';

interface ReaderNavigationProps {
    onPrev: () => void;
    onNext: () => void;
}

export const ReaderNavigation: React.FC<ReaderNavigationProps> = ({ onPrev, onNext }) => {
    return (
        <>
            {/* Desktop Navigation Buttons */}
            <button className="nav-btn nav-prev hidden md:block z-[900]" onClick={onPrev}>
                <span className="nav-icon">&lt;</span>
            </button>
            <button className="nav-btn nav-next hidden md:block z-[900]" onClick={onNext}>
                <span className="nav-icon">&gt;</span>
            </button>

            {/* Mobile Navigation Overlay */}
            <div className="absolute inset-0 z-[800] flex md:hidden pointer-events-none">
                <div className="w-1/4 h-full pointer-events-auto" onClick={onPrev}></div>
                <div className="w-1/2 h-full"></div>{/* Dead zone in center for interacting with comic? */}
                <div className="w-1/4 h-full pointer-events-auto" onClick={onNext}></div>
            </div>
        </>
    );
};
