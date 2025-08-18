import { SECRET_THEMES } from '../constants';

interface SecretOverlaysProps {
    secretTheme: string | null;
    themeFlash: boolean;
    devMode: boolean;
    fps: number;
    clickCount: number;
    satelliteMultiplier: number;
    edgeMultiplier: number;
    graphNodesLength: number;
    graphEdgesLength: number;
}

export function SecretOverlays({
    secretTheme,
    themeFlash,
    devMode,
    fps,
    clickCount,
    satelliteMultiplier,
    edgeMultiplier,
    graphNodesLength,
    graphEdgesLength
}: SecretOverlaysProps) {
    return (
        <>
            {/* Secret Theme Background Overlay */}
            {secretTheme && (
                <div 
                    className="fixed inset-0 z-[-1] pointer-events-none"
                    style={{
                        background: SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].background
                    }}
                />
            )}
            
            {/* Theme Change Flash Effect */}
            {themeFlash && (
                <div 
                    className="fixed inset-0 z-20 pointer-events-none bg-white/20 animate-pulse"
                    style={{
                        animation: 'none',
                        background: secretTheme ? 
                            SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].colors.frontend + '40' : 
                            'rgba(255,255,255,0.2)'
                    }}
                />
            )}
            
            {/* Secret Theme Indicator */}
            {secretTheme && (
                <div className="fixed top-4 right-4 z-40 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur text-xs text-white border border-white/20">
                    🎨 {SECRET_THEMES[secretTheme as keyof typeof SECRET_THEMES].name} Mode
                </div>
            )}
            
            {/* Developer Mode Overlay */}
            {devMode && (
                <div className="fixed top-4 left-4 z-40 p-3 rounded-lg bg-black/70 backdrop-blur text-xs text-green-400 border border-green-400/30 font-mono">
                    <div>DEV MODE</div>
                    <div>FPS: {fps}</div>
                    <div>Nodes: {graphNodesLength}</div>
                    <div>Edges: {graphEdgesLength}</div>
                    <div>Theme: {secretTheme || "default"}</div>
                    <div>Clicks: {clickCount}/10</div>
                    <div className="mt-2 pt-2 border-t border-green-400/30">
                        <div>Satellites: {satelliteMultiplier.toFixed(1)}x</div>
                        <div>Edges: {edgeMultiplier.toFixed(1)}x</div>
                        <div className="text-xs text-green-300 mt-1">
                            Type &quot;more&quot; to increase, &quot;less&quot; to decrease
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
