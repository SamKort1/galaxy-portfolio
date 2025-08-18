import type { StepEnv } from "./env";

export function physicsIntegrate(env: StepEnv, dt: number) {
    const { graph, CALM } = env;
    const { nodes } = graph.current;

    for (const n of nodes) {
        if (!n.isHub) continue;
        n.vx *= CALM.damping;
        n.vy *= CALM.damping;
        n.x += n.vx / (1 / dt);
        n.y += n.vy / (1 / dt);

        if (n.pulse !== undefined) {
            n.pulse = Math.min(1, (n.pulse || 0) + dt * 1.6);
            if (n.pulse >= 1) n.pulse = undefined;
        }
    }
}
