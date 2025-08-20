"use client";

import { useEffect, useState } from 'react';

interface MobileAccessButtonProps {
    setShowHelp: (show: boolean) => void;
}

export function MobileAccessButton({ setShowHelp }: MobileAccessButtonProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Animate in the button after a short delay
        const timer = setTimeout(() => setIsVisible(true), 600);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timer);
        };
    }, []);

    if (!isMobile) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 right-4 z-40 transform transition-all duration-500 ease-out ${
            isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-75'
        }`}>
            <button
                onClick={() => {
                    setShowHelp(true);
                    setTimeout(() => setShowHelp(false), 5000);
                }}
                className="w-12 h-12 rounded-full bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center text-purple-100 transition-all duration-200 hover:scale-110 shadow-lg"
                title="Access secret features"
            >
                <span className="text-lg">🔍</span>
            </button>
        </div>
    );
}
