export default function Footer() {
    return (
        <footer className="fixed bottom-0 inset-x-0 z-20">
            <div className="mx-auto max-w-6xl px-4 pb-4">
                <div className="glass rounded-2xl px-4 py-2 text-xs text-gray-300 flex items-center justify-between">
                    <span>© {new Date().getFullYear()} Sam Kort</span>
                    <div className="flex gap-4">
                        <a href="mailto:samkort@hotmail.nl" className="hover:text-white">Email</a>
                        <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
                        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
