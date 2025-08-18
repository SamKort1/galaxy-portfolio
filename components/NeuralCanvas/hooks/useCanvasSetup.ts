import { useEffect, useState } from 'react';
import { DPR } from '../constants';
import { generateBackgroundStarfield } from '../../utils/StarField';

export function useCanvasSetup() {
    const [size, setSize] = useState({ w: 1200, h: 800 });

    useEffect(() => {
        const resize = () => {
            const w = window.innerWidth;
            const cs = getComputedStyle(document.documentElement);
            const safeTop = parseFloat(cs.getPropertyValue("--safe-top")) || 0;
            const safeBottom = parseFloat(cs.getPropertyValue("--safe-bottom")) || 0;
            const h = Math.max(0, window.innerHeight - safeTop - safeBottom);

            setSize({ w, h });
        };
        
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    return { size, setSize };
}

export function useCanvasRef() {
    const { size } = useCanvasSetup();
    
    useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const resize = () => {
            const w = window.innerWidth;
            const cs = getComputedStyle(document.documentElement);
            const safeTop = parseFloat(cs.getPropertyValue("--safe-top")) || 0;
            const safeBottom = parseFloat(cs.getPropertyValue("--safe-bottom")) || 0;
            const h = Math.max(0, window.innerHeight - safeTop - safeBottom);

            canvas.width = Math.floor(w * DPR);
            canvas.height = Math.floor(h * DPR);
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            canvas.style.top = `${safeTop}px`;
            canvas.style.bottom = `${safeBottom}px`;
        };
        
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [size]);

    return { size };
}
