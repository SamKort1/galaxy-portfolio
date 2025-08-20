import type { StepEnv } from "./env";

export function clearAndPrepCanvas(env: StepEnv) {
    const { ctx, canvas, DPR } = env;

    // Clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgb(10,10,15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(DPR, DPR);

    ctx.restore();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
