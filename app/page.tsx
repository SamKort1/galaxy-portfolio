"use client";

import NeuralCanvas from "../components/NeuralCanvas";
import ProjectModal from "../components/utils/ProjectModal";
import AboutProfileModal from "../components/about/AboutProfileModal";
import AboutTimelineModal from "../components/about/AboutTimelineModal";
import AboutSkillsModal from "../components/about/AboutSkillsModal";
import ContactModal from "../components/utils/ContactModal";
import CometOverlay from "../components/utils/CometOverlay";
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
    ];

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [aboutProfileOpen, setAboutProfileOpen] = useState(false);
    const [aboutTimelineOpen, setAboutTimelineOpen] = useState(false);
    const [aboutSkillsOpen, setAboutSkillsOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);

    const [comet, setComet] = useState<null | { x: number; y: number; color?: string; projectId: string }>(null);

    const activeProject = useMemo(
        () => projects.find(p => p.id === activeProjectId) || null,
        [activeProjectId]
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setActiveProjectId(null);
                setAboutProfileOpen(false);
                setAboutTimelineOpen(false);
                setAboutSkillsOpen(false);
            }
        };
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

    const handleAboutSelect = (section: string) => {
        switch (section) {
            case "profile":
                setAboutProfileOpen(true);
                break;
            case "timeline":
                setAboutTimelineOpen(true);
                break;
            case "skills":
                setAboutSkillsOpen(true);
                break;
            case "contact":
                setContactOpen(true);
                break;
        }
    };


    return (
        <main className="relative min-h-screen">
            <NeuralCanvas
                clusters={clusters}
                projects={projects}
                onProjectSelect={handleProjectSelect}
                onAboutSelect={handleAboutSelect}
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

            <AboutProfileModal
                isOpen={aboutProfileOpen}
                onClose={() => setAboutProfileOpen(false)}
                photo={aboutPhotoUrl}
                bio={aboutBio}
                highlights={aboutHighlights}
                onDownloadCV={() => aboutCVUrl && window.open(aboutCVUrl, "_blank")}
                onContact={() => {
                    setAboutProfileOpen(false);
                    setContactOpen(true);
                }}
            />

            <AboutTimelineModal
                isOpen={aboutTimelineOpen}
                onClose={() => setAboutTimelineOpen(false)}
                timeline={aboutTimeline}
                onDownloadCV={() => aboutCVUrl && window.open(aboutCVUrl, "_blank")}
                onContact={() => {
                    setAboutTimelineOpen(false);
                    setContactOpen(true);
                }}
            />

            <AboutSkillsModal
                isOpen={aboutSkillsOpen}
                onClose={() => setAboutSkillsOpen(false)}
                onDownloadCV={() => aboutCVUrl && window.open(aboutCVUrl, "_blank")}
                onContact={() => {
                    setAboutSkillsOpen(false);
                    setContactOpen(true);
                }}
            />

            {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
        </main>
    );
}
