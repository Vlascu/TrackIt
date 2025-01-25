const loginForm = document.getElementById('login-form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const passwordInput = document.getElementById('password');
const registerButton = document.getElementById('register-button');

async function loginUser(loginData) {
    const response = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    });

    const result = await response.json();

    if (response.ok) {
        return result;
    } else {
        alert(result.error);
    }
}

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const loginData = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        password: passwordInput.value
    };

    try {
        await loginUser(loginData);
        alert('Login successful!');
        window.location.replace("home.html");
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

registerButton.addEventListener('click', () => {
    window.location.replace("register.html");
});
