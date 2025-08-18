"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    photo?: string;
    bio?: string;
    highlights?: { label: string; value: string }[];
    timeline?: { year: string; title: string; text: string }[];
    onDownloadCV?: () => void;
    onContact?: () => void;
}

export default function AboutModal({
    isOpen,
    onClose,
    photo = "/portrait.jpg",
    bio = "",
    highlights = [],
    timeline = [],
    onDownloadCV,
    onContact,
}: AboutModalProps) {
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
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-[min(95vw,1000px)] h-[min(90vh,800px)] md:h-auto md:max-h-[86vh] overflow-hidden rounded-2xl
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
                            <h2 className="text-lg md:text-xl font-semibold leading-tight text-white">About Me</h2>
                            <p className="text-xs text-gray-300/90 mt-0.5 line-clamp-2 max-w-[70%]">A quick snapshot</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5 p-4 sm:p-5 overflow-y-auto h-full">
                        {/* Bio (3 cols) */}
                        <div className="md:col-span-3">
                            <div className="flex gap-4 items-start">
                                <img
                                    src={photo}
                                    alt="Portrait"
                                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-200/90 leading-relaxed">{bio}</p>
                                </div>
                            </div>

                            {/* Tags / strengths */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {["TypeScript", "React / Next.js", "Java / Kotlin", "Python", "ML/AI", "Cloud"].map(
                                    (tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs rounded-full px-2.5 py-1 bg-white/5 text-gray-200 border border-white/10"
                                        >
                                            {tag}
                                        </span>
                                    ),
                                )}
                            </div>

                            {/* Highlights */}
                            {highlights.length > 0 && (
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    {highlights.map((h) => (
                                        <div key={h.label} className="text-center p-3 rounded-lg bg-white/5">
                                            <div className="text-lg font-semibold text-white">{h.value}</div>
                                            <div className="text-xs text-gray-400 mt-1">{h.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Timeline takes full width and scrolls */}
                        <div className="md:col-span-5 border-t border-white/10 pt-4 flex flex-col min-h-0">
                            <div className="text-xs text-gray-400 mb-3">Timeline</div>

                            <div className="relative flex-1 min-h-0">
                                <ul className="space-y-3 overflow-y-auto pr-2 h-full
                                    scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    {timeline.map((t) => (
                                        <li key={`${t.year}-${t.title}`} className="grid grid-cols-[32px,1fr] gap-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-gray-500 font-mono">{t.year}</span>
                                                <div className="w-2 h-2 rounded-full bg-purple-400/60 mt-1" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{t.title}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{t.text}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* footer badges */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-2">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs rounded-full px-2.5 py-1 bg-green-400/10 text-green-300 border border-green-400/20">
                                Available for work
                            </span>
                            <span className="text-xs rounded-full px-2.5 py-1 bg-blue-400/10 text-blue-300 border border-blue-400/20">
                                Remote friendly
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
