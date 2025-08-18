interface MobileAccessButtonProps {
    setShowHelp: (show: boolean) => void;
}

export function MobileAccessButton({ setShowHelp }: MobileAccessButtonProps) {
    if (typeof window === 'undefined' || window.innerWidth > 768) {
        return null;
    }

    return (
        <div className="fixed bottom-20 right-4 z-40">
            <button
                onClick={() => {
                    setShowHelp(true);
                    setTimeout(() => setShowHelp(false), 5000);
                }}
                className="w-12 h-12 rounded-full bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center text-purple-100 transition-all duration-200 hover:scale-110 shadow-lg"
                title="Access secret features"
            >
                <span className="text-lg">🔍</span>
            </button>
        </div>
    );
}
