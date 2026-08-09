const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});


async function sendBrevoEmail({
    to,
    subject,
    html,
    text = ""
}) {

    const result =
        await brevo.transactionalEmails.sendTransacEmail({

            sender: {
                name: "Miss Qassie",
                email: process.env.EMAIL_USER
            },

            to: [
                {
                    email: to
                }
            ],

            replyTo: {
                name: "Miss Qassie",
                email: process.env.EMAIL_USER
            },

            subject: subject,

            htmlContent: html,

            textContent: text

        });

    console.log("================================");
    console.log("BREVO EMAIL SENT SUCCESSFULLY");
    console.log("MESSAGE ID:", result.messageId);
    console.log("TO:", to);
    console.log("REPLY-TO:", process.env.EMAIL_USER);
    console.log("================================");

    return result;
}


module.exports = sendBrevoEmail;