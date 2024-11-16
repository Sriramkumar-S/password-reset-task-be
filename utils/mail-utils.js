import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sriramsrk005@gmail.com", // gmail account from which You got app password
        pass: process.env.MAIL_KEY,
    },
});
// sample mail sending details
export const mailOptions = {
    from: "sriramsrk005@gmail.com",
    to: ["sriramkumar1161@gmail.com"],
    subject: "Email Testing",
    text: "Sending mails for Testing Purpose",
};