import nodemailer from 'nodemailer'

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Wrap in an async IIFE so we can use await.
const sendEmail = async ({to,subject,text,html}) => {
  const info = await transporter.sendMail({
    from: '"Ajibona raheem" <rosanna.muller83@ethereal.email>',
    to,
    subject,
    text,
    html,
  });

  console.log("Message sent:", info.messageId);
  return info
};

export {sendEmail}

