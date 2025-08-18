"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AboutTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    timeline?: { year: string; title: string; text: string }[];
    onDownloadCV?: () => void;
    onContact?: () => void;
}

export default function AboutTimelineModal({
    isOpen,
    onClose,
    timeline = [],
    onDownloadCV,
    onContact,
}: AboutTimelineModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // ESC to close
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e: React.MouseEvent) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-[min(95vw,800px)] h-[min(90vh,600px)] overflow-hidden rounded-2xl
                        border border-white/10 shadow-2xl
                        bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_100%)]
                        backdrop-blur-xl"
                    style={{
                        boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)`,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-white/10">
                        <div
                            className="h-9 w-9 rounded-xl shrink-0"
                            style={{ background: `radial-gradient(60% 60% at 50% 50%, rgba(167,139,250,0.85) 0%, rgba(167,139,250,0.35) 60%, rgba(0,0,0,0) 100%)` }}
                            aria-hidden
                        />
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-semibold leading-tight text-white">Timeline</h2>
                            <p className="text-xs text-gray-300/90 mt-0.5 line-clamp-2 max-w-[70%]">My journey</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={onDownloadCV}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-gray-100"
                            >
                                Download CV
                            </button>
                            <button
                                onClick={onContact}
                                className="px-3 py-1.5 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 text-xs text-purple-100"
                            >
                                Contact
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 overflow-y-auto h-full">
                        <div className="space-y-4">
                            {timeline.map((t) => (
                                <div key={`${t.year}-${t.title}`} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm text-gray-400 font-mono bg-white/5 px-2 py-1 rounded">
                                            {t.year}
                                        </span>
                                        <div className="w-3 h-3 rounded-full bg-purple-400/60 mt-2" />
                                    </div>
                                    <div className="flex-1 pb-4 border-l border-white/10 pl-4">
                                        <div className="text-sm font-medium text-white mb-1">{t.title}</div>
                                        <div className="text-xs text-gray-400">{t.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
