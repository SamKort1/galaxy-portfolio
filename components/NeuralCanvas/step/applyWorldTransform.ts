import type { StepEnv } from "./env";

export function applyWorldTransform(env: StepEnv) {
    const { ctx, transform } = env;

    // World transform
    ctx.translate(transform.tx, transform.ty);
    ctx.scale(transform.sx, transform.sy);
}
