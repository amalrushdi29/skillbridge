import nodemailer from "nodemailer";
import config from "../config.js";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: config.mailtrap.host,
    port: config.mailtrap.port,
    auth: {
      user: config.mailtrap.user,
      pass: config.mailtrap.pass,
    },
  });

  await transporter.sendMail({
    from: '"SkillBridge" <no-reply@skillbridge.com>',
    to,
    subject,
    html,
  });
};

export default sendEmail;