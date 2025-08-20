import type { StepEnv } from "./env";

export function drawEdges(env: StepEnv, t:number) {
    const { ctx, graph, hoverId, hoverCluster, CALM, clusters, blackholeActive, blackholeX, blackholeY, blackholeRadius, timeRef } = env;
    const { nodes, edges } = graph.current;

    // Draw edges
    const ping = (tt: number) => (Math.sin(tt * CALM.edgePulseFreq) + 1) * 0.5;
    const time = t / 1000;
    for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        
        // Skip consumed edges
        if (a.r <= 0 || b.r <= 0) continue;
        
        const isHoverEdge =
            hoverId !== null &&
            (e.a === hoverId ||
                e.b === hoverId ||
                (a.isHub && a.clusterId === hoverCluster) ||
                (b.isHub && b.clusterId === hoverCluster));
        const isClusterEdge =
            hoverCluster && !e.cross && a.clusterId === hoverCluster && b.clusterId === hoverCluster;

        const alphaBase = e.cross ? 0.02 : CALM.edgeBaseAlpha;
        let alpha = isHoverEdge || isClusterEdge ? 0.38 : alphaBase + ping(time) * CALM.edgePulseAmp;

        // Blackhole distortion
        if (blackholeActive) {
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const dx = blackholeX - midX;
            const dy = blackholeY - midY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < blackholeRadius * 5) { // Fade radius
                // Edges fade near blackhole
                const fadeFactor = Math.max(0, 1 - (blackholeRadius * 5 - distance) / (blackholeRadius * 5));
                alpha *= fadeFactor * 0.3; // Fade effect
                
                // Add distortion
                const distortion = Math.sin(timeRef.current * 2) * 3 * fadeFactor;
                const angle = Math.atan2(dy, dx);
                const distortedMidX = midX + Math.cos(angle) * distortion;
                const distortedMidY = midY + Math.sin(angle) * distortion;
                
                // Draw edge
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
                ctx.lineWidth = e.cross ? 0.6 : 1.1;
                ctx.moveTo(a.x, a.y);
                ctx.quadraticCurveTo(distortedMidX, distortedMidY, b.x, b.y);
                ctx.stroke();
                continue;
            }
        }

        let stroke = `rgba(255,255,255,${alpha.toFixed(3)})`;
        if (!e.cross && (isHoverEdge || isClusterEdge)) {
            const c = clusters.find((c) => c.id === a.clusterId)!.color;
            const r = parseInt(c.slice(1, 3), 16),
                g = parseInt(c.slice(3, 5), 16),
                bcol = parseInt(c.slice(5, 7), 16);
            stroke = `rgba(${r},${g},${bcol},${alpha})`;
        }
        ctx.beginPath();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = e.cross ? 0.6 : 1.1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }
}
