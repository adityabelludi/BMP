import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "BMP — Belludi Masala <onboarding@resend.dev>";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email via the Resend REST API.
 * Best-effort: never throws — returns { ok } so callers can ignore failures
 * without breaking the primary flow (placing an order, updating status).
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailArgs): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return { ok: false, error: "email-not-configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] send failed:", res.status, body);
      return { ok: false, error: `resend-${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] send error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
