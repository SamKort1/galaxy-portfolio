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
import { physicsBlackhole } from "./physicsBlackhole";
import { drawEdges } from "./drawEdges";
import { drawNodes } from "./drawNodes";
import { drawExpandedCluster } from "./drawExpandedCluster";
import { drawBlackhole } from "./drawHelpers";

export function runStep(env: StepEnv, t: number, last: number) {
    const dt = Math.min(0.033, (t - last) / 1000);
    const newLast = t;

    env.timeRef.current += dt;

    clearAndPrepCanvas(env);
    spawnShootingStars(env);
    updateShootingStars(env, dt);
    backgroundTint(env);
    applyWorldTransform(env);
    
    // Apply blackhole physics FIRST so it takes precedence
    physicsBlackhole(env, dt);
    
    // Then apply other physics
    physicsSatellites(env, dt);
    physicsHubs(env);
    physicsRepulsion(env);
    physicsIntegrate(env, dt);
    
    drawEdges(env, t);
    drawNodes(env);
    drawExpandedCluster(env);
    
    // Draw blackhole if active
    if (env.blackholeActive) {
        drawBlackhole(env.ctx, env.blackholeX, env.blackholeY, env.blackholeVisualRadius, env.blackholeStrength, env.timeRef.current);
    }

    return newLast;
}
