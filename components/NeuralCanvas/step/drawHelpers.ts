export function hexToRGB(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
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

    const pulse = 0.25 + 0.15 * Math.sin(time * 2);
    const rr = hovered ? Math.min(255, cr + 35) : cr;
    const gg = hovered ? Math.min(255, cg + 35) : cg;
    const bb = hovered ? Math.min(255, cb + 35) : cb;

    // Refined outer aura with reduced intensity
    const aura1 = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    aura1.addColorStop(0, `rgba(${rr},${gg},${bb},${0.08 + pulse * 0.04})`);
    aura1.addColorStop(0.4, `rgba(${Math.min(255, rr + 15)},${Math.min(255, gg + 15)},${Math.min(255, bb + 15)},${0.04 + pulse * 0.02})`);
    aura1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura1;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    const aura2 = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
    aura2.addColorStop(0, `rgba(${rr},${gg},${bb},${0.15 + pulse * 0.05})`);
    aura2.addColorStop(0.7, `rgba(${rr},${gg},${bb},0.05)`);
    aura2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = aura2;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle shadow for depth
    ctx.save();
    ctx.shadowColor = `rgba(${rr},${gg},${bb},0.4)`;
    ctx.shadowBlur = hovered ? 15 : 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = hovered ? 4 : 2;

    // Ultra-smooth core with advanced gradients
    const coreOuter = ctx.createRadialGradient(x, y, 0, x, y, r * 1.1);
    coreOuter.addColorStop(0, `rgba(${rr},${gg},${bb},0.98)`);
    coreOuter.addColorStop(0.7, `rgba(${rr},${gg},${bb},0.9)`);
    coreOuter.addColorStop(1, `rgba(${rr},${gg},${bb},0.7)`);
    ctx.fillStyle = coreOuter;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Inner core with ultra-bright center
    const coreInner = ctx.createRadialGradient(x, y, 0, x, y, r * 0.7);
    coreInner.addColorStop(0, `rgba(${Math.min(255, rr + 50)},${Math.min(255, gg + 50)},${Math.min(255, bb + 50)},1)`);
    coreInner.addColorStop(0.5, `rgba(${rr},${gg},${bb},0.95)`);
    coreInner.addColorStop(1, `rgba(${rr},${gg},${bb},0.8)`);
    ctx.fillStyle = coreInner;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Ultra-bright center highlight with glow
    const highlight = ctx.createRadialGradient(x, y, 0, x, y, r * 0.35);
    highlight.addColorStop(0, `rgba(255,255,255,0.6)`);
    highlight.addColorStop(0.7, `rgba(255,255,255,0.2)`);
    highlight.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Ultra-cool inner highlight ring with glow
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.8)`;
    ctx.lineWidth = 2;
    ctx.arc(x, y, r + 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // Outer definition ring
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${rr},${gg},${bb},0.3)`;
    ctx.lineWidth = 1;
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Refined tech spokes with reduced intensity
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    const spokes = 8; // Fewer spokes for cleaner look
    for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2 + time * 0.3;
        const spokeAlpha = 0.5 + 0.3 * Math.sin(time * 2 + i * 0.3);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2));
        ctx.lineTo(x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12));
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},${spokeAlpha})`;
        ctx.stroke();
    }
    ctx.restore();

    // Refined energy rings with subtle animation
    const ringCount = 2;
    for (let i = 0; i < ringCount; i++) {
        const ringRadius = r + 8 + i * 6;
        const ringAlpha = 0.15 - i * 0.05;
        const ringPulse = Math.sin(time * 1.5 + i * 0.5) * 0.03;
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rr},${gg},${bb},${ringAlpha + ringPulse})`;
        ctx.lineWidth = 0.6;
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Subtle particle effects around the hub
    const particleCount = 4;
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.8;
        const particleRadius = r + 10 + Math.sin(time * 1.2 + i) * 2;
        const px = x + Math.cos(angle) * particleRadius;
        const py = y + Math.sin(angle) * particleRadius;
        const particleAlpha = 0.2 + 0.1 * Math.sin(time * 2 + i);
        
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${particleAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawOrbitalNode(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number, // node radius (not orbit radius)
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

    if (opts?.lineToHub) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.18)`;
        ctx.lineWidth = 1;
        ctx.moveTo(opts.lineToHub.hx, opts.lineToHub.hy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // orbit guide
        if (opts.lineToHub.orbitRadius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.12)`;
            ctx.lineWidth = 1;
            ctx.arc(opts.lineToHub.hx, opts.lineToHub.hy, opts.lineToHub.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Refined outer glow with reduced intensity
    const grad1 = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    grad1.addColorStop(0, `rgba(${cr},${cg},${cb},0.2)`);
    grad1.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.1)`);
    grad1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    const grad2 = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    grad2.addColorStop(0, `rgba(${cr},${cg},${cb},0.25)`);
    grad2.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.12)`);
    grad2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Enhanced core with better gradients
    const core = ctx.createRadialGradient(x, y, 0, x, y, radius);
    core.addColorStop(0, `rgba(${Math.min(255, cr + 30)},${Math.min(255, cg + 30)},${Math.min(255, cb + 30)},0.95)`);
    core.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.85)`);
    core.addColorStop(1, `rgba(${cr},${cg},${cb},0.6)`);
    ctx.fillStyle = core;
    ctx.beginPath();
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

    // Enhanced inner glow
    if (opts?.innerGlow) {
        const ig = ctx.createRadialGradient(x, y, 0, x, y, radius);
        ig.addColorStop(0, `rgba(255,255,255,0.6)`);
        ig.addColorStop(0.5, `rgba(255,255,255,0.2)`);
        ig.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Enhanced twinkle with multiple layers
    if (opts?.twinkle) {
        const tw = 0.55 + 0.45 * Math.sin((x + y) * 0.03 + time * 3.0);
        ctx.save();
        ctx.globalAlpha = 0.6 * tw;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.arc(x, y, Math.max(1, radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Additional twinkle ring
        const twinkleRing = 0.3 + 0.2 * Math.sin((x + y) * 0.05 + time * 2.5);
        ctx.save();
        ctx.globalAlpha = 0.4 * twinkleRing;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
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


export function drawSkillChip(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    opts: {
        r: number;
        g: number;
        b: number;
        time?: number;
        hover?: boolean;
        padX?: number;
        padY?: number;
    }
) {
    const { r, g, b, time = 0, hover = false, padX = 8, padY = 4 } = opts;

    const w = ctx.measureText(label).width + padX * 2;
    const h = padY;
    const pulse = 0.25 + 0.15 * Math.sin(time * 2);
    const alpha = hover ? 0.9 : 0.7;

    // subtle glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, w * 0.6);
    grad.addColorStop(0, `rgba(${r},${g},${b},${0.15 + pulse * 0.05})`);
    grad.addColorStop(0.8, `rgba(${r},${g},${b},0.05)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, w * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle shadow for depth
    ctx.save();
    ctx.shadowColor = `rgba(${r},${g},${b},0.3)`;
    ctx.shadowBlur = hover ? 8 : 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = hover ? 2 : 1;

    // chip background with enhanced gradient
    const chipGrad = ctx.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    chipGrad.addColorStop(0, `rgba(${r},${g},${b},${alpha + 0.02})`);
    chipGrad.addColorStop(0.5, `rgba(${Math.min(255, r + 10)},${Math.min(255, g + 10)},${Math.min(255, b + 10)},${alpha})`);
    chipGrad.addColorStop(1, `rgba(${r},${g},${b},${alpha - 0.02})`);
    
    ctx.fillStyle = chipGrad;
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
    
    ctx.restore();

    // label
    ctx.fillStyle = "white";
    ctx.font = "11px Inter, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y);
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

    // subtle aura
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
    grad.addColorStop(0, `rgba(${rr},${g},${b},0.15)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 2, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle shadow for depth
    ctx.save();
    ctx.shadowColor = `rgba(${rr},${g},${b},0.3)`;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // gem core
    ctx.fillStyle = `rgba(${rr},${g},${b},0.9)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

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
    { r, g, b }: { r: number; g: number; b: number },
    hovered: boolean = false
) {
    ctx.font = "600 16px Inter, ui-sans-serif, system-ui, sans-serif";
    const padX = 12;
    const textW = ctx.measureText(label).width;
    const w = textW + padX * 2;
    const h = 28;
    const left = x - w / 2;
    const top = y - h - 30;

    // Enhanced gradient with better depth
    const grad = ctx.createLinearGradient(left, top, left, top + h);
    grad.addColorStop(0, `rgba(${r},${g},${b},${hovered ? 0.45 : 0.35})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${hovered ? 0.25 : 0.2})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},${hovered ? 0.15 : 0.1})`);

    // Add subtle shadow for depth
    ctx.save();
    ctx.shadowColor = `rgba(${r},${g},${b},0.3)`;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    roundRectPath(ctx, left, top, w, h, 14);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();

    // Enhanced border
    ctx.strokeStyle = `rgba(${r},${g},${b},${hovered ? 0.8 : 0.6})`;
    ctx.lineWidth = hovered ? 1.5 : 1;
    ctx.stroke();

    // Enhanced text with subtle shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    
    ctx.fillStyle = "rgba(245,248,255,0.95)";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(label, x, top + h / 2);
    
    ctx.restore();
}

