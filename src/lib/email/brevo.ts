import nodemailer from "nodemailer";

export interface SendApplicationEmailParams {
  toEmail: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  jobTitle: string;
  companyName: string;
  coverLetterHtml: string;
  cvFileName?: string | null;
  cvBuffer?: Buffer | null;
}

export async function sendApplicationEmail(params: SendApplicationEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    toEmail,
    candidateName,
    candidateEmail,
    candidatePhone,
    jobTitle,
    companyName,
    coverLetterHtml,
    cvFileName,
    cvBuffer,
  } = params;

  // Configuration Brevo (SMTP ou API HTTP)
  const brevoApiKey = process.env.BREVO_API_KEY;
  const brevoSmtpKey = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY;
  const brevoSmtpUser = process.env.BREVO_SMTP_USER || "7b47b8001@smtp-brevo.com";
  const fromEmail = process.env.BREVO_FROM_EMAIL || "candidatures@jobfinder.ma";
  const fromName = process.env.BREVO_FROM_NAME || "JobFinder AI - Candidatures";

  const emailSubject = `[Candidature JobFinder AI] ${jobTitle} - ${candidateName}`;

  // Corps HTML élégant et officiel
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F8FA; color: #0D2B45; margin: 0; padding: 20px; }
          .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #D1E3EC; overflow: hidden; }
          .header { background: #0D2B45; color: #ffffff; padding: 24px; text-align: left; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: #B7D4E6; }
          .content { padding: 28px; }
          .candidate-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
          .candidate-row { margin-bottom: 6px; font-size: 13px; }
          .candidate-row strong { color: #0D2B45; }
          .letter-box { background: #FFFFFF; border-left: 4px solid #1E5A6E; padding: 16px; font-size: 13px; line-height: 1.6; color: #1E293B; white-space: pre-wrap; }
          .footer { background: #F1F5F9; padding: 16px 28px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; }
          .badge { display: inline-block; background: #E6F0F6; color: #0D2B45; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Portail Recrutement Maroc</span>
            <h1 style="margin-top: 10px;">Nouvelle Candidature Reçue</h1>
            <p>Poste : <strong>${jobTitle}</strong> chez ${companyName}</p>
          </div>
          
          <div class="content">
            <div class="candidate-card">
              <div class="candidate-row"><strong>Candidat(e) :</strong> ${candidateName}</div>
              <div class="candidate-row"><strong>Email :</strong> <a href="mailto:${candidateEmail}">${candidateEmail}</a></div>
              ${candidatePhone ? `<div class="candidate-row"><strong>Téléphone :</strong> <a href="tel:${candidatePhone}">${candidatePhone}</a></div>` : ""}
              <div class="candidate-row"><strong>Plateforme :</strong> JobFinder AI Maroc</div>
            </div>

            <h3 style="font-size: 15px; color: #0D2B45; margin-bottom: 12px;">Lettre de Motivation & Dossier Candidat</h3>
            <div class="letter-box">${coverLetterHtml}</div>

            <p style="font-size: 12px; color: #64748B; margin-top: 20px;">
              💡 <em>Vous pouvez répondre directement à cet email pour contacter directement ${candidateName}. Son adresse personnelle est configurée en Reply-To.</em>
            </p>
          </div>

          <div class="footer">
            Candidature sécurisée transmise via JobFinder AI Maroc • <a href="http://localhost:3000" style="color: #1E5A6E;">jobfinder.ma</a>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Si la clé API Brevo (v3 REST API) est présente, utilisation directe de l'API Brevo HTTPS
  if (brevoApiKey && brevoApiKey.startsWith("xkeysib-")) {
    try {
      const payload: Record<string, unknown> = {
        sender: { name: fromName, email: fromEmail },
        to: [{ email: toEmail, name: companyName }],
        replyTo: { email: candidateEmail, name: candidateName },
        subject: emailSubject,
        htmlContent: htmlBody,
      };

      if (cvBuffer && cvFileName) {
        payload.attachment = [
          {
            name: cvFileName,
            content: cvBuffer.toString("base64"),
          },
        ];
      }

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Brevo API error:", errText);
        return { success: false, error: `Brevo API error: ${res.status}` };
      }

      const data = await res.json();
      return { success: true, messageId: data.messageId };
    } catch (e) {
      console.error("Brevo API dispatch failed:", e);
      return { success: false, error: (e as Error).message };
    }
  }

  // 2. Si configuration Brevo SMTP standard (smtp-relay.brevo.com)
  if (brevoSmtpKey) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: brevoSmtpUser,
          pass: brevoSmtpKey,
        },
      });

      const attachments = cvBuffer && cvFileName ? [{ filename: cvFileName, content: cvBuffer }] : [];

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        replyTo: `"${candidateName}" <${candidateEmail}>`,
        subject: emailSubject,
        html: htmlBody,
        attachments,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("Nodemailer Brevo SMTP error:", err);
      return { success: false, error: (err as Error).message };
    }
  }

  // 3. Fallback simulé transparent (Mode développement)
  console.log(`[JobFinder AI] Simulation d'envoi Brevo Email à destination de : ${toEmail}`);
  console.log(`[JobFinder AI] Sujet : ${emailSubject}`);
  console.log(`[JobFinder AI] Candidat : ${candidateName} (${candidateEmail})`);

  return {
    success: true,
    messageId: `simulated-brevo-${Date.now()}`,
  };
}
