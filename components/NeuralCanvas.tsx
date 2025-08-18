"use client";

import React, {useEffect, useRef, useState} from "react";
import {Cluster} from "./canvas/step/env";
import {useRouter} from "next/navigation";
import type {ContactLink} from "../app/data/contact";
import {Project, skills} from "../app/data/projects";

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

// Secret theme configurations
const SECRET_THEMES = {
    matrix: {
        name: "Matrix",
        colors: {
            frontend: "#00ff00",
            backend: "#00cc00", 
            ai: "#00aa00",
            cloud: "#008800",
            about: "#00ff00",
            contact: "#00cc00"
        },
        background: "radial-gradient(1200px 800px at 30% 20%, rgba(0,255,0,0.1), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(0,255,0,0.1), transparent 60%), #001100"
    },
    cyberpunk: {
        name: "Cyberpunk",
        colors: {
            frontend: "#ff00ff",
            backend: "#00ffff",
            ai: "#ffff00", 
            cloud: "#ff0080",
            about: "#00ffff",
            contact: "#ff00ff"
        },
        background: "radial-gradient(1200px 800px at 30% 20%, rgba(255,0,255,0.15), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(0,255,255,0.15), transparent 60%), #1a0033"
    },
    retro: {
        name: "Retro",
        colors: {
            frontend: "#ff6b35",
            backend: "#f7931e",
            ai: "#ffd23f",
            cloud: "#5390d9", 
            about: "#ff6b35",
            contact: "#f7931e"
        },
        background: "radial-gradient(1200px 800px at 30% 20%, rgba(255,107,53,0.12), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(247,147,30,0.12), transparent 60%), #2d1b69"
    }
};

// Secret commands
const SECRET_COMMANDS = [
    { command: "matrix", description: "Enable Matrix green theme" },
    { command: "cyberpunk", description: "Enable Cyberpunk neon theme" },
    { command: "retro", description: "Enable Retro 80s theme" },
    { command: "help", description: "Show this help message" },
    { command: "reset", description: "Reset to default theme" },
    { command: "dev", description: "Toggle developer mode" }
];

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
    phase?: number; // radial "breathing" phase
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
                                          onAboutSelect,
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
    onAboutSelect: (section: string) => void;
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
    const [isLoading, setIsLoading] = useState(true);
    const [secretTheme, setSecretTheme] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [devMode, setDevMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [typedKeys, setTypedKeys] = useState("");
    const [themeFlash, setThemeFlash] = useState(false);
    const [fps, setFps] = useState(0);
    const [satelliteMultiplier, setSatelliteMultiplier] = useState(1);
    const [edgeMultiplier, setEdgeMultiplier] = useState(1);
    const timeRef = useRef(0);
    const visited = useRef<Set<string>>(new Set()); // clicked projects
    const devModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fpsRef = useRef({ lastTime: 0, frameCount: 0, fps: 0 });

    const SHOOTING_COUNT = 25;
    const shootingRef = useRef<{
        x: number; y: number; vx: number; vy: number;
        r: number; hue: number; life: number; maxLife: number;
    }[]>([]);
    
    // Particle explosion refs
    const explosionRef = useRef<{
        x: number; y: number; particles: Array<{
            x: number; y: number; vx: number; vy: number;
            life: number; maxLife: number; color: string;
        }>;
    } | null>(null);

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

    // Secret features and keyboard handlers
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                animateCollapse();
            }
            
            // Secret command typing
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                setTypedKeys(prev => {
                    const newKeys = prev + e.key.toLowerCase();
                    // Keep only last 20 characters
                    const trimmed = newKeys.slice(-20);
                    
                    // Check for secret commands
                    if (trimmed.includes("help")) {
                        setShowHelp(true);
                        setTimeout(() => setShowHelp(false), 5000);
                        return "";
                    }
                    if (trimmed.includes("matrix")) {
                        setSecretTheme("matrix");
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("cyberpunk")) {
                        setSecretTheme("cyberpunk");
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("retro")) {
                        setSecretTheme("retro");
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("reset")) {
                        setSecretTheme(null);
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("dev")) {
                        // Clear any existing timeout
                        if (devModeTimeoutRef.current) {
                            clearTimeout(devModeTimeoutRef.current);
                        }
                        setDevMode(true);
                        devModeTimeoutRef.current = setTimeout(() => {
                            setDevMode(false);
                            devModeTimeoutRef.current = null;
                        }, 600000); // 10 minutes
                        return "";
                    }
                    
                    return trimmed;
                });
            }
        };
        
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            // Clean up timeout on unmount
            if (devModeTimeoutRef.current) {
                clearTimeout(devModeTimeoutRef.current);
            }
        };
    }, []);

    // Handle dev mode controls separately
    useEffect(() => {
        if (devMode && typedKeys) {
            const trimmed = typedKeys.slice(-20);
            if (trimmed.includes("more")) {
                console.log("More command detected");
                setSatelliteMultiplier(prev => Math.min(prev + 0.5, 5));
                setEdgeMultiplier(prev => Math.min(prev + 0.2, 3));
                setTypedKeys("");
            } else if (trimmed.includes("less")) {
                console.log("Less command detected");
                setSatelliteMultiplier(prev => Math.max(prev - 0.5, 0.5));
                setEdgeMultiplier(prev => Math.max(prev - 0.2, 0.2));
                setTypedKeys("");
            } else if (trimmed.includes("reset")) {
                console.log("Reset command detected");
                setSatelliteMultiplier(1);
                setEdgeMultiplier(1);
                setTypedKeys("");
            }
        }
    }, [devMode, typedKeys]);

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

        // Calculate responsive sizes based on screen dimensions
        const screenSize = Math.min(w, h);
        const hubRadius = Math.max(20, Math.min(45, screenSize * 0.04)); // 20-45px based on screen size (increased)
        const satelliteRadiusMin = Math.max(1.5, Math.min(5, screenSize * 0.003)); // 1.5-5px (increased)
        const satelliteRadiusMax = Math.max(6, Math.min(18, screenSize * 0.012)); // 6-18px (increased)
        // Larger orbit radii for more screen coverage
        const orbitRadiusMin = Math.max(40, Math.min(100, screenSize * 0.08)); // 40-100px (increased)
        const orbitRadiusMax = Math.max(80, Math.min(150, screenSize * 0.12)); // 80-150px (increased)

        for (const {id} of clusters) {
            // hub
            nodes.push({
                id: nid++,
                x: (anchors.current[id]?.x ?? w * 0.5) + rand(-10, 10),
                y: (anchors.current[id]?.y ?? h * 0.5) + rand(-10, 10),
                vx: 0,
                vy: 0,
                r: hubRadius,
                clusterId: id,
                isHub: true,
            });
            // satellites
            const satellites = Math.round(12 * satelliteMultiplier);
            for (let i = 0; i < satellites; i++) {
                const baseR = rand(orbitRadiusMin, orbitRadiusMax);
                const theta = rand(0, Math.PI * 2);
                const omega = rand(CALM.orbitOmegaMin, CALM.orbitOmegaMax) * (Math.random() < 0.5 ? -1 : 1);
                const phase = rand(0, Math.PI * 2);

                nodes.push({
                    id: nid++,
                    x: (anchors.current[id]?.x ?? w * 0.5) + Math.cos(theta) * baseR,
                    y: (anchors.current[id]?.y ?? h * 0.5) + Math.sin(theta) * baseR,
                    vx: 0,
                    vy: 0,
                    r: rand(satelliteRadiusMin, satelliteRadiusMax),
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
        // Responsive edge distance based on orbit size - increased for more connections
        const edgeDistance = Math.max(120, Math.min(200, screenSize * 0.15)); // 120-200px based on screen size (increased)
        for (const c of clusters) {
            const list = clusterNodes(c.id);
            for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                    const a = list[i],
                        b = list[j];
                    const dx = a.x - b.x,
                        dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < edgeDistance * edgeDistance && Math.random() < 0.08 * edgeMultiplier) edges.push({a: a.id, b: b.id, clusterId: c.id});
                }
            }
        }

        // sparse cross edges
        const ids = clusters.map((c) => c.id);
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const A = clusterNodes(ids[i]).filter((n) => !n.isHub);
                const B = clusterNodes(ids[j]).filter((n) => !n.isHub);
                for (let k = 0; k < Math.round(5 * edgeMultiplier); k++) {
                    const a = A[Math.floor(Math.random() * A.length)];
                    const b = B[Math.floor(Math.random() * B.length)];
                    if (a && b) edges.push({a: a.id, b: b.id, clusterId: "cross", cross: true});
                }
            }
        }

        graph.current = {nodes, edges};
        
        // Set loading to false after a short delay to ensure everything is ready
        setTimeout(() => setIsLoading(false), 1000);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size.w, size.h, JSON.stringify(clusters), satelliteMultiplier, edgeMultiplier]);

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

        // Apply secret theme to clusters if active
        const themedClusters = secretTheme ? 
            clusters.map(cluster => ({
                ...cluster,
                color: SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].colors[cluster.id as keyof typeof SECRET_THEMES.matrix.colors] || cluster.color
            })) : 
            clusters;
        
        // build env once per effect run
        const env: StepEnv = {
            timeRef, prefersReducedMotion,
            ctx, canvas, DPR, size,
            graph, anchors,
            transform, expandedCluster, hoverId, hoverCluster,
            CALM,
            SHOOTING_COUNT, shootingRef,
            clusters: themedClusters,
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
            
            // Calculate FPS
            fpsRef.current.frameCount++;
            if (t - fpsRef.current.lastTime >= 1000) { // Update FPS every second
                fpsRef.current.fps = Math.round((fpsRef.current.frameCount * 1000) / (t - fpsRef.current.lastTime));
                setFps(fpsRef.current.fps);
                fpsRef.current.frameCount = 0;
                fpsRef.current.lastTime = t;
            }
            
            // Update particle explosion
            if (explosionRef.current) {
                const dt = (t - last) / 1000;
                explosionRef.current.particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vx *= 0.98; // friction
                    particle.vy *= 0.98;
                    particle.vy += 0.1; // gravity
                    particle.life += dt;
                });
                
                // Remove dead particles
                explosionRef.current.particles = explosionRef.current.particles.filter(
                    particle => particle.life < particle.maxLife
                );
                
                // Remove explosion if no particles left
                if (explosionRef.current.particles.length === 0) {
                    explosionRef.current = null;
                }
            }
            
            raf = requestAnimationFrame(step);
            drawBackgroundStarfield(ctx, starfieldRef.current, timeRef.current);
            
            // Draw particle explosion
            if (explosionRef.current) {
                ctx.save();
                explosionRef.current.particles.forEach(particle => {
                    const alpha = 1 - (particle.life / particle.maxLife);
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            }
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [size.w, size.h, transform, hoverId, hoverCluster, clusters, projects, expandedCluster, aboutFacts, funFacts, contactLinks, size, secretTheme]);

    // Apply secret theme background to body and force canvas redraw
    useEffect(() => {
        if (secretTheme) {
            document.body.style.background = SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].background;
        } else {
            document.body.style.background = "radial-gradient(1200px 800px at 30% 20%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(34,211,238,0.08), transparent 60%), #0b0e14";
        }
        
        // Force canvas redraw by triggering a state update
        const canvas = canvasRef.current;
        if (canvas && !isLoading) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Clear and redraw immediately
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackgroundStarfield(ctx, starfieldRef.current, timeRef.current);
            }
        }
        
        return () => {
            document.body.style.background = "radial-gradient(1200px 800px at 30% 20%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(34,211,238,0.08), transparent 60%), #0b0e14";
        };
    }, [secretTheme, isLoading]);

    // pointer interactions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isLoading) return;

        const {nodes} = graph.current;

        const invert = (x: number, y: number) => {
            const ix = (x - transform.tx) / transform.sx;
            const iy = (y - transform.ty) / transform.sy;
            return {x: ix, y: iy};
        };

        // Helper function to find the best node at a given point
        const findNodeAtPoint = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            const p = invert(clientX - rect.left, clientY - rect.top);
            let best: { id: number; d2: number } | null = null;
            for (const n of nodes) {
                const dx = p.x - n.x,
                    dy = p.y - n.y;
                // Responsive hit detection radius
                const hitRadius = n.isHub ? Math.max(12, Math.min(20, size.w * 0.015)) : Math.max(4, Math.min(10, size.w * 0.008));
                const r = n.r + hitRadius;
                const d2 = dx * dx + dy * dy;
                if (d2 <= r * r) best = !best || d2 < best.d2 ? {id: n.id, d2} : best;
            }
            return best ? { node: nodes[best.id], point: p } : null;
        };

        const onMove = (e: PointerEvent) => {
            const result = findNodeAtPoint(e.clientX, e.clientY);
            setHoverId(result ? result.node.id : null);
            setHoverCluster(result ? (result.node.clusterId as Cluster["id"]) : null);

            // look for project/contact hit
            let onSatellite = false;
            let tip: { x: number; y: number; text: string } | null = null;

            // Check for expanded cluster elements (projects, skills, about sections, etc.)
            if (expandedCluster) {
                const rect = canvas.getBoundingClientRect();
                const p = invert(e.clientX - rect.left, e.clientY - rect.top);
                
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
                         } else if (s.id.startsWith("aboutfact:")) {
                             const factIndex = parseInt(s.id.split(":")[1]);
                             const fact = aboutFacts[factIndex];
                             if (fact) tip = {x: e.clientX + 10, y: e.clientY - 16, text: fact};
                         } else if (s.id.startsWith("funfact:")) {
                             const factIndex = parseInt(s.id.split(":")[1]);
                             const fact = funFacts[factIndex];
                             if (fact) tip = {x: e.clientX + 10, y: e.clientY - 16, text: fact};
                         } else {
                             const proj = projects.find((pp) => pp.id === s.id);
                             if (proj) tip = {x: e.clientX + 10, y: e.clientY - 16, text: proj.title};
                         }
                        break;
                    }
                }
            }
             setTooltip(tip);
             canvas.style.cursor = onSatellite || (result && result.node.isHub) ? "pointer" : "default";
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
            
            // Track clicks for particle explosion
            const now = Date.now();
            if (now - lastClickTime < 10000) { // 10 seconds
                const newCount = clickCount + 1;
                setClickCount(newCount);
                setLastClickTime(now);
                
                // Trigger particle explosion after 10 clicks
                if (newCount >= 10) {
                    const explosionX = e.clientX;
                    const explosionY = e.clientY;
                    const particles = [];
                    
                    // Create 50 particles
                    for (let i = 0; i < 50; i++) {
                        const angle = (Math.PI * 2 * i) / 50;
                        const speed = 2 + Math.random() * 3;
                        particles.push({
                            x: explosionX,
                            y: explosionY,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 0,
                            maxLife: 2 + Math.random() * 2,
                            color: `hsl(${Math.random() * 360}, 70%, 60%)`
                        });
                    }
                    
                    explosionRef.current = {
                        x: explosionX,
                        y: explosionY,
                        particles
                    };
                    
                    // Reset click count
                    setClickCount(0);
                    setLastClickTime(0);
                }
            } else {
                // Reset if more than 10 seconds have passed
                setClickCount(1);
                setLastClickTime(now);
            }

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
                         } else if (s.id.startsWith("about:")) {
                             // Handle About cluster elements
                             const section = s.id.split(":")[1];
                             onAboutSelect(section);
                             visited.current.add(s.id);
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

            // Zoomed out: hub expand - check both hoverId and direct click detection
            let targetNode = hoverId !== null ? nodes[hoverId] : null;
            
            // If no hoverId (mobile case), check the click position directly
            if (!targetNode) {
                const result = findNodeAtPoint(e.clientX, e.clientY);
                targetNode = result?.node || null;
            }
            
                         if (!targetNode || !targetNode.isHub) return;

             // expand hub + zoom
             targetNode.pulse = 0.01;
             const target = anchors.current[targetNode.clusterId];
             const cx = target?.x ?? size.w / 2;
             const cy = target?.y ?? size.h / 2;
             const desiredScale = CALM.zoomScale;
             const duration = prefersReducedMotion ? 250 : CALM.zoomDuration;

             const start = performance.now();
             const startTransform = {...transform};
             setZooming(true);
             setExpandedCluster(targetNode.clusterId as Cluster["id"]);

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

        // Add touch event handling for mobile
        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault(); // Prevent default to avoid double-firing with click
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const result = findNodeAtPoint(touch.clientX, touch.clientY);
                setHoverId(result ? result.node.id : null);
                setHoverCluster(result ? (result.node.clusterId as Cluster["id"]) : null);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                // Simulate a click at the touch end position
                const clickEvent = new PointerEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    bubbles: true,
                    cancelable: true
                });
                canvas.dispatchEvent(clickEvent);
            }
        };

        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);
        canvas.addEventListener("pointerdown", onClick);
        canvas.addEventListener("touchstart", onTouchStart, { passive: false });
        canvas.addEventListener("touchend", onTouchEnd);
        
        return () => {
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerleave", onLeave);
            canvas.removeEventListener("pointerdown", onClick);
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchend", onTouchEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoverId, transform, zooming, router, expandedCluster, onProjectSelect, contactLinks, isLoading]);

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
                style={{
                    top: "var(--safe-top, 88px)", 
                    bottom: "var(--safe-bottom, 72px)",
                    touchAction: "none" // Prevent default touch behaviors
                }}
                aria-label="Interactive neural network map of skills and projects"
                role="img"
            />
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                        {/* Neural Network Loading Animation */}
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            {/* Central Hub */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                            </div>
                            
                            {/* Orbiting Nodes */}
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{
                                        animation: `orbit ${2 + i * 0.3}s linear infinite`,
                                        animationDelay: `${i * 0.2}s`
                                    }}
                                >
                                    <div 
                                        className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"
                                        style={{
                                            transform: `translateX(${40 + i * 8}px)`,
                                            animationDelay: `${i * 0.1}s`
                                        }}
                                    ></div>
                                </div>
                            ))}
                            
                            {/* Connecting Lines */}
                            <svg className="absolute inset-0 w-full h-full" style={{transform: 'rotate(0deg)'}}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                                        <stop offset="50%" stopColor="rgba(167, 139, 250, 0.5)" />
                                        <stop offset="100%" stopColor="rgba(34, 211, 238, 0.3)" />
                                    </linearGradient>
                                </defs>
                                                                 {[...Array(6)].map((_, i) => {
                                     const angle = (i * 60) * (Math.PI / 180);
                                     const x1 = 64, y1 = 64;
                                     const x2 = Math.round(64 + Math.cos(angle) * 40);
                                     const y2 = Math.round(64 + Math.sin(angle) * 40);
                                     return (
                                         <line
                                             key={i}
                                             x1={x1}
                                             y1={y1}
                                             x2={x2}
                                             y2={y2}
                                             stroke="url(#lineGradient)"
                                             strokeWidth="1"
                                             opacity="0.6"
                                             style={{
                                                 animation: `pulse 2s ease-in-out infinite`,
                                                 animationDelay: `${i * 0.2}s`
                                             }}
                                         />
                                     );
                                 })}
                            </svg>
                        </div>
                        
                        {/* Loading Text */}
                        <div className="text-white/80 text-lg font-medium mb-2">Initializing Neural Network</div>
                        <div className="text-white/60 text-sm">Connecting nodes and establishing orbits...</div>
                        
                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                    style={{
                                        animationDelay: `${i * 0.2}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
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
            
                         {/* Secret Theme Background Overlay */}
             {secretTheme && (
                 <div 
                     className="fixed inset-0 z-[-1] pointer-events-none"
                     style={{
                         background: SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].background
                     }}
                 />
             )}
             
             {/* Theme Change Flash Effect */}
             {themeFlash && (
                 <div 
                     className="fixed inset-0 z-20 pointer-events-none bg-white/20 animate-pulse"
                     style={{
                         animation: 'none',
                         background: secretTheme ? 
                             SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].colors.frontend + '40' : 
                             'rgba(255,255,255,0.2)'
                     }}
                 />
             )}
            
            {/* Secret Theme Indicator */}
            {secretTheme && (
                <div className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-xs text-white border border-white/20">
                    🎨 {SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].name} Mode
                </div>
            )}
            
                                      {/* Developer Mode Overlay */}
              {devMode && (
                  <div className="fixed top-4 left-4 z-40 p-3 rounded-lg bg-black/70 backdrop-blur text-xs text-green-400 border border-green-400/30 font-mono">
                      <div>DEV MODE</div>
                      <div>FPS: {fps}</div>
                      <div>Nodes: {graph.current.nodes.length}</div>
                      <div>Edges: {graph.current.edges.length}</div>
                      <div>Theme: {secretTheme || "default"}</div>
                      <div>Clicks: {clickCount}/10</div>
                      <div className="mt-2 pt-2 border-t border-green-400/30">
                          <div>Satellites: {satelliteMultiplier.toFixed(1)}x</div>
                          <div>Edges: {edgeMultiplier.toFixed(1)}x</div>
                          <div className="text-xs text-green-300 mt-1">
                              Type "more" to increase, "less" to decrease
                          </div>
                      </div>
                  </div>
              )}
            
            {/* Help Overlay */}
            {showHelp && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-black/90 backdrop-blur border border-white/20 rounded-lg p-6 max-w-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">🎮 Secret Commands</h3>
                        <div className="space-y-2 text-sm mb-6">
                            {SECRET_COMMANDS.map(cmd => (
                                <div key={cmd.command} className="flex justify-between">
                                    <span className="text-purple-400 font-mono">{cmd.command}</span>
                                    <span className="text-gray-300">{cmd.description}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t border-white/20 pt-4 mb-4">
                            <h4 className="text-sm font-semibold text-white mb-2">🌐 How to Use This Site</h4>
                            <div className="text-xs text-gray-300 space-y-2">
                                <p><strong>Click on any hub</strong> to expand and see related projects, skills, or information.</p>
                                <p><strong>Hover over elements</strong> to see tooltips and preview content.</p>
                                <p><strong>Click on orbiting elements</strong> to open detailed modals with full information.</p>
                                <p><strong>Use the Back button</strong> or click outside to collapse expanded clusters.</p>
                                <p><strong>Try the secret themes</strong> by typing "matrix", "cyberpunk", or "retro" for different visual styles.</p>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                            Type commands anywhere on the page to activate them!
                        </div>
                    </div>
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
    ctx.fillText(clipped, left + pad, top + h - 6);
    ctx.restore();
}

function clipText(ctx: CanvasRenderingContext2D, text: string, max: number) {
    if (ctx.measureText(text).width <= max) return text;
    // quick ellipsis clip
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
    return t + "…";
}

