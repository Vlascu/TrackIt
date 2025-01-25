const registerForm = document.getElementById('register-form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const passwordInput = document.getElementById('password');
const bodyWeightInput = document.getElementById('bodyWeight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');
const loginButton = document.getElementById("login-button");

registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const password = passwordInput.value;
    const bodyWeight = bodyWeightInput.value;
    const height = heightInput.value;
    const age = ageInput.value;

    const userData = {
        firstName: firstName,
        lastName: lastName,
        password: password,
        bodyWeight: bodyWeight,
        height: height,
        age: age
    };

    const response = await fetch('http://localhost:8080/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    if (response.ok) {
        alert('User registered successfully!');
        console.log('User registered successfully!');
        window.location.replace("home.html")
    } else {
        alert('Registration failed: ' + result.error);
        console.log('Registration failed: ' + result.error);
    }
});

loginButton.addEventListener('click', () => {
    window.location.replace("login.html");
});
