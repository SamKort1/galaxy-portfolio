import type { StepEnv } from "./env";
import { clearAndPrepCanvas } from "./clearAndPrepCanvas";
import { spawnShootingStars } from "./spawnShootingStars";
import { updateShootingStars } from "./updateShootingStars";
import { backgroundTint } from "./backgroundTint";
import { applyWorldTransform } from "./applyWorldTransform";
import { physicsSatellites } from "./physicsSatellites";
import { physicsHubs } from "./physicsHubs";
import { physicsRepulsion } from "./physicsRepulsion";
import { physicsIntegrate } from "./physicsIntegrate";
import { drawEdges } from "./drawEdges";
import { drawNodes } from "./drawNodes";
import { drawExpandedCluster } from "./drawExpandedCluster";

export function runStep(env: StepEnv, t: number, last: number) {
    const dt = Math.min(0.033, (t - last) / 1000);
    const newLast = t;

    env.timeRef.current += dt;

    // keep the exact order
    clearAndPrepCanvas(env);
    spawnShootingStars(env);
    updateShootingStars(env, dt);
    backgroundTint(env);
    applyWorldTransform(env);
    physicsSatellites(env, dt);
    physicsHubs(env, dt);
    physicsRepulsion(env);
    physicsIntegrate(env, dt);
    drawEdges(env, t);
    drawNodes(env);
    drawExpandedCluster(env);

    return newLast;
}
