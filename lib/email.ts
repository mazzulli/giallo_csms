import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: "Giallo Volt CSMS <no-reply@giallovolt.com.br>",
      to: email,
      subject: `Seu codigo de verificação: ${code}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #0a0a0a; padding: 12px 24px; border-radius: 8px;">
              <span style="color: #FFD60A; font-size: 20px; font-weight: 700; letter-spacing: 1px;">CSMS</span>
            </div>
          </div>
          <div style="background: #f9f9f9; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="margin: 0 0 8px; color: #0a0a0a; font-size: 18px;">Codigo de Verificacao</h2>
            <p style="margin: 0 0 24px; color: #6b6b6b; font-size: 14px;">
              Use o codigo abaixo para acessar o painel CSMS:
            </p>
            <div style="background: #0a0a0a; border-radius: 8px; padding: 16px; margin: 0 auto; max-width: 200px;">
              <span style="color: #FFD60A; font-size: 32px; font-weight: 700; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="margin: 24px 0 0; color: #a3a3a3; font-size: 12px;">
              Este codigo expira em 10 minutos.
            </p>
          </div>
          <p style="text-align: center; margin-top: 24px; color: #a3a3a3; font-size: 11px;">
            Charge Station Management System - OCPP 2.0.1
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: "Failed to send email" };
  }
}
