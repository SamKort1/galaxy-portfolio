"use client";

import NeuralCanvas from "../components/NeuralCanvas";
import ProjectModal from "../components/ProjectModal";
import ContactModal from "../components/ContactModal";
import CometOverlay from "../components/CometOverlay";
import { projects } from "./data/projects";
import {aboutBio, aboutCVUrl, aboutFacts, aboutHighlights, aboutPhotoUrl, aboutTimeline, funFacts} from "./data/about";
import { contactLinks } from "./data/contact";
import { useState, useEffect, useMemo } from "react";

export default function HomePage() {
    const clusters = [
        { id: "frontend", name: "Frontend", color: "#22d3ee", route: "#" },
        { id: "backend", name: "Backend", color: "#34d399", route: "#" },
        { id: "ai", name: "AI & Blockchain", color: "#f59e0b", route: "#" },
        { id: "cloud", name: "Cloud & Agile", color: "#60a5fa", route: "#" },
        { id: "about", name: "About Me", color: "#a78bfa", route: "#" },
        { id: "contact", name: "Contact", color: "#c55656", route: "#" },
    ] as const;

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [contactOpen, setContactOpen] = useState(false);

    const [comet, setComet] = useState<null | { x: number; y: number; color?: string; projectId: string }>(null);

    const activeProject = useMemo(
        () => projects.find(p => p.id === activeProjectId) || null,
        [activeProjectId]
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActiveProjectId(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    type ProjectClickPayload =
        | string
        | { id: string; x?: number; y?: number; color?: string }
        | null
        | undefined;

    const handleProjectSelect = (payload: ProjectClickPayload) => {
        if (!payload) return;

        if (typeof payload === "string") {
            setActiveProjectId(payload);
            return;
        }

        const { id, x, y, color } = payload;

        if (typeof x !== "number" || typeof y !== "number") {
            setActiveProjectId(id);
            return;
        }

        setComet({ x, y, color, projectId: id });
    };


    return (
        <main className="relative min-h-screen">
            <NeuralCanvas
                clusters={clusters as any}
                projects={projects}
                onProjectSelect={handleProjectSelect as any}
                aboutFacts={aboutFacts}
                funFacts={funFacts}
                contactLinks={contactLinks}
                onOpenContactModal={() => setContactOpen(true)}
                aboutBio={aboutBio}
                aboutPhotoUrl={aboutPhotoUrl}
                aboutCVUrl={aboutCVUrl}
                aboutHighlights={aboutHighlights}
                aboutTimeline={aboutTimeline}
            />

            {/* Comet overlay → opens modal when done */}
            {comet && (
                <CometOverlay
                    start={{ x: comet.x, y: comet.y }}
                    color={comet.color}
                    onDone={() => {
                        setComet(null);
                        setActiveProjectId(comet.projectId);
                    }}
                />
            )}

            {activeProject && (
                <ProjectModal project={activeProject} onClose={() => setActiveProjectId(null)} />
            )}

            {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
        </main>
    );
}
