import type { StepEnv } from "./env";
import {drawHubFancy, drawHubLabel, drawOrbitalNode} from "./drawHelpers";

export function drawNodes(env: StepEnv) {
    const { ctx, graph, hoverId, hoverCluster, clusters, timeRef, labelFadeAlpha } = env;
    const { nodes } = graph.current;

    for (const n of nodes) {
        const isHover = hoverId === n.id || (hoverCluster === n.clusterId && n.isHub);
        const baseAlpha = n.isHub ? 0.9 : 0.8;
        const alpha = isHover ? 1 : baseAlpha;

        // resolve cluster color hex (for hubs & sats)
        let clusterHex = "#c8c8dc"; // fallback neutral
        const cluster = clusters.find((c) => c.id === n.clusterId);
        if (cluster) clusterHex = cluster.color;

        if (n.isHub) {
            drawHubFancy(
                ctx,
                n.x,
                n.y,
                n.r,
                clusterHex,
                hoverCluster === n.clusterId,
                timeRef.current
            );

            // Draw hub labels with fade animation
            const label = cluster?.name ?? n.clusterId;
            const [r, g, b] = [
                parseInt(clusterHex.slice(1, 3), 16),
                parseInt(clusterHex.slice(3, 5), 16),
                parseInt(clusterHex.slice(5, 7), 16),
            ];
            
            // Apply fade alpha to labels
            ctx.save();
            ctx.globalAlpha = labelFadeAlpha;
            drawHubLabel(ctx, n.x, n.y, label, { r, g, b }, hoverCluster === n.clusterId);
            ctx.restore();
        } else {
            // Skip drawing satellites that have been consumed by blackhole
            if (n.r <= 0) continue;
            
            // Satellite: subtle glow + twinkle
            ctx.save();
            ctx.globalAlpha = alpha;
            drawOrbitalNode(ctx, n.x, n.y, Math.max(2, n.r), clusterHex, timeRef.current, {
                outline: false,
                innerGlow: true,
                twinkle: true,
            });
            ctx.restore();
        }
    }
}
