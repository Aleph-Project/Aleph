import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

const transporter = nodemailer.createTransport({
    service: "gmail", // Cambia esto si usas otro proveedor
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export async function sendActivationEmail(to: string, activationLink: string) {
    const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject: "Activa tu cuenta en Aleph",
        html: `<p>Gracias por registrarte. Haz clic en el siguiente enlace para activar tu cuenta:</p><p><a href="${activationLink}">${activationLink}</a></p>`
    };
    await transporter.sendMail(mailOptions);
}

export async function sendResetCodeEmail(to: string, code: string) {
    const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject: "Código de recuperación de contraseña Aleph",
        html: `<p>Tu código de recuperación es: <b>${code}</b></p>`
    };
    await transporter.sendMail(mailOptions);
}
