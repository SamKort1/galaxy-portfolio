import type { StepEnv } from "./env";

export function drawEdges(env: StepEnv, t:number) {
    const { ctx, graph, hoverId, hoverCluster, CALM, clusters } = env;
    const { nodes, edges } = graph.current;

    // -------- Draw edges --------
    const ping = (tt: number) => (Math.sin(tt * CALM.edgePulseFreq) + 1) * 0.5;
    const time = t / 1000;
    for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const isHoverEdge =
            hoverId !== null &&
            (e.a === hoverId ||
                e.b === hoverId ||
                (a.isHub && a.clusterId === hoverCluster) ||
                (b.isHub && b.clusterId === hoverCluster));
        const isClusterEdge =
            hoverCluster && !e.cross && a.clusterId === hoverCluster && b.clusterId === hoverCluster;

        const alphaBase = e.cross ? 0.02 : CALM.edgeBaseAlpha;
        const alpha = isHoverEdge || isClusterEdge ? 0.38 : alphaBase + ping(time) * CALM.edgePulseAmp;

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
