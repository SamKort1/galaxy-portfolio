import type { StepEnv } from "./env";

export function physicsIntegrate(env: StepEnv, dt: number) {
    const { graph, CALM, blackholeActive } = env;
    const { nodes } = graph.current;

    for (const n of nodes) {
        // Apply physics to hubs always, and to satellites when blackhole is active
        if (!n.isHub && !blackholeActive) continue;
        
        // Apply damping - use less damping for satellites under blackhole influence
        if (!n.isHub && blackholeActive) {
            n.vx *= 0.95; // Less damping for satellites during blackhole
            n.vy *= 0.95;
        } else {
            n.vx *= CALM.damping;
            n.vy *= CALM.damping;
        }
        
        // For satellites under blackhole influence, use direct velocity integration
        if (!n.isHub && blackholeActive) {
            n.x += n.vx * dt;
            n.y += n.vy * dt;
        } else {
            // For hubs, use the original integration method
            n.x += n.vx / (1 / dt);
            n.y += n.vy / (1 / dt);
        }

        if (n.pulse !== undefined) {
            n.pulse = Math.min(1, (n.pulse || 0) + dt * 1.6);
            if (n.pulse >= 1) n.pulse = undefined;
        }
    }
}
