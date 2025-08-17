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
                const skillBase = 120;
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
                    });
                });
            }

            // --- Projects outer ring ---
            const key = expandedCluster as Exclude<typeof expandedCluster, "about" | "contact">;
            const projectList = projects.filter((p) => p.cluster === key);

            const projBase = 170;
            const projOrbit = projBase + Math.sin(timeRef.current * 0.7) * 6;
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
            const list = [...aboutFacts, ...funFacts];
            if (list.length) {
                const PAGE = 4;
                const pageCount = Math.ceil(list.length / PAGE);

                // Timing
                const PERIOD = 3.2;   // total time each page is shown
                const XFADE  = 0.9;   // cross-fade duration at the start of each cycle
                const t      = timeRef.current;

                // Progress within current cycle [0..PERIOD)
                const phaseSecs = ((t % PERIOD) + PERIOD) % PERIOD;

                // Cross-fade amount k: 0→1 only during the first XFADE seconds of the cycle
                const smooth01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
                const k = phaseSecs < XFADE ? smooth01(phaseSecs / XFADE) : 0;

                // Compute from/to pages in a way that stays stable across the entire XFADE window:
                // Shift "t" back by XFADE so "fromPage" is locked to the previous cycle while blending.
                const fromStep = Math.floor((t - XFADE) / PERIOD);
                const posMod   = (a: number, m: number) => ((a % m) + m) % m;
                const fromPage = posMod(fromStep, pageCount);
                const toPage   = (fromPage + 1) % pageCount;

                const getSlice = (p: number) => list.slice(p * PAGE, p * PAGE + PAGE);

                const orbit = 160;
                const baseSpeed = env.prefersReducedMotion ? 0.02 : 0.07;
                const angleBase = t * baseSpeed;

                // faint orbit guide
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${r},${g},${bcol},0.12)`;
                ctx.lineWidth = 1;
                ctx.arc(hub.x, hub.y, orbit, 0, Math.PI * 2);
                ctx.stroke();

                const slidePx = 10; // subtle radial slide

                const drawPage = (items: string[], alpha: number, slideSign: number) => {
                    const n = Math.max(1, items.length);
                    for (let i = 0; i < n; i++) {
                        const label = items[i];
                        const angle = angleBase + (i / n) * Math.PI * 2;
                        const rad   = orbit + slideSign * slidePx * (1 - alpha);
                        const x = Math.round(hub.x + Math.cos(angle) * rad) + 0.5;
                        const y = Math.round(hub.y + Math.sin(angle) * rad) + 0.5;

                        ctx.save();
                        ctx.globalAlpha = alpha;
                        drawSkillChip(ctx, x, y, label, { r, g, b: bcol, time: t });
                        ctx.restore();
                    }
                };

                const currentItems = getSlice(fromPage);
                const nextItems    = getSlice(toPage);

                // current fades out + slides slightly inward
                drawPage(currentItems, 1 - k, -1);
                // next fades in + slides slightly outward
                drawPage(nextItems, k, +1);

                // page dots (blend between the two)
                const dotsY = hub.y + 28;
                for (let i = 0; i < pageCount; i++) {
                    const ddx = (i - (pageCount - 1) / 2) * 14;
                    ctx.beginPath();
                    const activeAlpha = i === fromPage ? 1 - k : i === toPage ? k : 0;
                    ctx.fillStyle =
                        activeAlpha > 0
                            ? `rgba(${r},${g},${bcol},${0.25 + 0.65 * activeAlpha})`
                            : "rgba(255,255,255,0.2)";
                    ctx.arc(hub.x + ddx, dotsY, 2 + activeAlpha, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }


        // --- Contact ---
        if (expandedCluster === "contact") {
            const list = contactLinks;
            const base = 170;
            const orbit = base + Math.sin(timeRef.current * 0.5) * 4;
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
