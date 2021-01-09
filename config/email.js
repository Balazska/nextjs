const nodemailer = require("nodemailer");
const Email = require('email-templates');
const path = require('path')

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_SMTP,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        type: 'login',
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PWD, // generated ethereal password
    },
});
const emailProvider = new Email({
    message: {
        from: process.env.EMAIL_USER
    },
    // uncomment below to send emails in development/test env:
    send: process.env.EMAIL_SEND == 'true',
    preview: process.env.EMAIL_PREVIEW == 'true',
    transport: transporter,
    views: {
        options: {
            extension: 'ejs' // <---- HERE
        }
    }
});
console.log('email set up completed')
export { transporter, emailProvider };

// Preview only available when sending through an Ethereal account
//console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...