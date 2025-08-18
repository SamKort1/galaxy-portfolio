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

export type NeuralCanvasProps = {
    clusters: any[];
    projects: any[];
    onProjectSelect: (payload: any) => void;
    onAboutSelect: (section: string) => void;
    aboutFacts: string[];
    funFacts: string[];
    contactLinks: any[];
    onOpenContactModal: () => void;
    aboutBio?: string;
    aboutPhotoUrl?: string;
    aboutHighlights?: { label: string; value: string }[];
    aboutTimeline?: { year: string; title: string; text: string }[];
    aboutCVUrl?: string;
};
