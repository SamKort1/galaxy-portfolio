import type { StepEnv } from "./env";

export function physicsBlackhole(env: StepEnv, dt: number) {
    const { graph, blackholeActive, blackholeX, blackholeY, blackholeRadius, blackholeStrength } = env;
    
    const { nodes, edges } = graph.current;
    
    // Reset edge properties when blackhole inactive
    if (!blackholeActive) {
        for (const edge of edges) {
            // Reset if blackhole-affected (preserve original edges)
            if (edge.blackholeAffected) {
                edge.cross = edge.originalCross;
                edge.blackholeAffected = false;
            }
        }
        return;
    }
    
    // Apply gravitational force to satellites (not hubs)
    for (const node of nodes) {
        if (node.isHub) continue; // Don't affect hubs
        
        const dx = blackholeX - node.x;
        const dy = blackholeY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Ensure we don't divide by zero
        if (distance < 1) continue;
        
        // Affect all satellites (infinite range)
        // Calculate gravitational force (inverse square law)
        const force = (blackholeStrength * 5) / Math.max(1, distance * distance);
        
        // Apply force towards blackhole
        node.vx += (dx / distance) * force * dt * 600; // Velocity effect
        node.vy += (dy / distance) * force * dt * 600;
        
        // Cap velocity
        const maxVelocity = 400;
        const currentVelocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (currentVelocity > maxVelocity) {
            const scale = maxVelocity / currentVelocity;
            node.vx *= scale;
            node.vy *= scale;
        }
        
        // Consume when close
        if (distance < blackholeRadius * 0.4) {
            // Reduce node size and alpha
            node.r = Math.max(0, node.r - dt * 12);
            

            if (Math.random() < 0.4) {
                // Create particles
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 5; // Particle speed
                const particle = {
                    x: node.x,
                    y: node.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0,
                    maxLife: 1 + Math.random(),
                    r: 1 + Math.random() * 4, // Particle size
                    hue: Math.random() * 60 + 200 // Blue to purple range
                };
                
                // Add to shooting stars
                env.shootingRef.current.push(particle);
            }
            
            // Mark for removal
            if (node.r <= 0) {
                node.r = 0;
                // Hide node
                node.x = -1000; // Move far off screen
                node.y = -1000;
            }
        }
    }
    
    // Reduce edge visibility
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
            // Store original state
            if (edge.originalCross === undefined) {
                edge.originalCross = edge.cross;
            }
            // Distort and fade edges
            edge.cross = distance < blackholeRadius; // Mark for special rendering
            edge.blackholeAffected = true;
        }
    }
}
