import React, { useEffect, useRef, useState } from "react";

export default function AboutPanel({
                                       photo,
                                       bio,
                                       highlights,
                                       timeline,
                                       onDownloadCV,
                                       onContact,
                                   }: {
    photo: string;
    bio: string;
    highlights: { label: string; value: string }[];
    timeline: { year: string; title: string; text: string }[];
    onDownloadCV: () => void;
    onContact: () => void;
}) {
    const listRef = useRef<HTMLUListElement | null>(null);
    const [showArrow, setShowArrow] = useState(true);

    const updateArrow = () => {
        const el = listRef.current;
        if (!el) return;
        const canScroll = el.scrollHeight > el.clientHeight + 2;
        const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
        setShowArrow(canScroll && !atEnd);
    };

    useEffect(() => {
        updateArrow();
        const el = listRef.current;
        if (!el) return;
        const onScroll = () => updateArrow();
        el.addEventListener("scroll", onScroll, { passive: true });
        // also update on resize, since heights can change
        const ro = new ResizeObserver(updateArrow);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
        };
    }, []);

    return (
        <div className="group relative w-[min(560px,95vw)] max-h-[85vh]">
            {/* glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/20 to-amber-400/20 blur opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* panel */}
            <div className="relative h-full rounded-3xl bg-[rgba(18,20,30,0.6)] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col min-h-0">
            {/* header */}
                <div className="flex items-center gap-4 p-5 border-b border-white/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={photo}
                        alt="Portrait"
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-50 leading-tight">About Me</h3>
                        <p className="text-xs text-gray-400">A quick snapshot</p>
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
                            className="px-3 py-1.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 text-xs text-cyan-100"
                        >
                            Contact
                        </button>
                    </div>
                </div>

                {/* body (non-scrollable except the timeline) */}
                <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-5 gap-5 overflow-hidden min-h-0">
                    {/* Bio (3 cols) */}
                    <div className="md:col-span-3">
                        <p className="text-sm text-gray-200 leading-relaxed">{bio}</p>

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
                    </div>

                    {/* Compact stat cards (2 cols) */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-3">
                        {highlights.map((h) => (
                            <div key={h.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-400">{h.label}</div>
                                <div className="text-sm font-medium text-gray-100 mt-1">{h.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline takes full width and scrolls */}
                    <div className="md:col-span-5 border-t border-white/10 pt-4 flex flex-col min-h-0">
                        <div className="text-xs text-gray-400 mb-3">Timeline</div>

                        <div className="relative flex-1 min-h-0">
                            <ul
                                ref={listRef}
                                className="space-y-3 overflow-y-auto pr-2 h-full
                 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                            >
                                {timeline.map((t) => (
                                    <li key={`${t.year}-${t.title}`} className="grid grid-cols-[32px,1fr] gap-3">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-gray-400">{t.year}</span>
                                            <span className="w-px flex-1 bg-white/10" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm text-gray-100 font-medium">{t.title}</div>
                                            <div className="text-xs text-gray-400">{t.text}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {showArrow && (
                                <>
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[rgba(18,20,30,0.85)] to-transparent" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
                                        <svg className="h-5 w-5 animate-bounce text-gray-300/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* footer badges */}
                <div className="px-5 pb-5 -mt-2">
                    <div className="flex flex-wrap gap-2">
                        {["Performance-minded", "Accessibility", "Design systems", "DX / Tooling", "Testing"].map(
                            (b) => (
                                <span
                                    key={b}
                                    className="text-[11px] px-2 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10"
                                >
                  {b}
                </span>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
