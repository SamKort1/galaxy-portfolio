import type { StepEnv } from "./env";

export function clearAndPrepCanvas(env: StepEnv) {
    const { ctx, canvas, DPR } = env;

    // -------- 1) CLEAR at device pixel resolution --------
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgb(10,10,15)"; // dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // from here scale into CSS pixel space
    ctx.save();
    ctx.scale(DPR, DPR);

    ctx.restore();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
