import { useEffect, useRef } from 'react';
import { rand } from '../utils';
import { CALM } from '../constants';
import { Node, Edge } from '../types';

export function useGraphSetup(
    size: { w: number; h: number },
    clusters: any[],
    satelliteMultiplier: number,
    edgeMultiplier: number
) {
    const graph = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
    const anchors = useRef<Record<string, { x: number; y: number }>>({});

    useEffect(() => {
        const w = size.w;
        const h = size.h;

        const anchorPositions = [
            { id: "frontend", x: w * 0.22, y: h * 0.35 },
            { id: "backend", x: w * 0.78, y: h * 0.35 },
            { id: "ai", x: w * 0.30, y: h * 0.70 },
            { id: "cloud", x: w * 0.70, y: h * 0.70 },
            { id: "about", x: w * 0.50, y: h * 0.3 },  // center
            { id: "contact", x: w * 0.50, y: h * 0.60 },  // below about
        ];
        anchors.current = anchorPositions.reduce(
            (acc, a) => ((acc[a.id] = { x: a.x, y: a.y }), acc),
            {} as Record<string, { x: number; y: number }>
        );

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let nid = 0;

        // Calculate responsive sizes based on screen dimensions
        const screenSize = Math.min(w, h);
        const hubRadius = Math.max(20, Math.min(45, screenSize * 0.04)); // 20-45px based on screen size (increased)
        const satelliteRadiusMin = Math.max(1.5, Math.min(5, screenSize * 0.003)); // 1.5-5px (increased)
        const satelliteRadiusMax = Math.max(6, Math.min(18, screenSize * 0.012)); // 6-18px (increased)
        // Larger orbit radii for more screen coverage
        const orbitRadiusMin = Math.max(40, Math.min(100, screenSize * 0.08)); // 40-100px (increased)
        const orbitRadiusMax = Math.max(80, Math.min(150, screenSize * 0.12)); // 80-150px (increased)

        for (const { id } of clusters) {
            // hub
            nodes.push({
                id: nid++,
                x: (anchors.current[id]?.x ?? w * 0.5) + rand(-10, 10),
                y: (anchors.current[id]?.y ?? h * 0.5) + rand(-10, 10),
                vx: 0,
                vy: 0,
                r: hubRadius,
                clusterId: id,
                isHub: true,
            });
            // satellites
            const satellites = Math.round(12 * satelliteMultiplier);
            for (let i = 0; i < satellites; i++) {
                const baseR = rand(orbitRadiusMin, orbitRadiusMax);
                const theta = rand(0, Math.PI * 2);
                const omega = rand(CALM.orbitOmegaMin, CALM.orbitOmegaMax) * (Math.random() < 0.5 ? -1 : 1);
                const phase = rand(0, Math.PI * 2);

                nodes.push({
                    id: nid++,
                    x: (anchors.current[id]?.x ?? w * 0.5) + Math.cos(theta) * baseR,
                    y: (anchors.current[id]?.y ?? h * 0.5) + Math.sin(theta) * baseR,
                    vx: 0,
                    vy: 0,
                    r: rand(satelliteRadiusMin, satelliteRadiusMax),
                    clusterId: id,
                    isHub: false,
                    theta,
                    baseR,
                    omega,
                    phase,
                });
            }
        }

        // intra-cluster edges
        const clusterNodes = (cid: string) => nodes.filter((n) => n.clusterId === cid);
        // Responsive edge distance based on orbit size - increased for more connections
        const edgeDistance = Math.max(120, Math.min(200, screenSize * 0.15)); // 120-200px based on screen size (increased)
        for (const c of clusters) {
            const list = clusterNodes(c.id);
            for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                    const a = list[i],
                        b = list[j];
                    const dx = a.x - b.x,
                        dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < edgeDistance * edgeDistance && Math.random() < 0.08 * edgeMultiplier) edges.push({ a: a.id, b: b.id, clusterId: c.id });
                }
            }
        }

        // sparse cross edges
        const ids = clusters.map((c) => c.id);
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const A = clusterNodes(ids[i]).filter((n) => !n.isHub);
                const B = clusterNodes(ids[j]).filter((n) => !n.isHub);
                for (let k = 0; k < Math.round(5 * edgeMultiplier); k++) {
                    const a = A[Math.floor(Math.random() * A.length)];
                    const b = B[Math.floor(Math.random() * B.length)];
                    if (a && b) edges.push({ a: a.id, b: b.id, clusterId: "cross", cross: true });
                }
            }
        }

        graph.current = { nodes, edges };
    }, [size.w, size.h, JSON.stringify(clusters), satelliteMultiplier, edgeMultiplier]);

    return { graph, anchors };
}
