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

export const projects: Project[] = [
    {
        id: "p-frontend-design-system",
        title: "Design System Playground",
        cluster: "frontend",
        description: "Token-driven components with docs and theming.",
        tech: ["React", "Next.js", "Tailwind"],
        demoUrl: "#",
        repoUrl: "#"
    },
    {
        id: "p-backend-chat-ws",
        title: "Realtime Chat Service",
        cluster: "backend",
        description: "WebSocket gateway + auth + horizontal scaling.",
        tech: ["Kotlin", "Spring", "Redis"],
        demoUrl: "#",
        repoUrl: "#"
    },
    {
        id: "p-ai-parking-vision",
        title: "Parking Object Detection",
        cluster: "ai",
        description: "YOLOv8-based detector with edge inference.",
        tech: ["PyTorch", "OpenCV"],
        demoUrl: "#",
        repoUrl: "#"
    },
    {
        id: "p-cloud-iac",
        title: "IaC + CI/CD Pipeline",
        cluster: "cloud",
        description: "GitHub Actions → Terraform → AWS (ECS + RDS).",
        tech: ["AWS", "Terraform", "Docker"],
        demoUrl: "#",
        repoUrl: "#"
    }
];

export const skills: Record<"frontend" | "backend" | "ai" | "cloud", string[]> = {
    frontend: ["React", "Angular", "Vue", "Next.js", "Tailwind"],
    backend:  ["Java", "Kotlin", "Spring Boot", "Python", "PostgreSQL"],
    ai:       ["PyTorch", "YOLO", "TensorFlow", "Solidity", "Smart Contracts"],
    cloud:    ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
};
