import type { StepEnv } from "./env";

export function physicsSatellites(env: StepEnv, dt: number) {
    const { graph, anchors, CALM, prefersReducedMotion, timeRef, blackholeActive } = env;
    const { nodes } = graph.current;

    // Skip orbital physics during blackhole
    if (blackholeActive) return;

    // Physics setup
    const awPhase = timeRef.current * CALM.anchorWobbleFreq;
    const wobbleXY = (id: string) => ({
        x: CALM.anchorWobbleAmp * Math.cos(awPhase + (id.charCodeAt(0) % 7)),
        y: CALM.anchorWobbleAmp * Math.sin(awPhase + (id.charCodeAt(1) % 7)),
    });

    // Satellites: calm orbits
    for (const n of nodes) {
        if (!n.isHub) {
            const baseAnchor = anchors.current[n.clusterId];
            if (!baseAnchor) continue;

            const wob = wobbleXY(n.clusterId);
            const anchor = { x: baseAnchor.x + wob.x, y: baseAnchor.y + wob.y };

            const speed = (n.omega ?? CALM.orbitOmegaMin) * (prefersReducedMotion ? 0.5 : 1);
            n.theta = (n.theta ?? 0) + speed * dt;

            const breathe = CALM.orbitWobbleAmp * Math.sin(timeRef.current * CALM.orbitWobbleFreq + (n.phase ?? 0));
            const radius = (n.baseR ?? 100) + breathe;

            n.x = anchor.x + Math.cos(n.theta) * radius;
            n.y = anchor.y + Math.sin(n.theta) * radius;

            // Reset velocity
            n.vx = 0;
            n.vy = 0;
        }
    }
}
