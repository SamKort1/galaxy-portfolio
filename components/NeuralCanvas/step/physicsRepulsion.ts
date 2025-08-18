import type { StepEnv } from "./env";

export function physicsRepulsion(env: StepEnv) {
    const { graph } = env;
    const { nodes } = graph.current;

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            if (!a.isHub && !b.isHub) continue;

            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            const minDist = a.r + b.r + 14;
            if (d2 < minDist * minDist && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const force = (minDist - d) * 0.01;
                const nx = dx / d, ny = dy / d;
                a.vx += nx * force; a.vy += ny * force;
                b.vx -= nx * force; b.vy -= ny * force;
            }
        }
    }
}
