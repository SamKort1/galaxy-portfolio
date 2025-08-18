"use client";

import { useLayoutEffect } from "react";

export default function SafeInsetsProvider() {
    useLayoutEffect(() => {
        const apply = () => {
            const header = document.getElementById("site-header");
            const footer = document.getElementById("site-footer");
            const top = (header?.offsetHeight || 0) + 8;
            const bottom = (footer?.offsetHeight || 0) + 8;

            document.documentElement.style.setProperty("--safe-top", `${top}px`);
            document.documentElement.style.setProperty("--safe-bottom", `${bottom}px`);
        };

        apply();
        window.addEventListener("resize", apply);
        return () => window.removeEventListener("resize", apply);
    }, []);

    return null;
}
