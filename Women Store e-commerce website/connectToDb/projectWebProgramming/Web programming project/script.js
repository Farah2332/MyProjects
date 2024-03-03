const container = document.getElementById('container');
const signup = document.getElementById('register');
const loginBtn = document.getElementById('login');

signup.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
document.addEventListener('DOMContentLoaded', function () {
    // Add an event listener to the form submission
    document.querySelector('.container form').addEventListener('submit', function (event) {
        // Validate the form fields
        if (!validateForm()) {
            // If validation fails, prevent the form from submitting
            event.preventDefault();
        }
    });

    function validateForm() {
        // Get the form elements
        var nameInput = document.querySelector('.form-container input[type="text"]');
        var emailInput = document.querySelector('.form-container input[type="email"]');
        var passwordInput = document.querySelector('.form-container input[type="password"]');
        var countryInput = document.querySelector('.form-container select');

        // Validate name (not empty)
        if (nameInput.value.trim() === '') {
            alert('Please enter your name.');
            return false;
        }

        // Validate email format
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            alert('Please enter a valid email address.');
            return false;
        }

        // Validate password criteria
        var password = passwordInput.value;
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            alert('Password must be at least 8 characters and include both letters and numbers.');
            return false;
        }

        // Validate country selection
        if (countryInput.value === '' || countryInput.value === 'select country') {
            alert('Please select your country.');
            return false;
        }

        // If all validations pass, return true
        return true;
    }
});
document.addEventListener('DOMContentLoaded', function () {
    // Get icon elements by ID
    var googleIcon = document.getElementById('google-icon-login');
    var facebookIcon = document.getElementById('facebook-icon-login');
    var appleIcon = document.getElementById('apple-icon-login');
    var mailIcon = document.getElementById('mail-icon-login');

    // Add click event listeners
    googleIcon.addEventListener('click', function (event) {
        // Open the Google login/signup page in a new tab
        window.open('https://accounts.google.com/o/oauth2/v2/auth?client_id=442372174610-mhaoa3ldik3pji23ldh6ahgnej9joe8v.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fwww.google.com%2Fuser%2Fauth%2FthirdCb&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&state=type%3Dgoogle%26site%3Dus%26s%3D29835826157ccf56ae0f8ed1a3f4065f86a0b7fae99bd9a7d11968f46fb4', '_blank');
        event.preventDefault(); // Prevent the default behavior of the link
    });

    facebookIcon.addEventListener('click', function (event) {
        // Open the Facebook login/signup page in a new tab
        window.open( ' https://www.facebook.com/v12.0/dial ?client_id=1366476457331364 &redirect_uri=https://facebook.com/callback &scope=public_profile,email,user_friends &response_type=code &state=UNIQUE_STATE_STRING', '_blank');
      
        event.preventDefault(); // Prevent the default behavior of the link
    });

    appleIcon.addEventListener('click', function (event) {
        // Open the Apple login/signup page in a new tab
        window.open('https://www.apple.com', '_blank');
        event.preventDefault(); // Prevent the default behavior of the link
    });

    mailIcon.addEventListener('click', function (event) {
        // Open the email login/signup page in a new tab
        window.open('https://www.example.com', '_blank'); // Replace with your email login/signup page
        event.preventDefault(); // Prevent the default behavior of the link
    });
});







document.addEventListener('DOMContentLoaded', function () {
    // Get icon elements by ID
    var googleIcon = document.getElementById('google-icon-signup');
    var facebookIcon = document.getElementById('facebook-icon-signup');
    var appleIcon = document.getElementById('apple-icon-signup');
    var mailIcon = document.getElementById('mail-icon-signup');

    // Add click event listeners
    googleIcon.addEventListener('click', function (event) {
        // Open the Google login/signup page in a new tab
        window.open('https://accounts.google.com/o/oauth2/v2/auth?client_id=442372174610-mhaoa3ldik3pji23ldh6ahgnej9joe8v.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fwww.shein.com%2Fuser%2Fauth%2FthirdCb&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&state=type%3Dgoogle%26site%3Dus%26s%3D29835826157ccf56ae0f8ed1a3f4065f86a0b7fae99bd9a7d11968f46fb4', '_blank');
        event.preventDefault(); // Prevent the default behavior of the link
    });

    facebookIcon.addEventListener('click', function (event) {
        // Open the Facebook login/signup page in a new tab
        window.open('https://www.facebook.com', '_blank');
        event.preventDefault(); // Prevent the default behavior of the link
    });

    appleIcon.addEventListener('click', function (event) {
        // Open the Apple login/signup page in a new tab
        window.open('https://www.apple.com', '_blank');
        event.preventDefault(); // Prevent the default behavior of the link
    });

    mailIcon.addEventListener('click', function (event) {
        // Open the email login/signup page in a new tab
        window.open('https://www.example.com', '_blank'); // Replace with your email login/signup page
        event.preventDefault(); // Prevent the default behavior of the link
    });
});







function validateEmail(email) {
    // Add your email validation logic here
    return /\S+@\S+\.\S+/.test(email);
}

function validatePassword(password) {
    // Add your password validation logic here
    return password.length >= 8;
}

document.addEventListener('DOMContentLoaded', function () {
    var signUpForm = document.getElementById('sign-up-form');
    var loginForm = document.getElementById('login-form');

    function validateEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    function validatePassword(password) {
        return password.length >= 8;
    }

    function validateForm(event, emailInput, passwordInput) {
        // Validate email and password
        if (!validateEmail(emailInput.value)) {
            alert('Please enter a valid email address.');
            event.preventDefault(); // Prevent form submission
        }

        if (!validatePassword(passwordInput.value)) {
            alert('Password must be at least 8 characters.');
            event.preventDefault(); // Prevent form submission
        }
    }

    // Add submit event listeners to both forms
    signUpForm.addEventListener('submit', function (event) {
        var emailInput = document.getElementById('sign-up-email'); // Replace with your actual email input ID
        var passwordInput = document.getElementById('sign-up-password'); // Replace with your actual password input ID
        validateForm(event, emailInput, passwordInput);
    });

    loginForm.addEventListener('submit', function (event) {
        var emailInput = document.getElementById('login-email'); // Replace with your actual email input ID
        var passwordInput = document.getElementById('login-password'); // Replace with your actual password input ID
        validateForm(event, emailInput, passwordInput);
    });
});

// Open the recovery modal
function openRecoveryModal() {
    var modal = document.getElementById('recoveryModal');
    modal.style.display = 'block';
}

// Close the recovery modal
function closeRecoveryModal() {
    var modal = document.getElementById('recoveryModal');
    modal.style.display = 'none';
}

// Password recovery logic (same as before)
function recoverPassword() {
    var recoveryInfo = document.getElementById('recovery-info-modal').value;
    alert('Password recovery process initiated. Check your email or phone for instructions.');
    closeRecoveryModal(); // Close the modal after initiating recovery process
}

