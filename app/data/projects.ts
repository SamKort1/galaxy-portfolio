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
        id: "1",
        title: "Portfolio for Dylan Putman",
        cluster: "frontend",
        description: "Portfolio for Art Director/Creative Director Dylan Putman. Showing of his projects in an elegant simple way",
        tech: ["React", "Next.js", "Tailwind"],
        demoUrl: "https://dylanputman.nl/",
        repoUrl: "https://github.com/SamKort1/dylan-putman-website",
        previewImage: "/portfolio-dylan.png"
    },
    {
        id: "2",
        title: "Studero - Study helper",
        cluster: "frontend",
        description: "Created a notion inspired Study helper called Studero. Where users can add meetings,  \n synced with google calender. Add notes using a folder structure and a rich text editor integrated with AI.  \n  Create quiz's based on notes",
        tech: ["Kotlin", "Spring", "Redis"],
        repoUrl: "#"
    },
    {
        id: "AI Parking detection",
        title: "Parking Object Detection",
        cluster: "ai",
        description: "YOLOv8-based detector with edge inference. Detecting cars within a street. measuring street length and other objects and determining available parking spaces within a street.",
        tech: ["PyTorch", "YOLO", "Python", "Video Detection"],
        previewImage: "/gif.gif"
    },
    {
        id: "",
        title: "IaC + CI/CD Pipeline",
        cluster: "cloud",
        description: "GitHub Actions → Terraform → AWS (ECS + RDS).",
        tech: ["AWS", "Docker"],
        previewImage: '/ci-cd.png'
    }
];

export const skills: Record<"frontend" | "backend" | "ai" | "cloud", string[]> = {
    frontend: ["React", "Angular", "Vue", "Next.js", "Tailwind"],
    backend:  ["Java", "Kotlin", "Spring Boot", "Python", "PostgreSQL"],
    ai:       ["PyTorch", "YOLO", "TensorFlow", "Solidity", "Smart Contracts"],
    cloud:    ["AWS", "Docker", "Kubernetes", "CI/CD"],
};
