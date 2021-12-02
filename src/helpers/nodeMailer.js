const nodemailer = require("nodemailer");

const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// send mail
exports.send = function (to, subject, content) {
  smtpTransport.sendMail(
    {
      from: process.env.SMTP_USERNAME, // sender email address
      to: to, // user email_id
      subject: subject, // Subject line
      html: content,
    },
    function (mailError, info) {
      if (!mailError) {
        console.log(info);
        console.log("mail_info " + info.messageId);
      } else {
        console.log(mailError);
      }
    }
  );
};
