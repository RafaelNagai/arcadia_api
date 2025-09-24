const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Criar um "transporter" para o envio
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Seu e-mail do Gmail
      pass: process.env.EMAIL_PASS, // Sua senha de app do Gmail
    },
  });

  // 2. Definir as opções do e-mail
  const mailOptions = {
    from: `Arcadia API <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Enviar o e-mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;