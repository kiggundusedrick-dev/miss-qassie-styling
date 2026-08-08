const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

async function sendBrevoEmail({
  to,
  subject,
  html
}) {

  const result =
    await brevo.transactionalEmails.sendTransacEmail({

      sender: {
        name: "Miss Qassie",
        email: "missqassiestyling@gmail.com"
      },

      to: [
        {
          email: to
        }
      ],

      subject: subject,

      htmlContent: html

    });

  console.log("BREVO EMAIL SENT:", result);

  return result;
}

module.exports = sendBrevoEmail;