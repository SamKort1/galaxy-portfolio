import type {StepEnv} from "./env";
import {drawProjectGem, drawSkillChip} from "./drawHelpers";

export function drawExpandedCluster(env: StepEnv) {
    const {
        graph, expandedCluster, clusters, timeRef, prefersReducedMotion,
        skills, projects, contactLinks, ctx, visited, projectHit,
        roundedRectPath,
        aboutFacts, funFacts,
    } = env;

    // -------- Satellites for expanded cluster --------
    projectHit.current = [];
    if (expandedCluster) {
        const hub = graph.current.nodes.find((n) => n.isHub && n.clusterId === expandedCluster)!;
        const color = clusters.find((c) => c.id === expandedCluster)!.color;
        const r = parseInt(color.slice(1, 3), 16),
            g = parseInt(color.slice(3, 5), 16),
            bcol = parseInt(color.slice(5, 7), 16);

        const drawLabel = (x: number, y: number, text: string, pad = 6) => {
            ctx.save();
            ctx.font = "12px Inter, ui-sans-serif, system-ui, sans-serif";
            const w = ctx.measureText(text).width + pad * 2;
            const h = 20;
            const rx = 8;
            const left = x - w / 2;
            const top = y - h - 12;
            ctx.beginPath();
            roundedRectPath(ctx, left, top, w, h, rx);
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fill();
            ctx.fillStyle = "rgba(235,240,255,0.92)";
            ctx.fillText(text, left + pad, top + h - 6);
            ctx.restore();
        };

        // --- Projects / Skills ---
        if (expandedCluster !== "about" && expandedCluster !== "contact") {
            const skillList = (skills as any)[expandedCluster] as string[] | undefined;
                         if (skillList && skillList.length) {
                 // Responsive skill orbit radius based on screen size
                 const screenSize = Math.min(env.size.w, env.size.h);
                 const skillBase = Math.max(50, Math.min(100, screenSize * 0.15)); // 50-100px based on screen size (increased from 30-60px)
                 const skillOrbit = skillBase + Math.sin(timeRef.current * 0.5) * 4;
                const skillSpeed = prefersReducedMotion ? 0.05 : 0.2;

                ctx.beginPath();
                ctx.strokeStyle = `rgba(${r},${g},${bcol},0.10)`;
                ctx.lineWidth = 1;
                ctx.arc(hub.x, hub.y, skillOrbit, 0, Math.PI * 2);
                ctx.stroke();

                skillList.forEach((label, i) => {
                    const angle = timeRef.current * skillSpeed + (i / skillList.length) * Math.PI * 2;
                    const sx = hub.x + Math.cos(angle) * skillOrbit;
                    const sy = hub.y + Math.sin(angle) * skillOrbit;

                    drawSkillChip(ctx, sx, sy, label, {
                        r,
                        g,
                        b: bcol,
                        time: timeRef.current,
                        padX: 8,
                        padY: 22
                    });
                });
            }

            // --- Projects outer ring ---
            const key = expandedCluster as Exclude<typeof expandedCluster, "about" | "contact">;
            const projectList = projects.filter((p) => p.cluster === key);

                         // Responsive project orbit radius based on screen size
             const screenSize = Math.min(env.size.w, env.size.h);
             const projBase = Math.max(80, Math.min(180, screenSize * 0.25)); // 120-220px based on screen size (increased from 80-170px)
            const projOrbit = projBase + Math.sin(timeRef.current * 0.7) * 3;
            const projSpeed = prefersReducedMotion ? 0.1 : 0.35;

            // orbit guide
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r},${g},${bcol},0.18)`;
            ctx.lineWidth = 1;
            ctx.arc(hub.x, hub.y, projOrbit, 0, Math.PI * 2);
            ctx.stroke();

            projectList.forEach((p, i) => {
                const angle = timeRef.current * projSpeed + (i / Math.max(1, projectList.length)) * Math.PI * 2;
                const px = hub.x + Math.cos(angle) * projOrbit;
                const py = hub.y + Math.sin(angle) * projOrbit;

                // Gem-style node with inner glow + flare
                const pr = 12;
                drawProjectGem(ctx, px, py, pr, { r, g, b: bcol }, {
                    innerGlow: true,
                    flare: true,
                    outline: true,
                    time: timeRef.current,
                    // subtle attention ring only on first view:
                    ringOnFirstView: !visited.current.has(p.id),
                });

                // label + hit region (unchanged)
                drawLabel(px, py, p.title);
                projectHit.current.push({ id: p.id, x: px, y: py, r: pr + 6 });
            });
        }
                 // --- About ---
         if (expandedCluster === "about") {
             // Create orbiting elements for About cluster
             const aboutElements = [
                 { id: "about:profile", label: "Profile", icon: "👤" },
                 { id: "about:timeline", label: "Timeline", icon: "📅" },
                 { id: "about:skills", label: "Skills", icon: "⚡" },
                 { id: "about:contact", label: "Contact", icon: "📧" }
             ];

                           // Responsive about orbit radius based on screen size
              const screenSize = Math.min(env.size.w, env.size.h);
              const orbit = Math.max(120, Math.min(180, screenSize * 0.2)); // 100-180px based on screen size (increased from 70-130px)
             const speed = env.prefersReducedMotion ? 0.06 : 0.25;

             // orbit guide
             ctx.beginPath();
             ctx.strokeStyle = `rgba(${r},${g},${bcol},0.18)`;
             ctx.lineWidth = 1;
             ctx.arc(hub.x, hub.y, orbit, 0, Math.PI * 2);
             ctx.stroke();

             aboutElements.forEach((element, i) => {
                 const angle = timeRef.current * speed + (i / aboutElements.length) * Math.PI * 2;
                 const x = hub.x + Math.cos(angle) * orbit;
                 const y = hub.y + Math.sin(angle) * orbit;

                 // Gem-style node with inner glow + flare
                 const pr = 12;
                 drawProjectGem(ctx, x, y, pr, { r, g, b: bcol }, {
                     innerGlow: true,
                     flare: true,
                     outline: true,
                     time: timeRef.current,
                 });

                 // label + hit region
                 drawLabel(x, y, element.label);
                 projectHit.current.push({ id: element.id, x, y, r: pr + 6 });
             });

                                                                   // Add combined facts as orbiting elements (cycle through 2 at a time)
              if ((env.aboutFacts && env.aboutFacts.length > 0) || (env.funFacts && env.funFacts.length > 0)) {
                  // Combined orbit for all facts
                  const factOrbit = Math.max(50, Math.min(100, screenSize * 0.15));
                  const factSpeed = env.prefersReducedMotion ? 0.05 : 0.18;

                  // orbit guide for facts
                  ctx.beginPath();
                  ctx.strokeStyle = `rgba(${r},${g},${bcol},0.12)`;
                  ctx.lineWidth = 1;
                  ctx.arc(hub.x, hub.y, factOrbit, 0, Math.PI * 2);
                  ctx.stroke();

                  // Combine about facts and fun facts into one array
                  const allFacts = [...(env.aboutFacts || []), ...(env.funFacts || [])];
                  
                  if (allFacts.length > 0) {
                      // Cycle through facts 2 at a time
                      const cycleSpeed = env.prefersReducedMotion ? 0.05 : 0.2;
                      const cycleTime = timeRef.current * cycleSpeed;
                      const totalFacts = allFacts.length;
                      const currentPair = Math.floor(cycleTime) % Math.ceil(totalFacts / 2);
                      
                      // Show 2 facts at a time
                      for (let i = 0; i < 2; i++) {
                          const factIndex = (currentPair * 2 + i) % totalFacts;
                          const fact = allFacts[factIndex];
                          
                          if (fact) {
                              const angle = timeRef.current * factSpeed + (i * Math.PI) + Math.PI / 6; // 2 facts opposite each other
                              const x = hub.x + Math.cos(angle) * factOrbit;
                              const y = hub.y + Math.sin(angle) * factOrbit;

                              // Pill-style chip for facts (like skills)
                              drawSkillChip(ctx, x, y, `${fact}`, {
                                  r,
                                  g,
                                  b: bcol,
                                  time: timeRef.current,
                                  padX: 8,
                                  padY: 22
                              });

                              // hit region for facts - determine if it's an about fact or fun fact
                              const isAboutFact = factIndex < (env.aboutFacts?.length || 0);
                              const originalIndex = isAboutFact ? factIndex : factIndex - (env.aboutFacts?.length || 0);
                              const factId = isAboutFact ? `aboutfact:${originalIndex}` : `funfact:${originalIndex}`;
                              projectHit.current.push({ id: factId, x, y, r: 20 });
                          }
                      }
                  }
              }
         }


                 // --- Contact ---
         if (expandedCluster === "contact") {
             const list = contactLinks;
             const screenSize = Math.min(env.size.w, env.size.h);
             const orbit = Math.max(50, Math.min(100, screenSize * 0.1));
             const speed = env.prefersReducedMotion ? 0.06 : 0.2;

            list.forEach((link, i) => {
                const angle = timeRef.current * speed + (i / Math.max(1, list.length)) * Math.PI * 2 + Math.PI / 6;
                const x = hub.x + Math.cos(angle) * orbit;
                const y = hub.y + Math.sin(angle) * orbit;

                // use a gem node instead of a plain circle
                drawProjectGem(ctx, x, y, 12, { r, g, b: bcol }, {
                    innerGlow: true,
                    flare: true,
                    outline: true,
                    time: timeRef.current,
                });

                // label chip (same visual as skills/about)
                drawSkillChip(ctx, x, y - 22, link.label, {
                    r,
                    g,
                    b: bcol,
                    time: timeRef.current,
                });

                // keep your hit region logic
                projectHit.current.push({ id: `contact:${link.id}`, x, y, r: 12 + 6 });
            });
        }
    }
}
