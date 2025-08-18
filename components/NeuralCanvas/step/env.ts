import type { MutableRefObject } from "react";
import type { Project } from "../../../app/data/projects";

export type Node = {
    id: number; x: number; y: number; vx: number; vy: number; r: number;
    clusterId: string; isHub?: boolean; pulse?: number; theta?: number; baseR?: number; omega?: number; phase?: number;
};

export type Edge = { a:number; b:number; clusterId:string; cross?:boolean };

export type Cluster = { id:string; name:string; color:string; };

export type StepEnv = {
    // timing
    timeRef: MutableRefObject<number>;
    prefersReducedMotion: boolean;

    // canvas
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    DPR: number;
    size: { w:number; h:number };

    // graph
    graph: MutableRefObject<{ nodes: Node[]; edges: Edge[] }>;
    anchors: MutableRefObject<Record<string, { x:number; y:number }>>;

    // UI state
    transform: { sx:number; sy:number; tx:number; ty:number };
    expandedCluster: string | null;
    hoverId: number | null;
    hoverCluster: string | null;

    // constants
    CALM: {
        hubAttract: number;
        hubJiggle: number;
        damping: number;
        orbitOmegaMin: number;
        orbitOmegaMax: number;
        orbitWobbleAmp: number;
        orbitWobbleFreq: number;
        anchorWobbleAmp: number;
        anchorWobbleFreq: number;
        edgeBaseAlpha: number;
        edgePulseAmp: number;
        edgePulseFreq: number;
        zoomScale: number;
        zoomDuration: number;
        unzoomDuration: number;
    };

    // shooting stars
    SHOOTING_COUNT: number;
    shootingRef: MutableRefObject<{ x:number; y:number; vx:number; vy:number; life:number; maxLife:number; r:number; hue:number }[]>;

    // data
    clusters: Cluster[];
    skills: Record<string, string[]>;
    projects: Project[];
    contactLinks: { id:string; label:string; href:string }[];
    aboutFacts: string[];
    funFacts: string[];

    // misc
    visited: MutableRefObject<Set<string>>;
    projectHit: MutableRefObject<{ id:string; x:number; y:number; r:number }[]>;

    // helpers from the component
    attract: (node: Node, target: {x:number;y:number}, strength:number) => void;
    roundedRectPath: (ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number)=>void;
    drawPillLabelAlpha: (ctx:CanvasRenderingContext2D,x:number,y:number,text:string,maxWidth?:number,alpha?:number,pad?:number)=>void;
};
