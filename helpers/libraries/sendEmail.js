const nodemailer = require('nodemailer');

const sendEmail = async(mailOptions) => {
    let transporter = nodemailer.createTransport({
       host: process.env.SMTP_HOST,
       port: process.env.SMTP_PORT,
       auth: {
           user: process.env.SMTP_USER,
           pass: process.env.SMTP_PASS,
       } 
    });

    let info = transporter.sendMail(mailOptions);
    console.log(`Message sent`);

}

module.exports = sendEmail;