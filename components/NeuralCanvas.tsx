"use client";

import React, {useEffect, useRef, useState} from "react";
import {Cluster} from "./canvas/step/env";
import {useRouter} from "next/navigation";
import type {ContactLink} from "../app/data/contact";
import {Project, skills} from "../app/data/projects";
import AboutPanel from "./AboutPanel";
import {runStep} from "./canvas/step/runStep";
import type {StepEnv} from "./canvas/step/env";
import { generateBackgroundStarfield, drawBackgroundStarfield, BackgroundStar } from "./StarField";
import {roundRectPath} from "./canvas/step/drawHelpers";

const CALM = {
    hubAttract: 0.005,
    hubJiggle: 1.5,
    damping: 0.8,
    orbitOmegaMin: 0.1,
    orbitOmegaMax: 0.1,
    orbitWobbleAmp: 4,
    orbitWobbleFreq: 2,
    anchorWobbleAmp: 1.2,
    anchorWobbleFreq: 2,
    edgeBaseAlpha: 0.2,
    edgePulseAmp: 0.005,
    edgePulseFreq: 1,
    zoomScale: 1.7,
    zoomDuration: 1000,
    unzoomDuration: 600,
};

type Node = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    clusterId: string;
    isHub?: boolean;
    pulse?: number;
    // continuous orbit params for satellites
    theta?: number; // current angle (rad)
    baseR?: number; // base orbit radius
    omega?: number; // angular velocity (rad/s)
    phase?: number; // radial “breathing” phase
};

type Edge = {
    a: number;
    b: number;
    clusterId: string;
    cross?: boolean;
};

const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export default function NeuralCanvas({
                                         clusters,
                                         projects,
                                         onProjectSelect,
                                         aboutFacts,
                                         funFacts,
                                         contactLinks,
                                         onOpenContactModal,
                                         aboutBio,
                                         aboutPhotoUrl,
                                         aboutHighlights,
                                         aboutTimeline,
                                         aboutCVUrl,
                                     }: {
    clusters: Cluster[];
    projects: Project[];
    onProjectSelect: (payload: any) => void;
    aboutFacts: string[];
    funFacts: string[];
    contactLinks: ContactLink[];
    onOpenContactModal: () => void;
    aboutBio?: string;
    aboutPhotoUrl?: string;
    aboutHighlights?: { label: string; value: string }[];
    aboutTimeline?: { year: string; title: string; text: string }[];
    aboutCVUrl?: string;
}) {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [size, setSize] = useState({w: 1200, h: 800});
    const [hoverId, setHoverId] = useState<number | null>(null);
    const [hoverCluster, setHoverCluster] = useState<Cluster["id"] | null>(null);
    const [transform, setTransform] = useState({sx: 1, sy: 1, tx: 0, ty: 0});
    const [zooming, setZooming] = useState(false);
    const [expandedCluster, setExpandedCluster] = useState<Cluster["id"] | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const timeRef = useRef(0);
    const visited = useRef<Set<string>>(new Set()); // clicked projects

    const SHOOTING_COUNT = 25;
    const shootingRef = useRef<{
        x: number; y: number; vx: number; vy: number;
        r: number; hue: number; life: number; maxLife: number;
    }[]>([]);

    const starfieldRef = useRef<BackgroundStar[]>([]);

    const graph = useRef<{ nodes: Node[]; edges: Edge[] }>({nodes: [], edges: []});
    const anchors = useRef<Record<string, { x: number; y: number }>>({});
    const projectHit = useRef<{ id: string; x: number; y: number; r: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const resize = () => {
            const w = window.innerWidth;
            const cs = getComputedStyle(document.documentElement);
            const safeTop = parseFloat(cs.getPropertyValue("--safe-top")) || 0;
            const safeBottom = parseFloat(cs.getPropertyValue("--safe-bottom")) || 0;
            const h = Math.max(0, window.innerHeight - safeTop - safeBottom);

            setSize({w, h});
            canvas.width = Math.floor(w * DPR);
            canvas.height = Math.floor(h * DPR);
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            canvas.style.top = `${safeTop}px`;
            canvas.style.bottom = `${safeBottom}px`;
            starfieldRef.current = generateBackgroundStarfield(w, h);
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    // ESC to collapse
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                animateCollapse();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transform, expandedCluster]);

    // initial graph
    useEffect(() => {
        const w = size.w;
        const h = size.h;

        const anchorPositions = [
            {id: "frontend", x: w * 0.22, y: h * 0.35},
            {id: "backend", x: w * 0.78, y: h * 0.35},
            {id: "ai", x: w * 0.30, y: h * 0.70},
            {id: "cloud", x: w * 0.70, y: h * 0.70},
            {id: "about", x: w * 0.50, y: h * 0.3},  // center
            {id: "contact", x: w * 0.50, y: h * 0.60},  // below about
        ];
        anchors.current = anchorPositions.reduce(
            (acc, a) => ((acc[a.id] = {x: a.x, y: a.y}), acc),
            {} as Record<string, { x: number; y: number }>
        );

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let nid = 0;

        for (const {id} of clusters) {
            // hub
            nodes.push({
                id: nid++,
                x: (anchors.current[id]?.x ?? w * 0.5) + rand(-10, 10),
                y: (anchors.current[id]?.y ?? h * 0.5) + rand(-10, 10),
                vx: 0,
                vy: 0,
                r: 25,
                clusterId: id,
                isHub: true,
            });
            // satellites
            const satellites = 12;
            for (let i = 0; i < satellites; i++) {
                const baseR = rand(70, 140);
                const theta = rand(0, Math.PI * 2);
                const omega = rand(CALM.orbitOmegaMin, CALM.orbitOmegaMax) * (Math.random() < 0.5 ? -1 : 1);
                const phase = rand(0, Math.PI * 2);

                nodes.push({
                    id: nid++,
                    x: (anchors.current[id]?.x ?? w * 0.5) + Math.cos(theta) * baseR,
                    y: (anchors.current[id]?.y ?? h * 0.5) + Math.sin(theta) * baseR,
                    vx: 0,
                    vy: 0,
                    r: rand(1, 8),
                    clusterId: id,
                    isHub: false,
                    theta,
                    baseR,
                    omega,
                    phase,
                });
            }
        }

        // intra-cluster edges
        const clusterNodes = (cid: string) => nodes.filter((n) => n.clusterId === cid);
        for (const c of clusters) {
            const list = clusterNodes(c.id);
            for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                    const a = list[i],
                        b = list[j];
                    const dx = a.x - b.x,
                        dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 140 * 140 && Math.random() < 0.08) edges.push({a: a.id, b: b.id, clusterId: c.id});
                }
            }
        }

        // sparse cross edges
        const ids = clusters.map((c) => c.id);
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const A = clusterNodes(ids[i]).filter((n) => !n.isHub);
                const B = clusterNodes(ids[j]).filter((n) => !n.isHub);
                for (let k = 0; k < 5; k++) {
                    const a = A[Math.floor(Math.random() * A.length)];
                    const b = B[Math.floor(Math.random() * B.length)];
                    if (a && b) edges.push({a: a.id, b: b.id, clusterId: "cross", cross: true});
                }
            }
        }

        graph.current = {nodes, edges};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size.w, size.h, JSON.stringify(clusters)]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        let raf = 0;
        let last = performance.now();

        // your original helper (unchanged)
        const attract = (node: any, target: { x: number; y: number }, strength: number) => {
            const dx = target.x - node.x;
            const dy = target.y - node.y;
            node.vx += dx * strength;
            node.vy += dy * strength;
        };

        // build env once per effect run
        const env: StepEnv = {
            timeRef, prefersReducedMotion,
            ctx, canvas, DPR, size,
            graph, anchors,
            transform, expandedCluster, hoverId, hoverCluster,
            CALM,
            SHOOTING_COUNT, shootingRef,
            clusters,
            skills: (skills as any),
            projects,
            contactLinks,
            visited,
            projectHit,
            attract,
            roundedRectPath: roundRectPath,
            drawPillLabelAlpha,
            aboutFacts: aboutFacts ?? [],
            funFacts: funFacts ?? [],
        };

        const step = (t: number) => {
            last = runStep(env, t, last);
            raf = requestAnimationFrame(step);
            drawBackgroundStarfield(ctx, starfieldRef.current, timeRef.current);
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [size.w, size.h, transform, hoverId, hoverCluster, clusters, projects, expandedCluster, aboutFacts, funFacts, contactLinks, size]);

    // pointer interactions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const {nodes} = graph.current;

        const invert = (x: number, y: number) => {
            const ix = (x - transform.tx) / transform.sx;
            const iy = (y - transform.ty) / transform.sy;
            return {x: ix, y: iy};
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const p = invert(e.clientX - rect.left, e.clientY - rect.top);
            let best: { id: number; d2: number } | null = null;
            for (const n of nodes) {
                const dx = p.x - n.x,
                    dy = p.y - n.y,
                    r = n.r + (n.isHub ? 16 : 6);
                const d2 = dx * dx + dy * dy;
                if (d2 <= r * r) best = !best || d2 < best.d2 ? {id: n.id, d2} : best;
            }
            setHoverId(best ? best.id : null);
            setHoverCluster(best ? (nodes[best.id].clusterId as Cluster["id"]) : null);

            // look for project/contact hit
            let onSatellite = false;
            let tip: { x: number; y: number; text: string } | null = null;

            if (expandedCluster) {
                for (const s of projectHit.current) {
                    const dx = p.x - s.x,
                        dy = p.y - s.y;
                    if (dx * dx + dy * dy < s.r * s.r) {
                        onSatellite = true;
                        if (s.id.startsWith("contact:")) {
                            tip = {
                                x: e.clientX + 10,
                                y: e.clientY - 16,
                                text: s.id === "contact:message" ? "Send a message" : s.id.split(":")[1],
                            };
                        } else {
                            const proj = projects.find((pp) => pp.id === s.id);
                            if (proj) tip = {x: e.clientX + 10, y: e.clientY - 16, text: proj.title};
                        }
                        break;
                    }
                }
            }
            setTooltip(tip);
            canvas.style.cursor = onSatellite || (best && nodes[best.id].isHub) ? "pointer" : "default";
        };

        const onLeave = () => {
            setHoverId(null);
            setHoverCluster(null);
            setTooltip(null);
            canvas.style.cursor = "default";
        };

        const onClick = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const p = invert(e.clientX - rect.left, e.clientY - rect.top);

            // Expanded: handle satellites or collapse
            if (expandedCluster) {
                // satellites first
                for (const s of projectHit.current) {
                    const dx = p.x - s.x,
                        dy = p.y - s.y;
                    // inside pointer onClick, when project satellite is hit:
                    if (dx * dx + dy * dy < s.r * s.r) {
                        // compute screen coords of the satellite center
                        const rect = canvas.getBoundingClientRect();
                        // world → screen: apply transform (sx, sy, tx, ty), then add canvas' top-left
                        const sx = s.x * transform.sx + transform.tx + rect.left;
                        const sy = s.y * transform.sy + transform.ty + rect.top;

                        // get cluster color for splash
                        const c = clusters.find(c => c.id === expandedCluster)!.color;

                        // NEW: pass an object (backwards-compatible parent handler accepts string or object)
                        if (s.id.startsWith("contact:")) {
                            if (s.id === "contact:message") onOpenContactModal();
                            else {
                                const key = s.id.split(":")[1];
                                const link = contactLinks.find(l => l.id === (key as any));
                                if (link) window.open(link.href, "_blank");
                            }
                        } else {
                            onProjectSelect({id: s.id, x: sx, y: sy, color: c} as any);
                            visited.current.add(s.id);
                        }
                        // mark visited as before (if you use that)
                        visited.current.add(s.id);
                        return;
                    }
                }

                // hub click? stay zoomed
                if (hoverId !== null) {
                    const n = nodes[hoverId];
                    if (n.isHub && (n.clusterId as any) === expandedCluster) return;
                }

                // clicked outside → collapse with animation
                animateCollapse();
                return;
            }

            // Zoomed out: hub expand
            if (hoverId === null) return;
            const n = nodes[hoverId];
            if (!n.isHub) return;

            // expand hub + zoom
            n.pulse = 0.01;
            const target = anchors.current[n.clusterId];
            const cx = target?.x ?? size.w / 2;
            const cy = target?.y ?? size.h / 2;
            const desiredScale = CALM.zoomScale;
            const duration = prefersReducedMotion ? 250 : CALM.zoomDuration;

            const start = performance.now();
            const startTransform = {...transform};
            setZooming(true);
            setExpandedCluster(n.clusterId as Cluster["id"]);

            const tick = (now: number) => {
                const tt = Math.min(1, (now - start) / duration);
                const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
                const ease = easeInOut(tt);
                const sx = startTransform.sx + (desiredScale - startTransform.sx) * ease;
                const sy = startTransform.sy + (desiredScale - startTransform.sy) * ease;
                const tx = startTransform.tx + ((size.w / 2 - cx * sx) - startTransform.tx) * ease;
                const ty = startTransform.ty + ((size.h / 2 - cy * sy) - startTransform.ty) * ease;
                setTransform({sx, sy, tx, ty});
                if (tt < 1) requestAnimationFrame(tick);
                else setZooming(false);
            };
            requestAnimationFrame(tick);
        };

        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);
        canvas.addEventListener("click", onClick);
        return () => {
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerleave", onLeave);
            canvas.removeEventListener("click", onClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoverId, transform, zooming, router, expandedCluster, onProjectSelect, contactLinks]);

    // helper: animated collapse to default transform
    const animateCollapse = () => {
        if (!expandedCluster) return;
        const start = performance.now();
        const startTransform = {...transform};
        const target = {sx: 1, sy: 1, tx: 0, ty: 0};
        const duration = prefersReducedMotion ? 200 : CALM.unzoomDuration;

        setZooming(true);
        const tick = (now: number) => {
            const tt = Math.min(1, (now - start) / duration);
            const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
            const ease = easeInOut(tt);

            const sx = startTransform.sx + (target.sx - startTransform.sx) * ease;
            const sy = startTransform.sy + (target.sy - startTransform.sy) * ease;
            const tx = startTransform.tx + (target.tx - startTransform.tx) * ease;
            const ty = startTransform.ty + (target.ty - startTransform.ty) * ease;

            setTransform({sx, sy, tx, ty});

            if (tt < 1) requestAnimationFrame(tick);
            else {
                setZooming(false);
                setExpandedCluster(null);
                onProjectSelect(null as any);
            }
        };
        requestAnimationFrame(tick);
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed left-0 right-0 z-0"
                style={{top: "var(--safe-top, 88px)", bottom: "var(--safe-bottom, 72px)"}}
                aria-label="Interactive neural network map of skills and projects"
                role="img"
            />
            {/* simple tooltip */}
            {tooltip && (
                <div
                    className="fixed z-30 text-xs rounded-lg px-2 py-1 bg-white/10 backdrop-blur text-gray-100 pointer-events-none"
                    style={{left: tooltip.x, top: tooltip.y}}
                >
                    {tooltip.text}
                </div>
            )}
            {/* Optional: keep a back button (clicking outside also collapses) */}
            {expandedCluster && (
                <button
                    onClick={animateCollapse}
                    className="fixed top-[calc(var(--safe-top,88px)+12px)] left-8 z-30 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-200 backdrop-blur"
                >
                    ← Back
                </button>
            )}
            {/* ABOUT PANEL (appears when About cluster is expanded) */}
            {expandedCluster === "about" && (
                <div className="fixed z-40 right-6 top-[calc(var(--safe-top,20px)+16px)] bottom-[calc(var(--safe-bottom,20px)+16px)] pointer-events-auto max-h-[calc(100vh-var(--safe-top,88px)-var(--safe-bottom,72px)-32px)] flex"
                ><AboutPanel
                    photo={aboutPhotoUrl ?? "/portrait.jpg"}
                    bio={aboutBio ?? ""}
                    highlights={aboutHighlights ?? []}
                    timeline={aboutTimeline ?? []}
                    onDownloadCV={() => aboutCVUrl && window.open(aboutCVUrl, "_blank")}
                    onContact={onOpenContactModal}
                />
                </div>
            )}

        </>
    );
}

function drawPillLabelAlpha(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    maxWidth = 240,
    alpha = 1,
    pad = 8
) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "13px Inter, ui-sans-serif, system-ui, sans-serif";

    const clipped = clipText(ctx, text, maxWidth - pad * 2);
    const w = Math.min(ctx.measureText(clipped).width + pad * 2, maxWidth);
    const h = 24;
    const rx = 10;
    const left = x - w / 2;
    const top = y - h - 14;

    // pill bg
    ctx.beginPath();
    roundRectPath(ctx, left, top, w, h, rx);
    ctx.fillStyle = "rgba(16,18,28,0.45)"; // glassy
    ctx.fill();

    // text
    ctx.fillStyle = "rgba(235,240,255,0.92)";
    ctx.fillText(clipped, left + pad, top + h - 7);
    ctx.restore();
}

function clipText(ctx: CanvasRenderingContext2D, text: string, max: number) {
    if (ctx.measureText(text).width <= max) return text;
    // quick ellipsis clip
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
    return t + "…";
}

