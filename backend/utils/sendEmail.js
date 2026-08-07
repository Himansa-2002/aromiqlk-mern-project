import nodemailer from 'nodemailer';
// Restarting server to load .env

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: `Aromiq.lk <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text // fallback
    };

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
