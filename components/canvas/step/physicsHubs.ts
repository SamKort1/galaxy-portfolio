import type { StepEnv } from "./env";

export function physicsHubs(env: StepEnv, dt: number) {
    const { graph, anchors, CALM, prefersReducedMotion, attract } = env;
    const { nodes } = graph.current;

    // Hubs: gentle physics only
    for (const n of nodes) {
        if (!n.isHub) continue;
        const anchor = anchors.current[n.clusterId];
        if (anchor) {
            // attract() is your existing helper
            attract(n, anchor, CALM.hubAttract);
        }
        if (!prefersReducedMotion) {
            n.vx += (Math.random() - 0.5) * CALM.hubJiggle;
            n.vy += (Math.random() - 0.5) * CALM.hubJiggle;
        }
    }
}
