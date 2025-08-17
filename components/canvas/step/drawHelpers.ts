// drawHelpers.ts
export function hexToRGB(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
}

export function drawLabelPill(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    maxWidth = 260,
    pad = 8
) {
    ctx.save();
    ctx.font = "12px Inter, ui-sans-serif, system-ui, sans-serif";
    // clip text to fit
    let t = text;
    while (ctx.measureText(t + "…").width > maxWidth - pad * 2 && t.length > 1) t = t.slice(0, -1);
    const clipped = ctx.measureText(text).width > maxWidth - pad * 2 ? t + "…" : text;

    const w = Math.min(ctx.measureText(clipped).width + pad * 2, maxWidth);
    const h = 20;
    const rx = 8;
    const left = x - w / 2;
    const top = y - h - 12;

    // pill bg
    roundRectPath(ctx, left, top, w, h, rx);
    ctx.fillStyle = "rgba(16,18,28,0.45)";
    ctx.fill();

    // text
    ctx.fillStyle = "rgba(235,240,255,0.92)";
    ctx.fillText(clipped, left + pad, top + h - 6);
    ctx.restore();
}

export function drawHubFancy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    colorHex: string,
    hovered: boolean,
    time: number
) {
    const [cr, cg, cb] = hexToRGB(colorHex);

    // outer soft aura (breathing)
    const pulse = 0.25 + 0.15 * Math.sin(time * 2);
    const rr = hovered ? Math.min(255, cr + 35) : cr;
    const gg = hovered ? Math.min(255, cg + 35) : cg;
    const bb = hovered ? Math.min(255, cb + 35) : cb;

    const aura = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    aura.addColorStop(0, `rgba(${rr},${gg},${bb},${0.22 + pulse})`);
    aura.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // core
    const core = ctx.createRadialGradient(x, y, 0, x, y, r);
    core.addColorStop(0, `rgba(${rr},${gg},${bb},0.95)`);
    core.addColorStop(1, `rgba(${rr},${gg},${bb},0.75)`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // inner highlight ring
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.55)`;
    ctx.lineWidth = 2;
    ctx.arc(x, y, r + 2, 0, Math.PI * 2);
    ctx.stroke();

    // subtle spokes (tech vibe)
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 1;
    const spokes = 8;
    for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2 + time * 0.4;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3));
        ctx.lineTo(x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14));
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.7)`;
        ctx.stroke();
    }
    ctx.restore();
}

export function drawOrbitalNode(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,        // node radius (not orbit radius)
    colorHex: string,
    time: number,
    opts?: {
        outline?: boolean;
        innerGlow?: boolean;
        twinkle?: boolean;
        lineToHub?: { hx: number; hy: number; orbitRadius?: number };
    }
) {
    const [cr, cg, cb] = hexToRGB(colorHex);

    // optional faint line to hub or orbit ring anchor
    if (opts?.lineToHub) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.18)`;
        ctx.lineWidth = 1;
        ctx.moveTo(opts.lineToHub.hx, opts.lineToHub.hy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // orbit guide (optional)
        if (opts.lineToHub.orbitRadius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.12)`;
            ctx.lineWidth = 1;
            ctx.arc(opts.lineToHub.hx, opts.lineToHub.hy, opts.lineToHub.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // outer glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.28)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // core
    ctx.beginPath();
    ctx.fillStyle = `rgba(${cr},${cg},${cb},0.92)`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // outline
    if (opts?.outline) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.6)`;
        ctx.lineWidth = 1.25;
        ctx.arc(x, y, radius + 1.5, 0, Math.PI * 2);
        ctx.stroke();
    }

    // inner glow
    if (opts?.innerGlow) {
        const ig = ctx.createRadialGradient(x, y, 0, x, y, radius);
        ig.addColorStop(0, "rgba(255,255,255,0.55)");
        ig.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // twinkle
    if (opts?.twinkle) {
        const tw = 0.55 + 0.45 * Math.sin((x + y) * 0.03 + time * 3.0);
        ctx.save();
        ctx.globalAlpha = 0.6 * tw;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.arc(x, y, Math.max(1, radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/** small rounded-rect helper */
export function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
}


// drawHelpers.ts

export function drawSkillChip(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    color: { r: number; g: number; b: number; time?: number; hover?: boolean }
) {
    const { r, g, b, time = 0, hover = false } = color;

    const w = ctx.measureText(label).width + 16;
    const h = 22;
    const pulse = 0.25 + 0.15 * Math.sin(time * 2);
    const alpha = hover ? 0.9 : 0.7;

    // glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, w);
    grad.addColorStop(0, `rgba(${r},${g},${b},${0.25 + pulse})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, w, 0, Math.PI * 2);
    ctx.fill();

    // chip background
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + radius, y - h / 2);
    ctx.lineTo(x + w / 2 - radius, y - h / 2);
    ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + radius);
    ctx.lineTo(x + w / 2, y + h / 2 - radius);
    ctx.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - radius, y + h / 2);
    ctx.lineTo(x - w / 2 + radius, y + h / 2);
    ctx.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - radius);
    ctx.lineTo(x - w / 2, y - h / 2 + radius);
    ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + radius, y - h / 2);
    ctx.closePath();
    ctx.fill();

    // label
    ctx.fillStyle = "white";
    ctx.font = "11px Inter, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x - ctx.measureText(label).width / 2, y);
}

export function drawProjectGem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: { r: number; g: number; b: number },
    opts: {
        innerGlow?: boolean;
        flare?: boolean;
        outline?: boolean;
        time?: number;
        ringOnFirstView?: boolean;
    } = {}
) {
    const { r: rr, g, b } = color;
    const { innerGlow, flare, outline, time = 0, ringOnFirstView } = opts;

    // soft aura
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    grad.addColorStop(0, `rgba(${rr},${g},${b},0.25)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();

    // gem core
    ctx.fillStyle = `rgba(${rr},${g},${b},0.9)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // inner glow
    if (innerGlow) {
        const ig = ctx.createRadialGradient(x, y, 0, x, y, r);
        ig.addColorStop(0, `rgba(255,255,255,0.4)`);
        ig.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // flare
    if (flare) {
        ctx.strokeStyle = `rgba(255,255,255,0.5)`;
        ctx.lineWidth = 1;
        const flareSize = r + 6 + Math.sin(time * 3) * 2;
        ctx.beginPath();
        ctx.arc(x, y, flareSize, 0, Math.PI * 2);
        ctx.stroke();
    }

    // outline
    if (outline) {
        ctx.strokeStyle = `rgba(${rr},${g},${b},0.6)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, r + 0.5, 0, Math.PI * 2);
        ctx.stroke();
    }

    // pulse ring (first time)
    if (ringOnFirstView) {
        const pulse = 1 + 0.1 * Math.sin(time * 3);
        ctx.strokeStyle = `rgba(${rr},${g},${b},0.35)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r * pulse + 4, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export function drawHubLabel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    { r, g, b }: { r: number; g: number; b: number }
) {
    ctx.font = "600 16px Inter, ui-sans-serif, system-ui, sans-serif";
    const padX = 12;
    const padY = 6;
    const textW = ctx.measureText(label).width;
    const w = textW + padX * 2;
    const h = 28;
    const left = x - w / 2;
    const top = y - h - 30;

    // background pill with glow
    const grad = ctx.createLinearGradient(left, top, left, top + h);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.15)`);

    ctx.beginPath();
    roundRectPath(ctx, left, top, w, h, 14);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // text
    ctx.fillStyle = "rgba(245,248,255,0.95)";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x - textW / 2, top + h / 2);
}

