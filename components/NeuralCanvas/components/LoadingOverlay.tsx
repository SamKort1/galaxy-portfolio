export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
                {/* Neural Network Loading Animation */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* Central Hub */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                    </div>
                    
                    {/* Orbiting Nodes */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                animation: `orbit ${2 + i * 0.3}s linear infinite`,
                                animationDelay: `${i * 0.2}s`
                            }}
                        >
                            <div 
                                className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"
                                style={{
                                    transform: `translateX(${40 + i * 8}px)`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            ></div>
                        </div>
                    ))}
                    
                    {/* Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{transform: 'rotate(0deg)'}}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
                                <stop offset="50%" stopColor="rgba(167, 139, 250, 0.5)" />
                                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.3)" />
                            </linearGradient>
                        </defs>
                        {[...Array(6)].map((_, i) => {
                            const angle = (i * 60) * (Math.PI / 180);
                            const x1 = 64, y1 = 64;
                            const x2 = Math.round(64 + Math.cos(angle) * 40);
                            const y2 = Math.round(64 + Math.sin(angle) * 40);
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="url(#lineGradient)"
                                    strokeWidth="1"
                                    opacity="0.6"
                                    style={{
                                        animation: `pulse 2s ease-in-out infinite`,
                                        animationDelay: `${i * 0.2}s`
                                    }}
                                />
                            );
                        })}
                    </svg>
                </div>
                
                {/* Loading Text */}
                <div className="text-white/80 text-lg font-medium mb-2">Initializing Neural Network</div>
                <div className="text-white/60 text-sm">Connecting nodes and establishing orbits...</div>
                
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{
                                animationDelay: `${i * 0.2}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
