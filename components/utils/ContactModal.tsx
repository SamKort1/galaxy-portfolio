"use client";
import { useFormState, useFormStatus } from "react-dom";
import { sendMessageAction, type MsgState } from "../../app/actions";

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <button disabled={pending} className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 text-sm">
            {pending ? "Sending…" : "Send"}
        </button>
    );
}

export default function ContactModal({ onClose }: { onClose: () => void }) {
    const [state, formAction] = useFormState(sendMessageAction, { status: "idle" } as MsgState);

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
             onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="glass rounded-2xl max-w-lg w-full p-4 sm:p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-300 hover:text-white">✕</button>
                <h2 className="text-xl font-semibold mb-2">Send a message</h2>
                <form action={formAction} className="grid gap-3">
                    <div className="hidden">
                        <label className="text-sm" htmlFor="company">Company</label>
                        <input id="company" name="company" className="w-full rounded-lg bg-white/5 px-3 py-2" />
                    </div>
                    <input name="name" placeholder="Your name" required className="rounded-lg bg-white/5 px-3 py-2" />
                    <input name="email" type="email" placeholder="you@example.com" required className="rounded-lg bg-white/5 px-3 py-2" />
                    <textarea name="message" rows={5} placeholder="What would you like to build together?" required className="rounded-lg bg-white/5 px-3 py-2" />
                    <div className="flex items-center gap-3">
                        <SubmitBtn />
                        {state.status === "success" && <p className="text-green-300 text-sm">{state.message}</p>}
                        {state.status === "error" && <p className="text-red-300 text-sm">{state.message}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
