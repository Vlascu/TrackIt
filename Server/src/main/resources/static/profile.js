function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('hidden');
}

function getBmiCategory(bmiValue) {
    if (bmiValue < 18.5)
        return "Underweight";
    else if (bmiValue >= 18.5 && bmiValue < 25)
        return "Healthy weight";
    else if (bmiValue >= 25 && bmiValue < 30)
        return "Overweight";
    else if (bmiValue >= 30)
        return "Obese";
    return "Undefined";
}

async function fetchUserProfile() {
    fetch('http://localhost:8080/user/current-user')
        .then(async (response) => {
            const user = await response.json();

            document.getElementById('firstname').textContent = `First Name: ${user.firstName}`;
            document.getElementById('lastname').textContent = `Last Name: ${user.lastName}`;
            document.getElementById('height').textContent = `Height: ${user.height} cm`;
            document.getElementById('bodyweight').textContent = `Bodyweight: ${user.bodyWeight} kg`;
            document.getElementById('age').textContent = `Age: ${user.age}`;
            document.getElementById('bmi').textContent = `BMI: ${user.bmi.toFixed(2)}`;
            document.getElementById('bmi-category').textContent = `BMI Category: ${getBmiCategory(user.bmi)}`;
        })
        .catch((error) => {
        alert('Failed to fetch user profile');
    })
}

async function fetchWeightUpdates() {
    try {
        const response = await fetch('http://localhost:8080/user/get_updates');

        if (!response.ok) {
           alert('Failed to fetch weight updates');
        }
        const weightUpdates = await response.json();

        const weightUpdatesArray = Object.values(weightUpdates);

        const labels = weightUpdatesArray.map(update => `${update.day}/${update.month}/${update.year}`);
        const data = weightUpdatesArray.map(update => update.newWeightValue);

        const ctx = document.getElementById('weight-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight Over Time',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

window.onload = async function (){
    const userId = await getUserIdFromSession();

    if (userId === -1) {
        window.location.href = 'login.html';
    } else {
        console.log('Logged in as user ID:', userId);
    }

    await fetchUserProfile();
    await fetchWeightUpdates();
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

async function saveWeight() {
    const newWeight = document.getElementById('new-weight-input').value;

    if (!newWeight) {
        alert('Please enter a valid weight.');
        return;
    }

    try {
        let currentDate = new Date();
        let formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

        const updateData = {
           weight: newWeight,
            date: formattedDate
        };

        const response = await fetch('http://localhost:8080/user/new_weight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            alert('Failed to update weight');
        }

        document.getElementById('bodyweight').textContent = `Bodyweight: ${newWeight} kg`;

        cancelWeightUpdate();

        alert('Weight updated successfully!');

        await fetchWeightUpdates()
    } catch (error) {
        console.error(error);
        alert('An error occurred while updating weight.');
    }
}

function enableWeightUpdate() {
    document.getElementById('update-weight-btn').style.display = 'none';
    document.getElementById('weight-input-container').style.display = 'block';
}

function cancelWeightUpdate() {
    document.getElementById('weight-input-container').style.display = 'none';
    document.getElementById('update-weight-btn').style.display = 'inline';
}
