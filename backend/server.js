const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


console.log("I AM RUNNING THE CORRECT SERVER");

dotenv.config();

console.log("EMAIL:", process.env.EMAIL_USER);
console.log(
  "PASSWORD LENGTH:",
  process.env.EMAIL_PASS?.length
);

const pool = require("./db");
const resend = require("./email");


const adminRoutes = require("./routes/adminRoutes");

const passwordRoutes = require("./routes/passwordRoutes");

const app = express();
const PORT = 5000;

// =====================================================
// ACTIVITY LOG FUNCTION
// =====================================================

async function logActivity(
  action,
  customerName,
  description
) {

  console.log("===== LOG ACTIVITY CALLED =====");

  console.log(action);

  console.log(customerName);

  console.log(description);

  try {

    const result = await pool.query(
      `
      INSERT INTO activity_log
      (
        action,
        customer_name,
        description
      )
      VALUES
      ($1,$2,$3)
      RETURNING *
      `,
      [
        action,
        customerName,
        description
      ]
    );

    console.log(result.rows[0]);

    console.log("Activity logged successfully");

  }
  catch(error){

    console.error("LOG ERROR");

    console.error(error);

  }

}

console.log("NEW SERVER FILE IS RUNNING");

app.use(cors());
app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/admin", passwordRoutes);

app.post("/admin/test", (req, res) => {

  console.log("✅ ADMIN TEST ROUTE HIT");

  res.json({
      success: true,
      message: "Admin route is working."
  });

});

app.post("/test", (req, res) => {

  console.log("TEST ROUTE HIT");

  res.json({
      success: true,
      message: "Server is working."
  });

});

/*
====================================
HOME ROUTE
====================================
*/

app.get("/", (req, res) => {
  res.send(
    "Miss Qassie Backend is Running!"
  );
});

/*
====================================
TEST DATABASE
====================================
*/

app.get("/test-db", async (req, res) => {
  try {
    console.log(
      "Testing database connection..."
    );

    const result =
      await pool.query(
        "SELECT NOW()"
      );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
});

/*
====================================
SAVE CONTACT FORM
====================================
*/

app.post(
  "/contact",
  async (req, res) => {



    try {

      const {
        firstName,
        lastName,
        email,
        service,
        message
      } = req.body;

      const result =
        await pool.query(
          `
          INSERT INTO enquiries
          (
            first_name,
            last_name,
            email,
            service,
            message
          )
          VALUES
          ($1,$2,$3,$4,$5)
          RETURNING *
          `,
          [
            firstName,
            lastName,
            email,
            service,
            message
          ]
        );

      console.log(
        "Saved to database:",
        result.rows[0]
      );

      console.log("================================");
      console.log("FROM:", process.env.EMAIL_USER);
      console.log("TO:", "missqassiestyling@gmail.com");
      console.log("================================");
      // Email notification
      console.log("Starting sendMail...");
      await resend.emails.send({

        from: "Miss Qassie <onboarding@resend.dev>",
    
        to: process.env.CLIENT_EMAIL,
    
        subject: "New Miss Quassie Enquiry",
    
        html: `
            <h2>New Enquiry Received</h2>
    
            <p><strong>First Name:</strong> ${firstName}</p>
    
            <p><strong>Last Name:</strong> ${lastName}</p>
    
            <p><strong>Email:</strong> ${email}</p>
    
            <p><strong>Service:</strong> ${service}</p>
    
            <p><strong>Message:</strong></p>
    
            <p>${message}</p>
        `
    
    });

    console.log("Finished sendMail");


      res.json({
        success: true,
        message:
          "Enquiry received successfully!"
      });

    } catch (error) {

      console.error("========== CONTACT ERROR ==========");
      console.error(error);
      console.error("MESSAGE:", error.message);
      console.error("STACK:", error.stack);
      console.error("===================================");
  
      res.status(500).json({
          success: false,
          message: error.message
      });
  
  }

    }

  
);

/*
====================================
SEND REPLY EMAIL
====================================
*/

app.post(
  "/reply",
  async (req, res) => {

    console.log("🔥 REPLY ROUTE HIT - VERSION 2");

    try {

      const {
        enquiryId,
        email,
        subject,
        message
      } = req.body;

      console.log({
        enquiryId,
        email,
        subject,
        message
      });


      await resend.emails.send({

        from: "Miss Quassie <onboarding@resend.dev>",
    
        to: email,
    
        subject: subject,
    
        text: message
    
    });

      console.log("Updating enquiry:", enquiryId);

await pool.query(
  `
  UPDATE enquiries
  SET
    reply_subject = $1,
    reply_message = $2,
    replied_at = NOW()
  WHERE id = $3
  `,
  [
    subject,
    message,
    enquiryId
  ]
);

await logActivity(

  "Reply Sent",

  email,

  `Reply sent with subject "${subject}"`

);

console.log("Reply history saved.");

      res.json({
        success: true,
        message:
          "Reply sent successfully."
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to send email."
      });

    }

  }
);

/*
====================================
GET ALL ENQUIRIES
====================================
*/

const authenticateAdmin =
require("./middleware/authenticateAdmin");

app.get(

    "/enquiries",

    authenticateAdmin,

    async (req, res) => {

        try {

            const result = await pool.query(

                "SELECT * FROM enquiries ORDER BY created_at DESC"

            );

            res.json(result.rows);

        } catch (err) {

            console.error(err);

            res.status(500).json({

                message: "Failed to fetch enquiries."

            });

        }

    }

);

/*
====================================
DELETE ENQUIRY
====================================
*/

app.delete(
  "/enquiries/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;

      const result =
        await pool.query(
          `
          DELETE FROM enquiries
          WHERE id = $1
          RETURNING *
          `,
          [id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404)
        .json({
          success: false,
          message:
            "Enquiry not found"
        });
      }

      res.json({
        success: true,
        message:
          "Enquiry deleted successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Database error"
      });

    }

  }
);

/*
====================================
MARK AS CONTACTED
====================================
*/

app.put(
  "/enquiries/:id/contacted",
  async (req, res) => {

    console.log(
      "CONTACTED ROUTE HIT"
    );

    try {

      const id =
        req.params.id;

      const result =
        await pool.query(
          `
          UPDATE enquiries
          SET contacted = TRUE
          WHERE id = $1
          RETURNING *
          `,
          [id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404)
        .json({
          success: false,
          message:
            "Enquiry not found"
        });
      }

      res.json({
        success: true,
        message:
          "Enquiry marked as contacted.",
        enquiry:
          result.rows[0]
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Database error"
      });

    }

  }
);

/*
====================================
START SERVER
====================================
*/

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});

// =====================================================
// MARK ENQUIRY AS REPLIED
// =====================================================

app.put(
  "/enquiries/:id/replied",
  async (req, res) => {

    try {

      const { id } = req.params;

      const result =
        await pool.query(
          `
          UPDATE enquiries
          SET replied = TRUE
          WHERE id = $1
          RETURNING *
          `,
          [id]
        );

      if (result.rows.length === 0) {

        return res.status(404).json({
          success: false,
          message: "Enquiry not found."
        });

      }

      res.json({
        success: true,
        message: "Enquiry marked as replied.",
        enquiry: result.rows[0]
      });

    }
    catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Database error."
      });

    }

  }
);

setInterval(() => {
  console.log("Server still alive...");
}, 5000);