export const CALM = {
    hubAttract: 0.005,
    hubJiggle: 1.5,
    damping: 0.8,
    orbitOmegaMin: 0.1,
    orbitOmegaMax: 0.1,
    orbitWobbleAmp: 4,
    orbitWobbleFreq: 2,
    anchorWobbleAmp: 1.2,
    anchorWobbleFreq: 2,
    edgeBaseAlpha: 0.2,
    edgePulseAmp: 0.005,
    edgePulseFreq: 1,
    zoomScale: 1.7,
    zoomDuration: 1000,
    unzoomDuration: 600,
};

// Secret theme configurations
export const SECRET_THEMES = {
    matrix: {
        name: "Matrix",
        colors: {
            frontend: "#00ff00",
            backend: "#00cc00",
            ai: "#00aa00",
            cloud: "#008800",
            about: "#00ff00",
            contact: "#00cc00"
        },
        background: "radial-gradient(1200px 800px at 30% 20%, rgba(0,255,0,0.1), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(0,255,0,0.1), transparent 60%), #001100"
    },
    cyberpunk: {
        name: "Cyberpunk",
        colors: {
            frontend: "#ff00ff",
            backend: "#00ffff",
            ai: "#ffff00",
            cloud: "#ff0080",
            about: "#00ffff",
            contact: "#ff00ff"
        },
        background: "radial-gradient(1200px 800px at 30% 20%, rgba(255,0,255,0.15), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(0,255,255,0.15), transparent 60%), #1a0033"
    },
    retro: {
        name: "Retro",
        colors: {
            frontend: "#ff6b35",
            backend: "#f7931e",
            ai: "#ffd23f",
            cloud: "#5390d9",
            about: "#ff6b35",
            contact: "#f7931e"
        },
        background: "radial-gradient(1200px 800px at 30% 20%, rgba(255,107,53,0.12), transparent 60%), radial-gradient(1000px 700px at 80% 70%, rgba(247,147,30,0.12), transparent 60%), #2d1b69"
    }
};

// Secret commands
export const SECRET_COMMANDS = [
    { command: "matrix", description: "Enable Matrix green theme" },
    { command: "cyberpunk", description: "Enable Cyberpunk neon theme" },
    { command: "retro", description: "Enable Retro 80s theme" },
    { command: "help", description: "Show this help message" },
    { command: "reset", description: "Reset to default theme" },
    { command: "dev", description: "Toggle developer mode" }
];

export const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
export const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const SHOOTING_COUNT = 25;
