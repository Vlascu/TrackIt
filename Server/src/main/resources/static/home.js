async function getUserIdFromSession() {
    const response = await fetch('http://localhost:8080/user/sessionId', {
        method : 'GET'
    } );

    const result = await response.json();

    if (response.ok) {
        return result.userId;
    } else {
        return -1
    }
}

function append_to_list(workout) {
    const muscleGroup = workout.muscleGroup;
    const exerciseName = workout.exerciseName;
    const sets = workout.sets.split('|');

    const formattedSets = sets.map(set => {
        const [reps, weight] = set.split(',');
        return `Reps: ${reps} | Weight: ${weight} kg`;
    }).join('<br>');

    const workoutItem = document.createElement('div');
    workoutItem.classList.add('list-item');
    workoutItem.innerHTML = `
            <strong>${muscleGroup}: ${exerciseName}</strong>
            <div>${formattedSets}</div>
            `;

    document.getElementById('list-view').appendChild(workoutItem);
}

async function getWorkoutsByDate(date) {
    const response = await fetch(`http://localhost:8080/workout/alldate?date=${encodeURIComponent(date)}`, {
        method : 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    } );

    const result = await response.json();

    const workoutsList = document.getElementById('list-view');

    if (response.ok) {
        workoutsList.innerHTML = '';

        for (const [index, workout] of Object.entries(result)) {
            append_to_list(workout);
        }
    } else {
        alert('Error fetching workouts: ' + result.error);
    }
}
async function saveWorkout(workout) {
    const response = await fetch('http://localhost:8080/workout/save', {
        method : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(workout)
    } );

    const result = await response.json();

    if (response.ok) {
        append_to_list(result)
    } else {
        alert('Workout save failed: ' + result.error);
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('hidden');
}

window.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown-menu');
    const menuIcon = document.querySelector('.menu-icon');
    if (!menuIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

let currentDate = new Date();
let formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function updateDateDisplay() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
    formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    getWorkoutsByDate(formattedDate).catch(error => {alert("Error when getting workouts: " + error)})
}

document.getElementById('left-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
});

document.getElementById('right-button').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
});

document.getElementById('change-date-option').addEventListener('click', () => {
    const datePicker = document.getElementById('date-picker');
    datePicker.value = currentDate.toISOString().split('T')[0];
    datePicker.classList.remove('hidden');
    datePicker.focus();
});

document.getElementById('date-picker').addEventListener('change', (event) => {
    const selectedDate = new Date(event.target.value);
    if (!isNaN(selectedDate)) {
        currentDate = selectedDate;
        updateDateDisplay();
    }
    event.target.classList.add('hidden');
});

document.getElementById('center-button').addEventListener('click', () => {
    document.getElementById('workout-form').classList.remove('hidden');
});

document.getElementById('cancel').addEventListener('click', () => {
    document.getElementById('workout-form').classList.add('hidden');
});

document.getElementById('add-set').addEventListener('click', () => {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;

    if (weight && reps) {
        const setItem = document.createElement('li');
        setItem.textContent = `Reps: ${reps} | Weight: ${weight} kg`;
        document.getElementById('sets-list').appendChild(setItem);

        document.getElementById('weight').value = '';
        document.getElementById('reps').value = '';
    } else {
        alert('Please fill in the set details.');
    }
});

document.getElementById('save').addEventListener('click', () => {
    const muscle = document.getElementById('muscle-name').value.trim();
    const exercise = document.getElementById('exercise-name').value.trim();
    const sets = Array.from(document.getElementById('sets-list').children).map((item) => {
        const [reps, weight] = item.textContent.trim().split('|').map((text) => text.split(':')[1].trim());
        const weightValue = weight.replace('kg', '').trim();
        return `${reps},${weightValue}`;
    }).join('|');

    if (!muscle || !exercise || sets.length === 0) {
        alert('Please fill in all fields and add at least one set.');
        return;
    }

    //todo: more validation

    const workoutData = {
        muscleGroup: muscle,
        exerciseName: exercise,
        sets: sets,
        date: formattedDate,
    };

    saveWorkout(workoutData).catch(error => {alert("Error when saving: " + error)});

    document.getElementById('sets-list').innerHTML = '';
    document.getElementById('workout-form').classList.add('hidden');
});

window.onload = async function() {
    const userId = await getUserIdFromSession();

    updateDateDisplay();

    getWorkoutsByDate(formattedDate).catch(error => {alert("Error when getting workouts: " + error)})

    if (userId === -1) {
        window.location.href = 'login.html';
    } else {
        console.log('Logged in as user ID:', userId);
    }
};
