"use client";
import React, {useEffect, useMemo, useRef, useState} from "react";
import type { Project } from "../../app/data/projects";

type Props = {
    project: Project & {
        gallery?: string[];
        videoUrl?: string;
        features?: string[];
    };
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
};

const CLUSTER_COLORS: Record<Project["cluster"], string> = {
    frontend: "#22d3ee",
    backend:  "#34d399",
    ai:       "#f59e0b",
    cloud:    "#60a5fa",
};

export default function ProjectModal({ project, onClose, onPrev, onNext }: Props) {
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(0);
    const [copied, setCopied] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const tiltRef = useRef<HTMLDivElement | null>(null);

    const media = useMemo(() => {
        const list: Array<{ type: "image" | "video"; src: string }> = [];
        if (project.previewImage) list.push({ type: "image", src: project.previewImage });
        return list;
    }, [project]);

    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // Close on Esc
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") setActive(a => Math.max(0, a - 1));
            if (e.key === "ArrowRight") setActive(a => Math.min(media.length - 1, a + 1));
            if (e.key.toLowerCase() === "g" && project.repoUrl) window.open(project.repoUrl, "_blank");
            if (e.key.toLowerCase() === "d" && project.demoUrl) window.open(project.demoUrl, "_blank");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [media.length, onClose, project.repoUrl, project.demoUrl]);

    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, []);

    useEffect(() => {
        const el = tiltRef.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / rect.width;
            const dy = (e.clientY - cy) / rect.height;
            el.style.transform = `rotateX(${(-dy * 6).toFixed(2)}deg) rotateY(${(dx * 6).toFixed(2)}deg)`;
        };
        const onLeave = () => { el.style.transform = "rotateX(0deg) rotateY(0deg)"; };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
    }, [active]);

    const closeIfBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const color = CLUSTER_COLORS[project.cluster] ?? "#8888ff";

    const copyShare = async () => {
        try {
            const url = typeof window !== "undefined"
                ? `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(project.id)}`
                : project.id;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {}
    };

    return (
        <div
            className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center
                  transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={closeIfBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} details`}
        >
            <div
                ref={panelRef}
                className={`relative w-[min(95vw,1000px)] max-h-[90vh] overflow-hidden rounded-2xl
                    border border-white/10 shadow-2xl
                    bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_100%)]
                    backdrop-blur-xl
                    transition-all duration-300
                    ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}`}
                style={{
                    boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)`,
                }}
            >
                {/* Color glow ring */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-[1px] rounded-2xl"
                    style={{
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 120px ${hexToRgba(color, 0.25)}`,
                    }}
                />

                {/* Header */}
                <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-white/10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                                className="h-9 w-9 rounded-xl shrink-0"
                                style={{ background: `radial-gradient(60% 60% at 50% 50%, ${hexToRgba(color,0.85)} 0%, ${hexToRgba(color,0.35)} 60%, rgba(0,0,0,0) 100%)` }}
                                aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg md:text-xl font-semibold leading-tight text-white">{project.title}</h2>
                                <p className="text-xs text-gray-300/90 mt-0.5 line-clamp-2">{project.description}</p>
                            </div>
                        </div>
                        
                        {/* Close button - positioned absolutely on mobile */}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center h-8 w-8 sm:h-[34px] sm:w-[34px] rounded-lg hover:bg-white/10 text-gray-300 hover:text-white shrink-0"
                            aria-label="Close details"
                        >
                            ✕
                        </button>
                    </div>

                                         {/* Tech chips and Actions on same line */}
                     <div className="flex items-center justify-between gap-3">
                         {/* Tech chips */}
                         {project.tech?.length > 0 && (
                             <div className="flex flex-wrap gap-1.5">
                                 {project.tech.map((t: string) => (
                                     <span
                                         key={t}
                                         className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-gray-200"
                                     >
                                         {t}
                                     </span>
                                 ))}
                             </div>
                         )}
                         
                         {/* Actions */}
                         <div className="flex items-center gap-2">
                             {project.repoUrl && (
                                 <a
                                     href={project.repoUrl}
                                     target="_blank"
                                     className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs sm:text-sm text-gray-100 inline-flex items-center justify-center"
                                 >
                                     GitHub <span className="ml-1">↗</span>
                                 </a>
                             )}
                             {project.demoUrl && (
                                 <a
                                     href={project.demoUrl}
                                     target="_blank"
                                     className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs sm:text-sm text-gray-100 inline-flex items-center justify-center"
                                 >
                                     Live <span className="ml-1">↗</span>
                                 </a>
                             )}
                             <button
                                 onClick={copyShare}
                                 className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs sm:text-sm text-gray-100"
                                 title="Copy share link"
                             >
                                 {copied ? "Copied!" : "Share"}
                             </button>
                         </div>
                     </div>
                </div>

                {/* Body */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 p-4 sm:p-5">
                    {/* Media column */}
                    <div className="relative order-2 lg:order-1">
                        {/* carousel container with tilt */}
                        <div
                            ref={tiltRef}
                            className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20 aspect-video transform-gpu transition-transform duration-150"
                        >
                            {media.length === 0 && (
                                <div className="h-full w-full grid place-items-center text-gray-400">No media</div>
                            )}

                            {media.map((m, idx) => (
                                <div
                                    key={m.type + m.src}
                                    className={`absolute inset-0 transition-opacity duration-300 ${idx === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                                    aria-hidden={idx !== active}
                                >
                                    {m.type === "image" ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={m.src}
                                            alt={project.title}
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />
                                    ) : (
                                        <video
                                            src={m.src}
                                            className="h-full w-full object-cover"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Carousel controls */}
                        {media.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActive(a => (a - 1 + media.length) % media.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/50 hover:bg-black/60 border border-white/10 text-white"
                                    aria-label="Previous media"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setActive(a => (a + 1) % media.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/50 hover:bg-black/60 border border-white/10 text-white"
                                    aria-label="Next media"
                                >
                                    →
                                </button>

                                {/* Progress dots */}
                                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                                    {media.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActive(i)}
                                            aria-label={`Go to slide ${i + 1}`}
                                            className="h-2.5 w-2.5 rounded-full border border-white/20"
                                            style={{
                                                background: i === active ? hexToRgba(color, 0.7) : "rgba(255,255,255,0.15)",
                                                boxShadow: i === active ? `0 0 0 2px ${hexToRgba(color, 0.25)}` : undefined,
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Thumb strip */}
                        {media.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                {media.map((m, i) => (
                                    <button
                                        key={m.type + m.src}
                                        onClick={() => setActive(i)}
                                        className={`relative h-14 w-20 rounded-md overflow-hidden border ${i === active ? "border-white/40" : "border-white/10"} flex-shrink-0`}
                                        title={`Slide ${i + 1}`}
                                    >
                                        {m.type === "image" ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={m.src} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full grid place-items-center text-xs text-white/80 bg-black/40">Video</div>
                                        )}
                                        {i === active && (
                                            <span
                                                className="absolute inset-0 rounded-md ring-2"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details column */}
                    <div className="flex flex-col order-1 lg:order-2">
                        {/* Feature list (optional) */}
                        <section>
                            <h3 className="text-sm font-semibold text-white/90 mb-2">About this project</h3>
                            <p className="text-sm text-gray-300/90">
                                {project.description}
                            </p>
                        </section>

                        {/* Links */}
                        <div className="mt-4 flex flex-col gap-2">
                            {project.demoUrl && (
                                <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-100 text-center"
                                >
                                    Try the Live Demo ↗
                                </a>
                            )}
                            {project.repoUrl && (
                                <a
                                    href={project.repoUrl}
                                    target="_blank"
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-100 text-center"
                                >
                                    View on GitHub ↗
                                </a>
                            )}
                            <button
                                onClick={copyShare}
                                className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-100"
                                title="Copy share link"
                            >
                                {copied ? "Link copied!" : "Share Link"}
                            </button>
                        </div>

                        {/* Keyboard hints - hidden on mobile */}
                        <div className="mt-auto pt-5 text-[11px] text-gray-400/90 hidden sm:block">
                            <span className="inline-block mr-3">Esc: Close</span>
                            {media.length > 1 && <span className="inline-block mr-3">←/→: Media</span>}
                            {project.demoUrl && <span className="inline-block mr-3">D: Demo</span>}
                            {project.repoUrl && <span className="inline-block mr-3">G: GitHub</span>}
                        </div>

                        {/* Prev/Next (optional, if provided) */}
                        {(onPrev || onNext) && (
                            <div className="mt-4 flex justify-between gap-2">
                                <button
                                    onClick={onPrev}
                                    disabled={!onPrev}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-200 disabled:opacity-40"
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={onNext}
                                    disabled={!onNext}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-200 disabled:opacity-40"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* utils */
function hexToRgba(hex: string, a = 1) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r},${g},${b},${a})`;
}
