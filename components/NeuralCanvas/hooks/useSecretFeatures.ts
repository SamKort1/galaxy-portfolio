import { useEffect, useState, useRef } from 'react';
import { SECRET_THEMES, SECRET_COMMANDS } from '../constants';

export function useSecretFeatures(onBlackholeActivate?: () => void) {
    const [secretTheme, setSecretTheme] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [devMode, setDevMode] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [typedKeys, setTypedKeys] = useState("");
    const [themeFlash, setThemeFlash] = useState(false);
    const [fps, setFps] = useState(0);
    const [satelliteMultiplier, setSatelliteMultiplier] = useState(1);
    const [edgeMultiplier, setEdgeMultiplier] = useState(1);
    const devModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fpsRef = useRef({ lastTime: 0, frameCount: 0, fps: 0 });

    // Secret features and keyboard handlers
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // Secret command typing
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                setTypedKeys(prev => {
                    const newKeys = prev + e.key.toLowerCase();
                    // Keep only last 20 characters
                    const trimmed = newKeys.slice(-20);
                    
                    // Check for secret commands
                    if (trimmed.includes("help")) {
                        setShowHelp(true);
                        setTimeout(() => setShowHelp(false), 5000);
                        return "";
                    }
                    if (trimmed.includes("matrix")) {
                        setSecretTheme("matrix");
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("cyberpunk")) {
                        setSecretTheme("cyberpunk");
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("retro")) {
                        setSecretTheme("retro");
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("blackhole")) {
                        onBlackholeActivate?.();
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("reset")) {
                        setSecretTheme(null);
                        setThemeFlash(true);
                        setTimeout(() => setThemeFlash(false), 300);
                        return "";
                    }
                    if (trimmed.includes("dev")) {
                        // Clear any existing timeout
                        if (devModeTimeoutRef.current) {
                            clearTimeout(devModeTimeoutRef.current);
                        }
                        setDevMode(true);
                        devModeTimeoutRef.current = setTimeout(() => {
                            setDevMode(false);
                            devModeTimeoutRef.current = null;
                        }, 600000); // 10 minutes
                        return "";
                    }
                    
                    return trimmed;
                });
            }
        };
        
        // Listen for custom event from footer (mobile help access)
        const onShowHelpModal = () => {
            console.log('NeuralCanvas received showHelpModal event');
            setShowHelp(true);
            setTimeout(() => setShowHelp(false), 5000);
        };
        
        window.addEventListener("keydown", onKey);
        window.addEventListener("showHelpModal", onShowHelpModal);
        
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("showHelpModal", onShowHelpModal);
            // Clean up timeout on unmount
            if (devModeTimeoutRef.current) {
                clearTimeout(devModeTimeoutRef.current);
            }
        };
    }, []);

    // Handle dev mode controls separately
    useEffect(() => {
        if (devMode && typedKeys) {
            const trimmed = typedKeys.slice(-20);
            if (trimmed.includes("more")) {
                setSatelliteMultiplier(prev => Math.min(prev + 0.5, 5));
                setEdgeMultiplier(prev => Math.min(prev + 0.2, 3));
                setTypedKeys("");
            } else if (trimmed.includes("less")) {
                setSatelliteMultiplier(prev => Math.max(prev - 0.5, 0.5));
                setEdgeMultiplier(prev => Math.max(prev - 0.2, 0.2));
                setTypedKeys("");
            } else if (trimmed.includes("reset")) {
                setSatelliteMultiplier(1);
                setEdgeMultiplier(1);
                setTypedKeys("");
            }
        }
    }, [devMode, typedKeys]);

    return {
        secretTheme,
        setSecretTheme,
        showHelp,
        setShowHelp,
        devMode,
        setDevMode,
        clickCount,
        setClickCount,
        lastClickTime,
        setLastClickTime,
        typedKeys,
        setTypedKeys,
        themeFlash,
        setThemeFlash,
        fps,
        setFps,
        satelliteMultiplier,
        setSatelliteMultiplier,
        edgeMultiplier,
        setEdgeMultiplier,
        devModeTimeoutRef,
        fpsRef,
        SECRET_THEMES,
        SECRET_COMMANDS
    };
}
