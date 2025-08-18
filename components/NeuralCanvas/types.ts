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
    // continuous orbit params for satellites
    theta?: number; // current angle (rad)
    baseR?: number; // base orbit radius
    omega?: number; // angular velocity (rad/s)
    phase?: number; // radial "breathing" phase
};

export type Edge = {
    a: number;
    b: number;
    clusterId: string;
    cross?: boolean;
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
