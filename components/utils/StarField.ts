export type BackgroundStar = {
    x: number;
    y: number;
    r: number;     // radius
    a: number;     // alpha
    amp: number;   // twinkle amplitude
    freq: number;  // twinkle frequency
    phase: number;
};

/**
 * Generate stars for a canvas of size w x h
 */
export function generateBackgroundStarfield(w: number, h: number): BackgroundStar[] {
    const STAR_DENSITY = 1 / 12000;
    const count = Math.max(60, Math.round(w * h * STAR_DENSITY));
    const s: BackgroundStar[] = [];
    for (let i = 0; i < count; i++) {
        s.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.6 + 0.6,
            a: Math.random() * 0.35 + 0.15,
            amp: Math.random() * 0.25,
            freq: 0.5 + Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2,
        });
    }
    return s;
}

/**
 * Draw the starfield with glow + twinkle
 */
export function drawBackgroundStarfield(
    ctx: CanvasRenderingContext2D,
    stars: BackgroundStar[],
    time: number
) {
    for (const s of stars) {
        const twinkle =
            1 + s.amp * Math.sin(time * s.freq * 2 * Math.PI + s.phase);
        const innerA = s.a * twinkle;

        // Glow
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        grad.addColorStop(0, `rgba(235,240,255,${innerA})`);
        grad.addColorStop(1, `rgba(235,240,255,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // center
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, innerA + 0.2)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
}
