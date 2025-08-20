export type Node = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    clusterId: string;
    isHub?: boolean;
    pulse?: number;
    // orbit params
    theta?: number; // angle
    baseR?: number; // base orbit radius
    omega?: number; // angular velocity (rad/s)
    phase?: number; // breathing phase
};

export type Edge = {
    a: number;
    b: number;
    clusterId: string;
    cross?: boolean;
    originalCross?: boolean;
    blackholeAffected?: boolean;
};

export type Cluster = {
    id: string;
    name: string;
    color: string;
    route: string;
    x?: number;
    y?: number;
    r?: number;
    description?: string;
};

export type Project = {
    id: string;
    title: string;
    cluster: "frontend" | "backend" | "ai" | "cloud";
    description: string;
    tech: string[];
    demoUrl?: string;
    repoUrl?: string;
    previewImage?: string;
};

export type ContactLink = { 
    id: "email" | "github" | "linkedin" | "message"; 
    label: string; 
    href: string 
};

export type AboutHighlight = {
    label: string;
    value: string;
};

export type TimelineEntry = {
    year: string;
    title: string;
    text: string;
};

export type ProjectClickPayload =
    | string
    | { id: string; x?: number; y?: number; color?: string }
    | null
    | undefined;

export type NeuralCanvasProps = {
    clusters: Cluster[];
    projects: Project[];
    onProjectSelect: (payload: ProjectClickPayload) => void;
    onAboutSelect: (section: string) => void;
    aboutFacts: string[];
    funFacts: string[];
    contactLinks: ContactLink[];
    onOpenContactModal: () => void;
    aboutBio?: string;
    aboutPhotoUrl?: string;
    aboutHighlights?: AboutHighlight[];
    aboutTimeline?: TimelineEntry[];
    aboutCVUrl?: string;
};

export interface StepEnv {
    timeRef: React.MutableRefObject<number>;
    prefersReducedMotion: boolean;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    DPR: number;
    size: { w: number; h: number };
    graph: React.MutableRefObject<{ nodes: Node[]; edges: Edge[] }>;
    anchors: React.MutableRefObject<Record<string, { x: number; y: number }>>;
    transform: { sx: number; sy: number; tx: number; ty: number };
    expandedCluster: Cluster["id"] | null;
    hoverId: number | null;
    hoverCluster: Cluster["id"] | null;
    CALM: typeof import("./constants").CALM;
    SHOOTING_COUNT: number;
    shootingRef: React.MutableRefObject<{
        x: number; y: number; vx: number; vy: number;
        r: number; hue: number; life: number; maxLife: number;
    }[]>;
    clusters: Cluster[];
    skills: Record<string, string[]>;
    projects: Project[];
    contactLinks: ContactLink[];
    visited: React.MutableRefObject<Set<string>>;
    projectHit: React.MutableRefObject<{ id: string; x: number; y: number; r: number }[]>;
    attract: (node: { x: number; y: number; vx: number; vy: number }, target: { x: number; y: number }, strength: number) => void;
    roundedRectPath: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => void;
    drawPillLabelAlpha: (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: { r: number; g: number; b: number }, alpha: number) => void;
    aboutFacts: string[];
    funFacts: string[];
    labelFadeAlpha: number;
    expandedFadeAlpha: number;
    blackholeActive: boolean;
    blackholeX: number;
    blackholeY: number;
    blackholeRadius: number;
    blackholeVisualRadius: number;
    blackholeStrength: number;
}
