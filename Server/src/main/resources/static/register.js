document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;
    const bodyWeight = document.getElementById('bodyWeight').value;
    const height = document.getElementById('height').value;
    const age = document.getElementById('age').value;

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

document.getElementById('login-button').addEventListener('click', ()=> {
    window.location.replace("login.html");
});
