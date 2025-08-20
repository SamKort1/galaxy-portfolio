"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Cluster } from "./step/env";
import { runStep } from "./step/runStep";
import type { StepEnv } from "./step/env";
import { generateBackgroundStarfield, drawBackgroundStarfield, BackgroundStar } from "../utils/StarField";
import { roundRectPath } from "./step/drawHelpers";
import { skills } from "../../app/data/projects";

// Import our refactored modules
import { CALM, DPR, prefersReducedMotion, SHOOTING_COUNT } from "./constants";
import { NeuralCanvasProps } from "./types";
import { drawPillLabelAlpha } from "./utils";
import { useCanvasSetup } from "./hooks/useCanvasSetup";
import { useSecretFeatures } from "./hooks/useSecretFeatures";
import { useGraphSetup } from "./hooks/useGraphSetup";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { HelpModal } from "./components/HelpModal";
import { SecretOverlays } from "./components/SecretOverlays";
import { MobileAccessButton } from "./components/MobileAccessButton";

export default function NeuralCanvas({
    clusters,
    projects,
    onProjectSelect,
    onAboutSelect,
    aboutFacts,
    funFacts,
    contactLinks,
    onOpenContactModal,
}: NeuralCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { size, setSize } = useCanvasSetup();
    
    // State management
    const [hoverId, setHoverId] = useState<number | null>(null);
    const [hoverCluster, setHoverCluster] = useState<Cluster["id"] | null>(null);
    const [transform, setTransform] = useState({ sx: 1, sy: 1, tx: 0, ty: 0 });
    const [zooming, setZooming] = useState(false);
    const [expandedCluster, setExpandedCluster] = useState<Cluster["id"] | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Animation state for fade effects
    const [labelFadeAlpha, setLabelFadeAlpha] = useState(1);
    const [expandedFadeAlpha, setExpandedFadeAlpha] = useState(1);

    // Blackhole state
    const [blackholeActive, setBlackholeActive] = useState(false);
    const [blackholeX, setBlackholeX] = useState(0);
    const [blackholeY, setBlackholeY] = useState(0);
    const [blackholeRadius, setBlackholeRadius] = useState(50);
    const [blackholeVisualRadius, setBlackholeVisualRadius] = useState(50);
    const [blackholeStrength, setBlackholeStrength] = useState(3000);

    // Blackhole activation callback
    const activateBlackhole = useCallback(() => {
        // Position blackhole at random location on screen with responsive margins
        const responsiveMargin = Math.min(40, size.w * 0.08); // Smaller margin on small screens
        const margin = Math.max(25, responsiveMargin); // Minimum 25px margin
        
        const randomX = margin + Math.random() * (size.w - 2 * margin);
        const randomY = margin + Math.random() * (size.h - 2 * margin);
        
        // Make both physics and visual radius responsive to screen size
        const physicsRadius = Math.max(150, Math.min(400, size.w * 0.15)); // 15% of screen width, min 150, max 400
        const visualRadius = Math.max(35, Math.min(80, size.w * 0.09)); // 9% of screen width, min 35, max 80
        
        setBlackholeX(randomX);
        setBlackholeY(randomY);
        setBlackholeRadius(physicsRadius); // For physics calculations - now responsive
        setBlackholeVisualRadius(visualRadius); // For visual rendering
        setBlackholeActive(true);
        
        // Deactivate after 15 seconds (longer duration)
        setTimeout(() => {
            setBlackholeActive(false);
        }, 15000);
    }, [size.w, size.h]);

    // Secret features hook
    const {
        secretTheme,
        setSecretTheme,
        showHelp,
        setShowHelp,
        devMode,
        setDevMode,
        clickCount,
        setClickCount,
        lastClickTime,
        setLastClickTime,
        themeFlash,
        setThemeFlash,
        fps,
        setFps,
        satelliteMultiplier,
        edgeMultiplier,
        devModeTimeoutRef,
        fpsRef,
        SECRET_THEMES
    } = useSecretFeatures(activateBlackhole);

    // Graph setup hook
    const { graph, anchors } = useGraphSetup(size, clusters, satelliteMultiplier, edgeMultiplier);

    // Refs
    const timeRef = useRef(0);
    const visited = useRef<Set<string>>(new Set());
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
    const projectHit = useRef<{ id: string; x: number; y: number; r: number }[]>([]);

    // Canvas setup effect
    useEffect(() => {
        const canvas = canvasRef.current!;
        const resize = () => {
            const w = window.innerWidth;
            const cs = getComputedStyle(document.documentElement);
            const safeTop = parseFloat(cs.getPropertyValue("--safe-top")) || 0;
            const safeBottom = parseFloat(cs.getPropertyValue("--safe-bottom")) || 0;
            const h = Math.max(0, window.innerHeight - safeTop - safeBottom);

            setSize({ w, h });
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
    }, [setSize]);

    // Set loading to false after graph setup
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    // Main animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        let raf = 0;
        let last = performance.now();

        // Helper function
        const attract = (node: { x: number; y: number; vx: number; vy: number }, target: { x: number; y: number }, strength: number) => {
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
        
        // Build env once per effect run
        const env: StepEnv = {
            timeRef, prefersReducedMotion,
            ctx, canvas, DPR, size,
            graph, anchors,
            transform, expandedCluster, hoverId, hoverCluster,
            CALM,
            SHOOTING_COUNT, shootingRef,
            clusters: themedClusters,
            skills,
            projects,
            contactLinks,
            visited,
            projectHit,
            attract,
            roundedRectPath: roundRectPath,
            drawPillLabelAlpha,
            aboutFacts: aboutFacts ?? [],
            funFacts: funFacts ?? [],
            labelFadeAlpha,
            expandedFadeAlpha,
            blackholeActive,
            blackholeX,
            blackholeY,
            blackholeRadius,
            blackholeVisualRadius,
            blackholeStrength,
        };

        const step = (t: number) => {
            last = runStep(env, t, last);
            
            // Calculate FPS
            fpsRef.current.frameCount++;
            if (t - fpsRef.current.lastTime >= 1000) {
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
                    particle.vx *= 0.98;
                    particle.vy *= 0.98;
                    particle.vy += 0.1;
                    particle.life += dt;
                });
                
                explosionRef.current.particles = explosionRef.current.particles.filter(
                    particle => particle.life < particle.maxLife
                );
                
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
    }, [size.w, size.h, size, transform, hoverId, hoverCluster, clusters, projects, expandedCluster, aboutFacts, funFacts, contactLinks, secretTheme, SECRET_THEMES, anchors, graph, setFps, fpsRef, labelFadeAlpha, expandedFadeAlpha, blackholeActive, blackholeX, blackholeY, blackholeRadius, blackholeStrength]);

    // Apply secret theme background
    useEffect(() => {
        if (secretTheme) {
            document.body.style.background = SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].background;
        } else {
            document.body.style.background = "radial-gradient(1200px 800px at 30% 20%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(34,211,238,0.08), transparent 60%), #0b0e14";
        }
        
        const canvas = canvasRef.current;
        if (canvas && !isLoading) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBackgroundStarfield(ctx, starfieldRef.current, timeRef.current);
            }
        }
        
        return () => {
            document.body.style.background = "radial-gradient(1200px 800px at 30% 20%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(34,211,238,0.08), transparent 60%), #0b0e14";
        };
    }, [secretTheme, isLoading, SECRET_THEMES]);

    // Helper: animated collapse
    const animateCollapse = useCallback(() => {
        if (!expandedCluster) return;
        const start = performance.now();
        const startTransform = { ...transform };
        const target = { sx: 1, sy: 1, tx: 0, ty: 0 };
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

            setTransform({ sx, sy, tx, ty });

            // Animate label fade in (labels appear as we zoom out)
            const labelFade = Math.min(1, tt * 2); // Labels fade in faster
            setLabelFadeAlpha(labelFade);

            // Animate expanded content fade out (content disappears as we zoom out)
            const expandedFade = Math.max(0, 1 - tt * 1.5); // Content fades out faster
            setExpandedFadeAlpha(expandedFade);

            if (tt < 1) requestAnimationFrame(tick);
            else {
                setZooming(false);
                setExpandedCluster(null);
                setLabelFadeAlpha(1);
                setExpandedFadeAlpha(1);
                onProjectSelect(null);
            }
        };
        requestAnimationFrame(tick);
    }, [expandedCluster, transform, onProjectSelect]);

    // Pointer interactions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isLoading) return;

        const { nodes } = graph.current;

        const invert = (x: number, y: number) => {
            const ix = (x - transform.tx) / transform.sx;
            const iy = (y - transform.ty) / transform.sy;
            return { x: ix, y: iy };
        };

        const findNodeAtPoint = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            const p = invert(clientX - rect.left, clientY - rect.top);
            let best: { id: number; d2: number } | null = null;
            for (const n of nodes) {
                const dx = p.x - n.x, dy = p.y - n.y;
                const hitRadius = n.isHub ? Math.max(12, Math.min(20, size.w * 0.015)) : Math.max(4, Math.min(10, size.w * 0.008));
                const r = n.r + hitRadius;
                const d2 = dx * dx + dy * dy;
                if (d2 <= r * r) best = !best || d2 < best.d2 ? { id: n.id, d2 } : best;
            }
            return best ? { node: nodes[best.id], point: p } : null;
        };

        const onMove = (e: PointerEvent) => {
            const result = findNodeAtPoint(e.clientX, e.clientY);
            setHoverId(result ? result.node.id : null);
            setHoverCluster(result ? (result.node.clusterId as Cluster["id"]) : null);

            let onSatellite = false;
            let tip: { x: number; y: number; text: string } | null = null;

            if (expandedCluster) {
                const rect = canvas.getBoundingClientRect();
                const p = invert(e.clientX - rect.left, e.clientY - rect.top);
                
                for (const s of projectHit.current) {
                    const dx = p.x - s.x, dy = p.y - s.y;
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
                            if (fact) tip = { x: e.clientX + 10, y: e.clientY - 16, text: fact };
                        } else if (s.id.startsWith("funfact:")) {
                            const factIndex = parseInt(s.id.split(":")[1]);
                            const fact = funFacts[factIndex];
                            if (fact) tip = { x: e.clientX + 10, y: e.clientY - 16, text: fact };
                        } else {
                            const proj = projects.find((pp) => pp.id === s.id);
                            if (proj) tip = { x: e.clientX + 10, y: e.clientY - 16, text: proj.title };
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
            if (now - lastClickTime < 10000) {
                const newCount = clickCount + 1;
                setClickCount(newCount);
                setLastClickTime(now);
                
                if (newCount >= 10) {
                    const explosionX = e.clientX;
                    const explosionY = e.clientY;
                    const particles = [] as Array<{x:number;y:number;vx:number;vy:number;life:number;maxLife:number;color:string}>;
                    
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
                    
                    setClickCount(0);
                    setLastClickTime(0);
                }
            } else {
                setClickCount(1);
                setLastClickTime(now);
            }

            // Handle expanded cluster interactions
            if (expandedCluster) {
                for (const s of projectHit.current) {
                    const dx = p.x - s.x, dy = p.y - s.y;
                    if (dx * dx + dy * dy < s.r * s.r) {
                        const rect = canvas.getBoundingClientRect();
                        const sx = s.x * transform.sx + transform.tx + rect.left;
                        const sy = s.y * transform.sy + transform.ty + rect.top;
                        const c = clusters.find(c => c.id === expandedCluster)!.color;

                        if (s.id.startsWith("contact:")) {
                            if (s.id === "contact:message") onOpenContactModal();
                            else {
                                const key = s.id.split(":")[1];
                                const link = contactLinks.find(l => l.id === key as "email" | "github" | "linkedin" | "message");
                                if (link) window.open(link.href, "_blank");
                            }
                        } else if (s.id.startsWith("about:")) {
                            const section = s.id.split(":")[1];
                            onAboutSelect(section);
                            visited.current.add(s.id);
                        } else {
                            onProjectSelect({ id: s.id, x: sx, y: sy, color: c });
                            visited.current.add(s.id);
                        }
                        visited.current.add(s.id);
                        return;
                    }
                }

                if (hoverId !== null) {
                    const n = nodes[hoverId];
                    if (n.isHub && n.clusterId === expandedCluster) return;
                }

                animateCollapse();
                return;
            }

            let targetNode = hoverId !== null ? nodes[hoverId] : null;
            
            if (!targetNode) {
                const result = findNodeAtPoint(e.clientX, e.clientY);
                targetNode = result?.node || null;
            }
            
            if (!targetNode || !targetNode.isHub) return;

            targetNode.pulse = 0.01;
            const target = anchors.current[targetNode.clusterId];
            const cx = target?.x ?? size.w / 2;
            const cy = target?.y ?? size.h / 2;
            const desiredScale = CALM.zoomScale;
            const duration = prefersReducedMotion ? 250 : CALM.zoomDuration;

            const start = performance.now();
            const startTransform = { ...transform };
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
                setTransform({ sx, sy, tx, ty });

                // Animate label fade out (labels disappear as we zoom in)
                const labelFade = Math.max(0, 1 - tt * 1.2); // Labels fade out slightly faster
                setLabelFadeAlpha(labelFade);

                // Animate expanded content fade in (content appears as we zoom in)
                const expandedFade = Math.min(1, tt * 1.5); // Content fades in faster
                setExpandedFadeAlpha(expandedFade);

                if (tt < 1) requestAnimationFrame(tick);
                else setZooming(false);
            };
            requestAnimationFrame(tick);
        };

        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault();
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
    }, [hoverId, transform, zooming, expandedCluster, onProjectSelect, contactLinks, isLoading, size, clusters, projects, aboutFacts, funFacts, clickCount, lastClickTime, anchors, animateCollapse, graph, onAboutSelect, onOpenContactModal, setClickCount, setLastClickTime]);

    return (
        <>
            <canvas
                ref={canvasRef} 
                className="fixed left-0 right-0 z-0"
                style={{
                    top: "var(--safe-top, 88px)",
                    bottom: "var(--safe-bottom, 72px)",
                    touchAction: "none"
                }}
                aria-label="Interactive neural network map of skills and projects"
                role="img"
            />
            
            {isLoading && <LoadingOverlay />}
            
            {tooltip && (
                <div
                    className="fixed z-30 text-xs rounded-lg px-2 py-1 bg-white/10 backdrop-blur text-gray-100 pointer-events-none"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
            )}
            
            {expandedCluster && (
                <button
                    onClick={animateCollapse}
                    className="fixed top-[calc(var(--safe-top,88px)+12px)] left-8 z-30 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-200 backdrop-blur"
                >
                    ← Back
                </button>
            )}
            
            <SecretOverlays
                secretTheme={secretTheme}
                themeFlash={themeFlash}
                devMode={devMode}
                fps={fps}
                clickCount={clickCount}
                satelliteMultiplier={satelliteMultiplier}
                edgeMultiplier={edgeMultiplier}
                graphNodesLength={graph.current.nodes.length}
                graphEdgesLength={graph.current.edges.length}
            />
            
            <HelpModal
                showHelp={showHelp}
                setShowHelp={setShowHelp}
                setSecretTheme={setSecretTheme}
                setThemeFlash={setThemeFlash}
                setDevMode={setDevMode}
                devModeTimeoutRef={devModeTimeoutRef}
            />
            
            <MobileAccessButton setShowHelp={setShowHelp} />
        </>
    );
}
