import type { StepEnv } from "./env";

export function updateShootingStars(env: StepEnv, dt: number) {
    const { ctx, shootingRef } = env;

    for (let i = shootingRef.current.length - 1; i >= 0; i--) {
        const s = shootingRef.current[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life += dt;

        if (s.life > s.maxLife) {
            shootingRef.current.splice(i, 1);
            continue;
        }

        const tLife = s.life / s.maxLife;
        const alpha = tLife < 0.2 ? tLife / 0.2 : 1 - (tLife - 0.2) / 0.8;

        // star head
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // short glowing trail
        const grad = ctx.createLinearGradient(
            s.x, s.y,
            s.x - s.vx * 0.06, s.y - s.vy * 0.06
        );
        grad.addColorStop(0, `rgba(255,255,255,${0.5 * alpha})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.06, s.y - s.vy * 0.06);
        ctx.stroke();
    }
}
