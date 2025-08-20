"use client";
import React, { useEffect, useRef } from "react";

type CometOverlayProps = {
    start: { x: number; y: number }; // screen coords (clientX/clientY in CSS px)
    color?: string;                   // fallback used for glow
    durationMs?: number;              // default ~700ms
    onDone: () => void;               // called once animation completes
};

export default function CometOverlay({
                                         start,
                                         color = "#22d3ee",
                                         durationMs = 720,
                                         onDone,
                                     }: CometOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);

        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = Math.floor(w * DPR);
            canvas.height = Math.floor(h * DPR);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
        };
        resize();
        window.addEventListener("resize", resize);

        // animation values
        const t0 = performance.now();
        const origin = { x: start.x, y: start.y };
        const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // modal center
        const len = Math.hypot(target.x - origin.x, target.y - origin.y);
        const dir = { x: (target.x - origin.x) / (len || 1), y: (target.y - origin.y) / (len || 1) };

        // particles
        const P = 80;
        const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
        for (let i = 0; i < P; i++) {
            const s = 180 + Math.random() * 260; // speed
            const spread = (Math.random() - 0.5) * 0.45; // angular spread
            const cs = Math.cos(spread), sn = Math.sin(spread);
            // rotate dir by spread
            const rx = dir.x * cs - dir.y * sn;
            const ry = dir.x * sn + dir.y * cs;
            parts.push({
                x: origin.x,
                y: origin.y,
                vx: rx * s,
                vy: ry * s,
                life: 0.6 + Math.random() * 0.5,
            });
        }

        // Screen shake near end
        const shake = (q: number) => {
            const amp = 6 * q;
            return { x: (Math.random() - 0.5) * amp, y: (Math.random() - 0.5) * amp };
        };

        const hexToRgb = (h: string) => {
            const c = h.replace("#", "");
            return {
                r: parseInt(c.slice(0, 2), 16),
                g: parseInt(c.slice(2, 4), 16),
                b: parseInt(c.slice(4, 6), 16),
            };
        };
        const { r, g, b } = hexToRgb(color);

        const step = (t: number) => {
            const elapsed = t - t0;
            const k = Math.min(1, elapsed / durationMs); // 0..1
            const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

            // move head along path
            const head = {
                x: origin.x + (target.x - origin.x) * ease,
                y: origin.y + (target.y - origin.y) * ease,
            };

            // clear
            ctx.save();
            ctx.scale(DPR, DPR);
            ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);

            // Trailing glow
            const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 180);
            grd.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
            grd.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);

            // update particles
            const dt = 1 / 60;
            parts.forEach(p => {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= 0.992;
                p.vy *= 0.992;
                p.life -= dt * 0.7;
            });

            // draw trail as streaks
            ctx.lineCap = "round";
            parts.forEach((p, i) => {
                if (p.life <= 0) return;
                const tAlpha = Math.max(0, Math.min(1, p.life));
                ctx.strokeStyle = `rgba(${r},${g},${b},${0.45 * tAlpha})`;
                ctx.lineWidth = 2 + 2 * tAlpha;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
                ctx.stroke();
                // occasional sparkle
                if (i % 9 === 0 && tAlpha > 0.2) {
                    ctx.fillStyle = `rgba(255,255,255,${0.25 * tAlpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // comet head
            ctx.beginPath();
            ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
            ctx.arc(head.x, head.y, 4 + 3 * (1 - k), 0, Math.PI * 2);
            ctx.fill();

            // impact flash near the end
            if (k > 0.85) {
                const q = (k - 0.85) / 0.15; // 0..1 last 15%
                const flashR = 30 + q * 140;
                const impact = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, flashR);
                impact.addColorStop(0, `rgba(${r},${g},${b},${0.35 * (1 - q / 1.2)})`);
                impact.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = impact;
                const s = shake(1 - q);
                ctx.translate(s.x, s.y);
                ctx.beginPath();
                ctx.arc(target.x, target.y, flashR, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            if (k < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                onDone();
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [start.x, start.y, color, durationMs, onDone]);

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
}
