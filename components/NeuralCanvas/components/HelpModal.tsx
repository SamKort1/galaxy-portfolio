import { SECRET_COMMANDS } from '../constants';
import { motion, AnimatePresence } from "framer-motion";

interface HelpModalProps {
    showHelp: boolean;
    setShowHelp: (show: boolean) => void;
    setSecretTheme: (theme: string | null) => void;
    setThemeFlash: (flash: boolean) => void;
    setDevMode: (mode: boolean) => void;
    devModeTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function HelpModal({ 
    showHelp, 
    setShowHelp, 
    setSecretTheme, 
    setThemeFlash, 
    setDevMode, 
    devModeTimeoutRef 
}: HelpModalProps) {
    if (!showHelp) return null;

    const handleCommand = (command: string) => {
        if (command.includes('help')) {
            setShowHelp(true);
            setTimeout(() => setShowHelp(false), 10000);
        } else if (command.includes('matrix')) {
            setSecretTheme("matrix");
            setThemeFlash(true);
            setTimeout(() => setThemeFlash(false), 300);
        } else if (command.includes('cyberpunk')) {
            setSecretTheme("cyberpunk");
            setThemeFlash(true);
            setTimeout(() => setThemeFlash(false), 300);
        } else if (command.includes('retro')) {
            setSecretTheme("retro");
            setThemeFlash(true);
            setTimeout(() => setThemeFlash(false), 300);
        } else if (command.includes('reset')) {
            setSecretTheme(null);
            setThemeFlash(true);
            setTimeout(() => setThemeFlash(false), 300);
        } else if (command.includes('dev')) {
            if (devModeTimeoutRef.current) {
                clearTimeout(devModeTimeoutRef.current);
            }
            setDevMode(true);
            devModeTimeoutRef.current = setTimeout(() => {
                setDevMode(false);
                devModeTimeoutRef.current = null;
            }, 600000);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e: React.MouseEvent) => {
                    if (e.target === e.currentTarget) setShowHelp(false);
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-[min(95vw,800px)] max-h-[90vh] overflow-hidden rounded-2xl
                        border border-white/10 shadow-2xl
                        bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_100%)]
                        backdrop-blur-xl"
                    style={{
                        boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)`,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-white/10">
                        <div
                            className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center"
                            style={{ background: `radial-gradient(60% 60% at 50% 50%, rgba(139,92,246,0.85) 0%, rgba(139,92,246,0.35) 60%, rgba(0,0,0,0) 100%)` }}
                            aria-hidden
                        >
                            <span className="text-white text-sm">🎮</span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-semibold leading-tight text-white">Secret Commands</h2>
                            <p className="text-xs text-gray-300/90 mt-0.5 line-clamp-2 max-w-[70%]">Discover hidden features and easter eggs</p>
                        </div>
                        <button
                            onClick={() => setShowHelp(false)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {/* Secret Commands */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-white/90 mb-3">Available Commands</h3>
                            <div className="space-y-2">
                                {SECRET_COMMANDS.map(cmd => (
                                    <div key={cmd.command} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                                        <span className="text-purple-400 font-mono text-sm">{cmd.command}</span>
                                        <span className="text-gray-300 text-sm">{cmd.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* How to Use */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-white/90 mb-3">🌐 How to Use This Site</h3>
                            <div className="space-y-3">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-200/90"><strong>Click on any hub</strong> to expand and see related projects, skills, or information.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-200/90"><strong>Hover over elements</strong> to see tooltips and preview content.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-200/90"><strong>Click on orbiting elements</strong> to open detailed modals with full information.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-200/90"><strong>Use the Back button</strong> or click outside to collapse expanded clusters.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-gray-200/90"><strong>Try the secret themes</strong> by typing "matrix", "cyberpunk", or "retro" for different visual styles.</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Mobile section */}
                        {typeof window !== 'undefined' && window.innerWidth <= 932 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-white/90 mb-3">📱 Mobile Users</h3>
                                <div className="space-y-3">
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-sm text-gray-200/90"><strong>Tap "Discover secrets"</strong> in the footer to open this help modal.</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-sm text-gray-200/90"><strong>Use the command input below</strong> to type secret commands on mobile.</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-sm text-gray-200/90"><strong>Long press</strong> on elements to see tooltips (where supported).</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Command Input */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-white/90 mb-3">⌨️ Command Input</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a command (e.g., 'help', 'matrix')"
                                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const command = e.currentTarget.value.toLowerCase();
                                            handleCommand(command);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="px-3 py-2 bg-purple-400/20 hover:bg-purple-400/30 text-purple-100 rounded-lg text-sm transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-400 text-center">
                            Type commands anywhere on the page to activate them!
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
