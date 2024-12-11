let currentDate = new Date();
let formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

const left_date_button = document.getElementById('left-button');
const right_date_button = document.getElementById('right-button');
const change_date = document.getElementById('change-date-option');
const date_picker = document.getElementById('date-picker');
const save_workout = document.getElementById('save');
const add_workout = document.getElementById('center-button');
const cancel_add_workout = document.getElementById('cancel');
const add_set_for_workout = document.getElementById('add-set');
const workouts_list_view = document.getElementById('list-view');

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('hidden');
}

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

    HomeRequests.getWorkoutsByDate(formattedDate, workouts_list_view).catch(error => {alert("Error when getting workouts: " + error)})
}

left_date_button.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
});

right_date_button.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
});

change_date.addEventListener('click', () => {
    const datePicker = document.getElementById('date-picker');
    datePicker.value = currentDate.toISOString().split('T')[0];
    datePicker.classList.remove('hidden');
    datePicker.focus();
});

date_picker.addEventListener('change', (event) => {
    const selectedDate = new Date(event.target.value);
    if (!isNaN(selectedDate)) {
        currentDate = selectedDate;
        updateDateDisplay();
    }
    event.target.classList.add('hidden');
});

add_workout.addEventListener('click', () => {
    document.getElementById('workout-form').classList.remove('hidden');
});

cancel_add_workout.addEventListener('click', () => {
    document.getElementById('workout-form').classList.add('hidden');
});

add_set_for_workout.addEventListener('click', () => {
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

save_workout.addEventListener('click', () => {
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

    HomeRequests.saveWorkout(workoutData, workouts_list_view).catch(error => {alert("Error when saving: " + error)});

    document.getElementById('sets-list').innerHTML = '';
    document.getElementById('workout-form').classList.add('hidden');
});

window.onload = async function() {
    const userId = await HomeRequests.getUserIdFromSession();

    updateDateDisplay();

    HomeRequests.getWorkoutsByDate(formattedDate, workouts_list_view).catch(error => {alert("Error when getting workouts: " + error)})

    if (userId === -1) {
        window.location.href = 'login.html';
    } else {
        console.log('Logged in as user ID:', userId);
    }
};

window.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown-menu');
    const menuIcon = document.querySelector('.menu-icon');

    if (!menuIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

class HomeRequests{
    static append_to_list(workout, view) {
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

        view.appendChild(workoutItem);
    }
    static async getUserIdFromSession() {
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

    static async getWorkoutsByDate(date, view) {
        const response = await fetch(`http://localhost:8080/workout/alldate?date=${encodeURIComponent(date)}`, {
            method : 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        } );

        const result = await response.json();

        if (response.ok) {
            view.innerHTML = '';

            for (const [index, workout] of Object.entries(result)) {
                HomeRequests.append_to_list(workout, view);
            }
        } else {
            alert('Error fetching workouts: ' + result.error);
        }
    }

    static async saveWorkout(workout, view) {
        const response = await fetch('http://localhost:8080/workout/save', {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        } );

        const result = await response.json();

        if (response.ok) {
            HomeRequests.append_to_list(result, view)
        } else {
            alert('Workout save failed: ' + result.error);
        }
    }
}
