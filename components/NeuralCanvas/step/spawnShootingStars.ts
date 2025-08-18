import type { StepEnv } from "./env";

export function spawnShootingStars(env: StepEnv) {
    const { shootingRef, SHOOTING_COUNT, size } = env;

    if (Math.random() < 0.01 && shootingRef.current.length < SHOOTING_COUNT) {
        const angle = Math.random() * (Math.PI / 3) + Math.PI * 0.9; // downward angles
        const speed = 300 + Math.random() * 400;
        shootingRef.current.push({
            x: Math.random() * size.w,
            y: 400 - Math.random() * 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 2.5 + Math.random() * 1.5,
            r: 0,
            hue: 0
        });
    }
}
