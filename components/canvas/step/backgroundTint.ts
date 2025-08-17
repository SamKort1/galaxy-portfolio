import type { StepEnv } from "./env";

export function backgroundTint(env: StepEnv) {
    const { expandedCluster, clusters, ctx, size } = env;

    // -------- 2) Background tint (now safe; no compensation math needed) --------
    if (expandedCluster) {
        const c = clusters.find((c) => c.id === expandedCluster)!.color;
        const r = parseInt(c.slice(1, 3), 16),
            g = parseInt(c.slice(3, 5), 16),
            bcol = parseInt(c.slice(5, 7), 16);
        const grad = ctx.createRadialGradient(
            size.w / 2, size.h / 2, 0,
            size.w / 2, size.h / 2, Math.max(size.w, size.h) * 0.6
        );
        grad.addColorStop(0, `rgba(${r},${g},${bcol},0.08)`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size.w, size.h);
    }
}
