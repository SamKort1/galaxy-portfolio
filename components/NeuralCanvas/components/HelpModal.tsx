import { SECRET_COMMANDS } from '../constants';

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
            setTimeout(() => setShowHelp(false), 5000);
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur border border-white/20 rounded-lg p-6 max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-semibold text-white mb-4">🎮 Secret Commands</h3>
                <div className="space-y-2 text-sm mb-6">
                    {SECRET_COMMANDS.map(cmd => (
                        <div key={cmd.command} className="flex justify-between">
                            <span className="text-purple-400 font-mono">{cmd.command}</span>
                            <span className="text-gray-300">{cmd.description}</span>
                        </div>
                    ))}
                </div>
                
                <div className="border-t border-white/20 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">🌐 How to Use This Site</h4>
                    <div className="text-xs text-gray-300 space-y-2">
                        <p><strong>Click on any hub</strong> to expand and see related projects, skills, or information.</p>
                        <p><strong>Hover over elements</strong> to see tooltips and preview content.</p>
                        <p><strong>Click on orbiting elements</strong> to open detailed modals with full information.</p>
                        <p><strong>Use the Back button</strong> or click outside to collapse expanded clusters.</p>
                        <p><strong>Try the secret themes</strong> by typing &quot;matrix&quot;, &quot;cyberpunk&quot;, or &quot;retro&quot; for different visual styles.</p>
                    </div>
                </div>
                
                {/* Mobile section */}
                {typeof window !== 'undefined' && window.innerWidth <= 932 && (
                    <div className="border-t border-white/20 pt-4 mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">📱 Mobile Users</h4>
                        <div className="text-xs text-gray-300 space-y-2">
                            <p><strong>Tap &quot;Discover secrets&quot;</strong> in the footer to open this help modal.</p>
                            <p><strong>Use the command input below</strong> to type secret commands on mobile.</p>
                            <p><strong>Long press</strong> on elements to see tooltips (where supported).</p>
                        </div>
                    </div>
                )}
                
                {/* Mobile Command Input */}
                <div className="border-t border-white/20 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">⌨️ Command Input</h4>
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
                
                <div className="text-xs text-gray-400 mt-4">
                    Type commands anywhere on the page to activate them!
                </div>
            </div>
        </div>
    );
}
