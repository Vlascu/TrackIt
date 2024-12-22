function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('hidden');
}

async function fetchUserProfile() {
    fetch('http://localhost:8080/user/profile')
        .then(async (response) => {
            const user = await response.json();

            document.getElementById('firstname').textContent = `First Name: ${user.firstName}`;
            document.getElementById('lastname').textContent = `Last Name: ${user.lastName}`;
            document.getElementById('height').textContent = `Height: ${user.height} cm`;
            document.getElementById('bodyweight').textContent = `Bodyweight: ${user.bodyWeight} kg`;
            document.getElementById('age').textContent = `Age: ${user.age}`;
            document.getElementById('bmi').textContent = `BMI: ${user.bmi}`;
        })
        .catch((error) => {
        alert('Failed to fetch user profile');
    })
}

window.onload = async function (){
    const userId = await getUserIdFromSession();

    if (userId === -1) {
        window.location.href = 'login.html';
    } else {
        console.log('Logged in as user ID:', userId);
    }

    await fetchUserProfile();
}

async function getUserIdFromSession() {
    const response = await fetch('http://localhost:8080/user/sessionId', {
        method: 'GET'
    });

    const result = await response.json();

    if (response.ok) {
        return result.userId;
    } else {
        return -1
    }
}
