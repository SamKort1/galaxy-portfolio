"use server";

export type MsgState =
    | { status: "idle" }
    | { status: "success"; message: string }
    | { status: "error"; message: string };

export async function sendMessageAction(
    _prev: MsgState,
    formData: FormData
): Promise<MsgState> {
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    const robot = (formData.get("company") || "").toString().trim();

    if (robot) return { status: "error", message: "Spam detected." };
    if (!name || !email || !message) return { status: "error", message: "All fields are required." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { status: "error", message: "Invalid email." };

    console.log("Contact message:", { name, email, message, at: new Date().toISOString() });
    return { status: "success", message: "Thanks! I’ll get back to you soon." };
}
