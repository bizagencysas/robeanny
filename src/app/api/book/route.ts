import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { projectType, name, email, brand, date, location, description, budget, references, subject, message } = body;

        // Format email body
        const isBooking = !!projectType;
        const emailSubject = isBooking
            ? `Nueva Solicitud de Booking: ${name} — ${projectType}`
            : `Nuevo Mensaje de Contacto: ${name} — ${subject || "General"}`;

        const emailBody = isBooking
            ? `
NUEVA SOLICITUD DE BOOKING
===========================

Tipo de Proyecto: ${projectType}
Nombre: ${name}
Email: ${email}
${brand ? `Empresa/Marca: ${brand}` : ""}
${date ? `Fecha Estimada: ${date}` : ""}
${location ? `Ubicación: ${location}` : ""}
${budget ? `Presupuesto: ${budget}` : ""}

Descripción:
${description || "N/A"}

Referencias:
${references || "N/A"}
            `.trim()
            : `
NUEVO MENSAJE DE CONTACTO
===========================

Nombre: ${name}
Email: ${email}
Asunto: ${subject || "General"}

Mensaje:
${message || "N/A"}
            `.trim();

        // For now, use Formspree as the email relay (can be swapped for Resend/SendGrid)
        // If FORMSPREE_ID env var is set, use it. Otherwise, log and return success.
        const formspreeId = process.env.FORMSPREE_ID;

        if (formspreeId) {
            const formRes = await fetch(`https://formspree.io/f/${formspreeId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    _subject: emailSubject,
                    email,
                    name,
                    message: emailBody,
                }),
            });

            if (!formRes.ok) {
                console.error("Formspree error:", await formRes.text());
                return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
            }
        } else {
            // Fallback: log to console (useful for development)
            console.log("========== EMAIL (no FORMSPREE_ID set) ==========");
            console.log("Subject:", emailSubject);
            console.log(emailBody);
            console.log("=================================================");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
