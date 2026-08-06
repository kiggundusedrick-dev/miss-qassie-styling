require = undefined; // Ignore if running in browser

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("loginError");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

// ===========================
// SHOW / HIDE PASSWORD
// ===========================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "👁";

    }

});

// ===========================
// REMEMBER EMAIL
// ===========================

const savedEmail = localStorage.getItem("rememberedEmail");

if (savedEmail) {

    document.getElementById("email").value = savedEmail;
    document.getElementById("rememberMe").checked = true;

}

passwordInput.value = "";

// ===========================
// LOGIN
// ===========================

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    errorBox.style.display = "none";

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    try {

        const response = await fetch(
            "https://miss-qassie-backend.onrender.com/admin/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email,
                    password })
            }
        );
        
        console.log("Status:", response.status);
        
        const data = await response.json();
        if (data.success) {

            // Save JWT
            localStorage.setItem("adminToken", data.token);
        
            // Save admin information
            localStorage.setItem("adminName", data.admin.full_name);
        
            localStorage.setItem("adminRole", data.admin.role);

            if (document.getElementById("rememberMe").checked) {

                localStorage.setItem(
                    "rememberedEmail",
                    email
                );

            } else {

                localStorage.removeItem(
                    "rememberedEmail"
                );

            }

            passwordInput.value = "";

            window.location.href = "./admin.html";

        } else {

            errorBox.textContent = data.message;
            errorBox.style.display = "block";

            document.getElementById(
                "forgotPasswordContainer"
            ).style.display = "block";

        }

    } catch (err) {

        console.error(err);

        errorBox.textContent =
            "Cannot connect to the backend server.";

        errorBox.style.display = "block";

    }

    loginBtn.disabled = false;
    loginBtn.textContent = "Login";


});

// =====================================
// FORGOT PASSWORD
// =====================================

document
.getElementById("forgotPasswordLink")
.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {

        alert("Please enter your email first.");

        return;

    }

    try {

        const response = await fetch(
            "https://miss-qassie-backend.onrender.com/admin/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        );

        const text = await response.text();

console.log(text);

const data = JSON.parse(text);

        alert(data.message);

    } catch (err) {

        console.error("Forgot Password Error:", err);
    
        alert("Unable to contact the server.");
    
    }
});