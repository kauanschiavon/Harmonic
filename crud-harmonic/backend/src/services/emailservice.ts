import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true para porta 465, false para 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendResetEmailPassword(email: string, token : string){

    //
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Harmonic" <${process.env.SMTP_USER}>`,
        to: email,
        subject:"Redefinição de senha",
        html:  `
      <p>Você solicitou a redefinição de senha.</p>
      <p>Clique no link abaixo para criar uma nova senha. Este link expira em 24 horas:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
    });
}