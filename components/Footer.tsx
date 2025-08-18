export default function Footer() {
    return (
        <footer className="fixed bottom-0 inset-x-0 z-20">
            <div className="mx-auto max-w-6xl px-4 pb-4">
                <div className="glass rounded-2xl px-6 py-3 text-xs text-gray-300 flex items-center justify-between backdrop-blur-sm border border-white/10 shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">© {new Date().getFullYear()}</span>
                        <span className="font-medium text-white">Sam Kort</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">Full Stack Developer</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <a 
                            href="mailto:samkort@hotmail.nl" 
                            className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group"
                        >
                            <span className="group-hover:scale-110 transition-transform duration-200">📧</span>
                            <span>Email</span>
                        </a>
                        <a 
                            href="https://github.com/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group"
                        >
                            <span className="group-hover:scale-110 transition-transform duration-200">🐙</span>
                            <span>GitHub</span>
                        </a>
                        <a 
                            href="https://www.linkedin.com/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 group"
                        >
                            <span className="group-hover:scale-110 transition-transform duration-200">💼</span>
                            <span>LinkedIn</span>
                        </a>
                        
                        <div className="w-px h-4 bg-gray-600"></div>
                        
                        <div 
                            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors duration-300 cursor-help group"
                            title="Type 'help' anywhere to discover secret features and easter eggs!"
                        >
                            <span className="group-hover:animate-pulse">🔍</span>
                            <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity duration-200">
                                Discover secrets
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
