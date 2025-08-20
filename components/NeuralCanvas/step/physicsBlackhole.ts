import type { StepEnv } from "./env";

export function physicsBlackhole(env: StepEnv, dt: number) {
    const { graph, blackholeActive, blackholeX, blackholeY, blackholeRadius, blackholeStrength } = env;
    
    if (!blackholeActive) return;
    
    const { nodes, edges } = graph.current;
    
    // Apply gravitational force to ALL satellites (not hubs)
    for (const node of nodes) {
        if (node.isHub) continue; // Don't affect hubs
        
        const dx = blackholeX - node.x;
        const dy = blackholeY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Ensure we don't divide by zero
        if (distance < 1) continue;
        
        // Affect ALL satellites regardless of distance (infinite range)
        // Calculate gravitational force (inverse square law) - make it strong but controlled
        const force = (blackholeStrength * 5) / Math.max(1, distance * distance);
        
        // Apply force towards blackhole - controlled pull with velocity capping
        node.vx += (dx / distance) * force * dt * 90; // Strong but controlled effect
        node.vy += (dy / distance) * force * dt * 90;
        
        // Cap velocity to prevent overshooting
        const maxVelocity = 200;
        const currentVelocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (currentVelocity > maxVelocity) {
            const scale = maxVelocity / currentVelocity;
            node.vx *= scale;
            node.vy *= scale;
        }
        
        // Start consuming when close to blackhole
        if (distance < blackholeRadius * 0.8) { // Slightly larger consumption radius
            // Gradually reduce node size and alpha
            node.r = Math.max(0, node.r - dt * 12); // Faster consumption
            
            // Add particle effects for consumption
            if (Math.random() < 0.4) { // Moderate particle spawn rate
                // Create consumption particles
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 5; // Moderate particle speed
                const particle = {
                    x: node.x,
                    y: node.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0,
                    maxLife: 1 + Math.random(),
                    r: 1 + Math.random() * 4, // Moderate particle size
                    hue: Math.random() * 60 + 200 // Blue to purple range
                };
                
                // Add to shooting stars array for rendering
                env.shootingRef.current.push(particle);
            }
            
            // Mark node for removal when fully consumed
            if (node.r <= 0) {
                node.r = 0;
                // Hide the node completely
                node.x = -1000; // Move far off screen
                node.y = -1000;
            }
        }
    }
    
    // Gradually reduce edge visibility near blackhole
    for (const edge of edges) {
        const nodeA = nodes[edge.a];
        const nodeB = nodes[edge.b];
        
        if (!nodeA || !nodeB) continue;
        
        const midX = (nodeA.x + nodeB.x) / 2;
        const midY = (nodeA.y + nodeB.y) / 2;
        
        const dx = blackholeX - midX;
        const dy = blackholeY - midY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < blackholeRadius * 3) {
            // Edges get distorted and fade near blackhole
            edge.cross = distance < blackholeRadius; // Mark for special rendering
        }
    }
}
