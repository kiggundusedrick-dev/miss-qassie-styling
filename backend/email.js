console.log("BREVO EMAIL MODULE LOADED");

async function sendBrevoEmail({
    to,
    subject,
    html
}) {

    console.log("========== BREVO EMAIL SEND ==========");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);

    try {

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },

                body: JSON.stringify({

                    sender: {
                        name: "Miss Qassie Styling",
                        email: "missqassiestyling@gmail.com"
                    },

                    replyTo: {
                        name: "Miss Qassie Styling",
                        email: "missqassiestyling@gmail.com"
                    },

                    to: [
                        {
                            email: to
                        }
                    ],

                    subject: subject,

                    htmlContent: html

                })
            }
        );

        const data = await response.json();

        console.log("BREVO STATUS:", response.status);
        console.log("BREVO RESPONSE:", data);

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.code ||
                "Brevo failed to send email."
            );

        }

        console.log("=====================================");
        console.log("BREVO EMAIL SENT SUCCESSFULLY");
        console.log("MESSAGE ID:", data.messageId);
        console.log("=====================================");

        return data;

    } catch (error) {

        console.error("========== BREVO SEND ERROR ==========");
        console.error(error);
        console.error("=====================================");

        throw error;
    }
}

module.exports = sendBrevoEmail;