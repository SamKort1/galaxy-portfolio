export function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function drawPillLabelAlpha(
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

export function clipText(ctx: CanvasRenderingContext2D, text: string, max: number) {
    if (ctx.measureText(text).width <= max) return text;
    // quick ellipsis clip
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
    return t + "…";
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
