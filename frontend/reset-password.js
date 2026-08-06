// ==========================================
// MISS QUASSIE RESET PASSWORD
// ==========================================

const form = document.getElementById("resetForm");

const passwordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

const matchMessage = document.getElementById("matchMessage");

const saveBtn = document.getElementById("savePasswordBtn");

const messageBox = document.getElementById("resetMessage");

// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

document.getElementById("toggleNewPassword")
.addEventListener("click", () => {

    passwordInput.type =
        passwordInput.type === "password"
        ? "text"
        : "password";

});

document.getElementById("toggleConfirmPassword")
.addEventListener("click", () => {

    confirmInput.type =
        confirmInput.type === "password"
        ? "text"
        : "password";

});

// ==========================================
// PASSWORD RULES
// ==========================================

const lengthRule = document.getElementById("lengthRule");
const upperRule = document.getElementById("upperRule");
const lowerRule = document.getElementById("lowerRule");
const numberRule = document.getElementById("numberRule");
const specialRule = document.getElementById("specialRule");

// ==========================================
// CHECK PASSWORD
// ==========================================

function validatePassword() {

    const password = passwordInput.value;

    let score = 0;

    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    updateRule(lengthRule, hasLength);
    updateRule(upperRule, hasUpper);
    updateRule(lowerRule, hasLower);
    updateRule(numberRule, hasNumber);
    updateRule(specialRule, hasSpecial);

    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    strengthBar.style.width = (score * 20) + "%";

    if (score <= 2) {

        strengthBar.style.background = "#ff4d4d";
        strengthText.textContent = "Weak Password";

    }
    else if (score === 3 || score === 4) {

        strengthBar.style.background = "#f4b400";
        strengthText.textContent = "Good Password";

    }
    else {

        strengthBar.style.background = "#34c759";
        strengthText.textContent = "Strong Password ✓";

    }

    validateMatch();

}

function updateRule(element, valid){

    if(valid){

        element.classList.remove("invalid");
        element.classList.add("valid");

        element.innerHTML =
        "✔ " + element.textContent.substring(2);

    }else{

        element.classList.remove("valid");
        element.classList.add("invalid");

        element.innerHTML =
        "✖ " + element.textContent.substring(2);

    }

}

// ==========================================
// PASSWORD MATCH
// ==========================================

function validateMatch(){

    if(confirmInput.value===""){

        matchMessage.textContent="";
        saveBtn.disabled=true;
        return;

    }

    if(passwordInput.value===confirmInput.value){

        matchMessage.textContent="✔ Passwords match";
        matchMessage.style.color="#34c759";

    }else{

        matchMessage.textContent="✖ Passwords do not match";
        matchMessage.style.color="#ff4d4d";

    }

    const validPassword =
        passwordInput.value.length>=8 &&
        /[A-Z]/.test(passwordInput.value) &&
        /[a-z]/.test(passwordInput.value) &&
        /\d/.test(passwordInput.value) &&
        /[^A-Za-z0-9]/.test(passwordInput.value);

    saveBtn.disabled = !(
        validPassword &&
        passwordInput.value===confirmInput.value
    );

}

passwordInput.addEventListener("input",validatePassword);

confirmInput.addEventListener("input",validateMatch);

// ==========================================
// RESET PASSWORD
// ==========================================

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");

    console.log("TOKEN FROM URL:", token);

    saveBtn.disabled=true;
    saveBtn.textContent="Saving...";

    try{

        const response = await fetch(

            "http://localhost:5000/admin/reset-password",

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    token,

                    password:passwordInput.value

                })

            }

        );

        const data = await response.json();

        if(data.success){

            messageBox.className = "success";

            let seconds = 5;
            
            messageBox.innerHTML = `
                <h3>✅ Password Reset Successful</h3>
            
                <p>
                    Your administrator password has been updated successfully.
                </p>
            
                <p>
                    Redirecting to Login in
                    <strong id="countdown">${seconds}</strong>
                    seconds...
                </p>
            `;

            passwordInput.disabled = true;
confirmInput.disabled = true;
saveBtn.disabled = true;
            
            form.reset();
            
            const timer = setInterval(() => {
            
                seconds--;
            
                document.getElementById("countdown").textContent = seconds;
            
                if (seconds <= 0) {
            
                    clearInterval(timer);
            
                    window.location.href = "admin-login.html";
            
                }
            
            }, 1000);

        }else{

            messageBox.className="error";

            messageBox.textContent=data.message;

            saveBtn.disabled=false;
            saveBtn.textContent="🔐 Save Password";

        }

    }
    catch(error){

        console.error(error);

        messageBox.className="error";

        messageBox.textContent=
        "Unable to connect to the server.";

        saveBtn.disabled=false;
        saveBtn.textContent="🔐 Save Password";

    }

});