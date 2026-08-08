console.log("PASSWORD CONTROLLER FILE LOADED");
console.log("PASSWORD CONTROLLER LOADED");
const crypto = require("crypto");
const pool = require("../db");
const sendBrevoEmail = require("../email");
const bcrypt = require("bcrypt");

// =====================================
// FORGOT PASSWORD
// =====================================

async function forgotPassword(req, res) {

    console.log("FORGOT PASSWORD FUNCTION CALLED");
    console.log("FORGOT PASSWORD ROUTE HIT");


    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required."
            });

        }

        const adminResult = await pool.query(

            "SELECT * FROM admins WHERE email = $1",

            [email]

        );

        if (adminResult.rows.length === 0) {

            return res.json({
        
                success: true,
        
                message:
                "If the email exists, a password reset link has been sent."
        
            });
        
        }

        const admin = adminResult.rows[0];

        // Generate secure random token
        const token = crypto.randomBytes(32).toString("hex");

        // Expires after 15 minutes
        const expires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await pool.query(

            `
            INSERT INTO password_reset_tokens
            (
                admin_id,
                token,
                expires_at
            )
            VALUES
            ($1,$2,$3)
            `,

            [
                admin.id,
                token,
                expires
            ]

        );

       

const resetLink =
`${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

console.log("RESET LINK:");
console.log(resetLink);

await sendBrevoEmail({

    to: email,

    subject: "Miss Qassie Password Reset",

    html: `

        <h2>Password Reset Request</h2>

        <p>Hello ${admin.full_name},</p>

        <p>
        Click the button below to reset your password.
        </p>

        <a
            href="${resetLink}"
            style="
                background:#C9A96E;
                color:white;
                padding:12px 25px;
                text-decoration:none;
                border-radius:6px;
                display:inline-block;
            "
        >
            Reset Password
        </a>

        <p>
        This link expires in 15 minutes.
        </p>

    `
});

        res.json({

            success: true,

            message:
            "Password reset email sent."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:
            "Internal server error."

        });

    }

}

// =====================================
// RESET PASSWORD
// =====================================

async function resetPassword(req,res){

    try{

        const {
            token,
            password
        } = req.body;
        
        console.log("================================");
        console.log("TOKEN RECEIVED:");
        console.log(token);
        
        console.log("PASSWORD:");
        console.log(password);
        console.log("================================");

        const result=

        await pool.query(

            `
            SELECT *
            FROM password_reset_tokens
            WHERE token=$1
            AND used=false
            AND expires_at>NOW()
            `,

            [token]

        );

        if(result.rows.length===0){

            return res.status(400).json({

                success:false,

                message:"Invalid or expired token."

            });

        }

        const reset=result.rows[0];

        const hashed=

        await bcrypt.hash(password,10);

        await pool.query(

            `
            UPDATE admins
            SET password_hash=$1
            WHERE id=$2
            `,

            [

                hashed,

                reset.admin_id

            ]

        );

        await pool.query(

            `
            UPDATE password_reset_tokens
            SET used=true
            WHERE id=$1
            `,

            [

                reset.id

            ]

        );

        res.json({

            success:true,

            message:"Password updated successfully."

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal server error."

        });

    }

}

module.exports={

    forgotPassword,

    resetPassword

};