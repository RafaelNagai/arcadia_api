import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;       // destinatário
  subject: string;     // assunto
  message?: string;    // texto alternativo
  html?: string;       // conteúdo HTML
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1. Criar o transporter para envio
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Definir opções do e-mail
  const mailOptions = {
    from: `Arcadia API <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3. Enviar e-mail
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
