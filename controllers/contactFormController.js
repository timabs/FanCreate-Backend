const nodemailer = require("nodemailer");
const pass = process.env.EMAILPASS;
const user = process.env.EMAIL;

const sendEmail = async (req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.elasticemail.com",
    port: 2525,
    auth: {
      user: user,
      pass: pass,
    },
  });
  const mailOptions = {
    from: {
      name: req.body.name,
      address: user,
    },
    to: user,
    subject: `Message from ${req.body.email}: ${req.body.subject}`,
    text: req.body.content,
    replyTo: req.body.email,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      res.send("success");
    }
  });
};

module.exports = {
  sendEmail,
};
