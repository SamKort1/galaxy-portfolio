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

    try {
        // EmailJS configuration - you'll need to set these environment variables
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY;

        if (!serviceId || !templateId || !publicKey || !privateKey) {
            console.error("EmailJS environment variables not configured");
            return { status: "error", message: "Email service not configured. Please try again later." };
        }

        // EmailJS REST API endpoint
        const url = `https://api.emailjs.com/api/v1.0/email/send`;

        const emailData = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                from_name: name,
                from_email: email,
                message: message,
                to_name: "Portfolio Owner", // You can customize this
                reply_to: email,
                timestamp: new Date().toLocaleString(),
            },
            accessToken: privateKey,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("EmailJS API error:", errorText);
            return { status: "error", message: "Failed to send message. Please try again later." };
        }

        console.log("Contact message sent via EmailJS:", { name, email, at: new Date().toISOString() });
        return { status: "success", message: "Thanks! I'll get back to you soon." };

    } catch (error) {
        console.error("Error sending email:", error);
        return { status: "error", message: "Failed to send message. Please try again later." };
    }
}
