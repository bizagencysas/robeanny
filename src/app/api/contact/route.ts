import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log("Contact form submission received:", data);

        // Configured for Resend or standard SMTP replacement. 
        // Currently simulates a successful submission for UI interaction.
        // In production, connect this to Resend using the user's API Key.

        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, 1500));

        return NextResponse.json({ success: true, message: "Email sent successfully." });
    } catch (error) {
        console.error("Error processing contact form:", error);
        return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
}
