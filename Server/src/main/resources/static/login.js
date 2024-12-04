document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;

    const loginData = {
        firstName: firstName,
        lastName: lastName,
        password: password
    };

    const response = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    });

    const result = await response.json();
    if (response.ok) {
        alert('Login successful!');
        window.location.replace("home.html")
    } else {
        alert('Login failed: ' + result.error);
    }
});

document.getElementById('register-button').addEventListener('click', ()=> {
    window.location.replace("register.html");
});