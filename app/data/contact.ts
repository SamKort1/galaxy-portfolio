export type ContactLink = { id: "email" | "github" | "linkedin" | "message"; label: string; href: string };
export const contactLinks: ContactLink[] = [
    { id: "email",    label: "Email",    href: "mailto:samkort@hotmail.nl" },
    { id: "github",   label: "GitHub",   href: "https://github.com/SamKort1" },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/sam-kort-603547195/" },
    { id: "message", label: "Message", href: "" }
];
