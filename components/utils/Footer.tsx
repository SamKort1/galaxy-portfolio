"use client";

import { useEffect, useState } from 'react';

export default function Footer() {
    const [isMobile, setIsMobile] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Use a more conservative breakpoint for mobile devices
            setIsMobile(window.innerWidth <= 932);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Animate in the button after a short delay
        const timer = setTimeout(() => setIsVisible(true), 500);

        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timer);
        };
    }, []);

    const handleMenuToggle = () => {
        if (!showMenu) {
            setShowMenu(true);
            // Delay to ensure menu is rendered before animating
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setShowMenu(false), 300);
        }
    };

    // Mobile bubble version with custom menu
    if (isMobile) {
        return (
            <>
                {/* Custom Menu Overlay */}
                {(showMenu || isAnimating) && (
                    <div
                        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'
                            }`}
                        onClick={handleMenuToggle}
                    >
                        {/* Email Bubble */}
                        <div
                            className={`fixed bottom-20 left-4 w-12 h-12 bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/30 backdrop-blur-sm rounded-full shadow-lg transform transition-all duration-300 ease-out z-60 ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-75'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                // Open contact modal
                                try {
                                    window.dispatchEvent(new CustomEvent('openContactModal'));
                                } catch {
                                    // Fallback to global function
                                    const openContactModal = (window as Window & { openContactModal?: () => void }).openContactModal;
                                    if (openContactModal) {
                                        openContactModal();
                                    }
                                }
                                // Close the menu
                                handleMenuToggle();
                            }}
                            onTouchEnd={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                // Open contact modal
                                try {
                                    window.dispatchEvent(new CustomEvent('openContactModal'));
                                } catch {
                                    // Fallback to global function
                                    const openContactModal = (window as Window & { openContactModal?: () => void }).openContactModal;
                                    if (openContactModal) {
                                        openContactModal();
                                    }
                                }
                                // Close the menu
                                handleMenuToggle();
                            }}
                            style={{ transitionDelay: isAnimating ? '0ms' : '0ms' }}
                        >
                            <div className="w-full h-full flex items-center justify-center text-cyan-100 hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                            </div>
                        </div>

                        {/* GitHub Bubble */}
                        <div
                            className={`fixed bottom-36 left-4 w-12 h-12 bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/30 backdrop-blur-sm rounded-full shadow-lg transform transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-75'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open('https://github.com/SamKort1', '_blank');
                                handleMenuToggle();
                            }}
                            style={{ transitionDelay: isAnimating ? '100ms' : '0ms' }}
                        >
                            <div className="w-full h-full flex items-center justify-center text-purple-100 hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </div>
                        </div>

                        {/* LinkedIn Bubble */}
                        <div
                            className={`fixed bottom-52 left-4 w-12 h-12 bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/30 backdrop-blur-sm rounded-full shadow-lg transform transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-75'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open('https://www.linkedin.com/in/sam-kort-603547195', '_blank');
                                handleMenuToggle();
                            }}
                            style={{ transitionDelay: isAnimating ? '200ms' : '0ms' }}
                        >
                            <div className="w-full h-full flex items-center justify-center text-blue-100 hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Bubble Button */}
                <div className={`fixed bottom-4 left-4 z-40 transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-75'
                    }`}>
                    <button
                        onClick={handleMenuToggle}
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm flex items-center justify-center text-gray-300 transition-all duration-200 hover:scale-110 shadow-lg"
                        title="Open contact menu"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                        </svg>
                    </button>
                </div>
            </>
        );
    }

    // Desktop full footer version
    return (
        <footer className="fixed bottom-0 inset-x-0 z-20">
            <div className="mx-auto max-w-6xl px-4 pb-4">
                <div className="glass rounded-2xl px-6 py-3 text-xs text-gray-300 flex items-center justify-between backdrop-blur-sm border border-white/10 shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">© {new Date().getFullYear()}</span>
                        <span className="font-medium text-white">Sam Kort</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">Full Stack Developer</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
                            className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            <span>Email</span>
                        </button>
                        <a
                            href="https://github.com/SamKort1"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span>GitHub</span>
                        </a>
                        <a
                            href="www.linkedin.com/in/sam-kort-603547195"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 group"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            <span>LinkedIn</span>
                        </a>

                        <div className="w-px h-4 bg-gray-600"></div>

                        <div
                            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors duration-300 cursor-help group"
                            title="Type 'help' anywhere to discover secret features and easter eggs!"
                            onClick={() => {
                                console.log('Footer "Discover secrets" clicked');
                                // Try both approaches - custom event and direct dispatch
                                window.dispatchEvent(new CustomEvent('showHelpModal'));
                                // Also try dispatching a keyboard event as fallback
                                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
                            }}
                        >
                            <span className="group-hover:animate-pulse">🔍</span>
                            <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity duration-200">
                                Discover secrets
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
