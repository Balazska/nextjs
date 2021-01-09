const nodemailer = require("nodemailer");
const Email = require('email-templates');
const path = require('path')

// create reusable transporter object using the default SMTP transport
const transporter =nodemailer.createTransport({
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
  },
  juiceResources: {
    preserveImportant: true,
    webResources: {
      //
      // this is the relative directory to your CSS/image assets
      // and its default path is `build/`:
      //
      // e.g. if you have the following in the `<head`> of your template:
      // `<link rel="stylesheet" href="style.css" data-inline="data-inline">`
      // then this assumes that the file `build/style.css` exists
      //
      relativeTo: path.join(__dirname, '..', 'public')
      //
      // but you might want to change it to something like:
      // relativeTo: path.join(__dirname, '..', 'assets')
      // (so that you can re-use CSS/images that are used in your web-app)
      //
    }
  }
});
console.log('email set up completed')
export {transporter, emailProvider};

// Preview only available when sending through an Ethereal account
//console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
