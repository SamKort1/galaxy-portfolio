"use client";
import { useFormState, useFormStatus } from "react-dom";
import { sendMessageAction, type MsgState } from "../../app/actions";
import { motion, AnimatePresence } from "framer-motion";

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <button 
            disabled={pending} 
            className="px-3 py-1.5 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 text-xs text-purple-100 transition-colors"
        >
            {pending ? "Sending…" : "Send"}
        </button>
    );
}

export default function ContactModal({ onClose }: { onClose: () => void }) {
    const [state, formAction] = useFormState(sendMessageAction, { status: "idle" } as MsgState);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e: React.MouseEvent) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-[min(95vw,600px)] max-h-[90vh] overflow-hidden rounded-2xl
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
                            style={{ background: `radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,0.85) 0%, rgba(34,211,238,0.35) 60%, rgba(0,0,0,0) 100%)` }}
                            aria-hidden
                        >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg md:text-xl font-semibold leading-tight text-white">Send a Message</h2>
                            <p className="text-xs text-gray-300/90 mt-0.5 line-clamp-2 max-w-[70%]">Let's build something amazing together</p>
                        </div>
                    </div>
                    
                    {/* Close button positioned absolutely in top right */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Body */}
                    <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <form action={formAction} className="space-y-4">
                            <div className="hidden">
                                <label className="text-sm text-gray-300/90" htmlFor="company">Company</label>
                                <input 
                                    id="company" 
                                    name="company" 
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50" 
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-300/90 block mb-2" htmlFor="name">Your Name</label>
                                <input 
                                    id="name"
                                    name="name" 
                                    placeholder="Your name" 
                                    required 
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50" 
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-300/90 block mb-2" htmlFor="email">Email Address</label>
                                <input 
                                    id="email"
                                    name="email" 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    required 
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50" 
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-300/90 block mb-2" htmlFor="message">Message</label>
                                <textarea 
                                    id="message"
                                    name="message" 
                                    rows={5} 
                                    placeholder="What would you like to build together?" 
                                    required 
                                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 resize-none" 
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 pt-2">
                                <SubmitBtn />
                                {state.status === "success" && (
                                    <p className="text-green-300 text-sm">{state.message}</p>
                                )}
                                {state.status === "error" && (
                                    <p className="text-red-300 text-sm">{state.message}</p>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
