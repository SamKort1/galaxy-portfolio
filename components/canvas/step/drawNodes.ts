import type { StepEnv } from "./env";
import {drawHubFancy, drawHubLabel, drawOrbitalNode} from "./drawHelpers";

export function drawNodes(env: StepEnv) {
    const { ctx, graph, hoverId, hoverCluster, clusters, timeRef } = env;
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
                hoverCluster === (n.clusterId as any),
                timeRef.current
            );

            const label = cluster?.name ?? n.clusterId;
            const [r, g, b] = [
                parseInt(clusterHex.slice(1, 3), 16),
                parseInt(clusterHex.slice(3, 5), 16),
                parseInt(clusterHex.slice(5, 7), 16),
            ];
            drawHubLabel(ctx, n.x, n.y, label, { r, g, b });
        } else {
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
