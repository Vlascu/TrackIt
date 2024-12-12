let currentDate = new Date();
let formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
let selectedSet = null;
let selectedWorkoutId = "-1";
let selectedWorkout = null;

const left_date_button = document.getElementById('left-button');
const right_date_button = document.getElementById('right-button');
const change_date = document.getElementById('change-date-option');
const date_picker = document.getElementById('date-picker');
const save_workout = document.getElementById('save');
const add_workout = document.getElementById('center-button');
const cancel_add_workout = document.getElementById('cancel');
const add_set_for_workout = document.getElementById('add-set');
const workouts_list_view = document.getElementById('list-view');
const workout_form = document.getElementById('workout-form');
const formButtons = document.querySelector('.form-buttons');

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

    HomeRequests.getWorkoutsByDate(formattedDate, workouts_list_view).finally();
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
   showWorkoutForm();

    save_workout.textContent = 'Save';
    workout_form.dataset.id = "-1";
    add_set_for_workout.textContent = 'Add Set';
});

cancel_add_workout.addEventListener('click', () => {
    hideWorkoutForm();
});

add_set_for_workout.addEventListener('click', () => {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;

    if (weight && reps) {

        if(add_set_for_workout.textContent === "Add Set") {
            const setItem = document.createElement('li');
            setItem.textContent = `Reps: ${reps} | Weight: ${weight} kg`;
            document.getElementById('sets-list').appendChild(setItem);
        } else if (add_set_for_workout.textContent === "Update Set" && selectedSet) {
            selectedSet.textContent = `Reps: ${reps} | Weight: ${weight} kg`;
            selectedSet = null;
        }

        document.getElementById('weight').value = '';
        document.getElementById('reps').value = '';
    } else {
        alert('Please fill in the set details.');
    }
});

function hideWorkoutForm() {
    document.getElementById('workout-form').classList.add('hidden');
}

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
        id: selectedWorkoutId,
        muscleGroup: muscle,
        exerciseName: exercise,
        sets: sets,
        date: formattedDate,
    };

    if (save_workout.textContent === "Save") {
        HomeRequests.saveWorkout(workoutData, workouts_list_view).finally();
    } else if (save_workout.textContent === "Update") {
        add_set_for_workout.textContent = 'Add Set';
        HomeRequests.updateWorkout(workoutData, workouts_list_view).finally();
    }

    document.getElementById('sets-list').innerHTML = '';
    hideWorkoutForm();
});

function showWorkoutForm() {
    document.getElementById('workout-form').classList.remove('hidden');
}

if(workouts_list_view)
{
    workouts_list_view.addEventListener('click', (event)=> {
        selectedWorkout = event.target.closest('.workouts-list-item');
        if (!selectedWorkout) return;

        showWorkoutForm();

        workout_form.dataset.id = selectedWorkout.dataset.id;
        selectedWorkoutId = selectedWorkout.dataset.id;

        const [muscleGroup, exerciseName] = selectedWorkout.querySelector('strong').textContent.split(':').map(text => text.trim());
        const setsHtml = selectedWorkout.querySelector('div').innerHTML;

        const sets = setsHtml.split('<br>').map(set => {
            const [reps, weight] = set.split('|').map(text => text.split(':')[1].trim());
            return { reps, weight: weight.replace('kg', '').trim() };
        });

        document.getElementById('muscle-name').value = muscleGroup;
        document.getElementById('exercise-name').value = exerciseName;

        const setsList = document.getElementById('sets-list');
        setsList.innerHTML = '';
        sets.forEach(({ reps, weight }) => {
            const setItem = document.createElement('li');
            setItem.textContent = `Reps: ${reps} | Weight: ${weight} kg`;
            setsList.appendChild(setItem);
        });

        save_workout.textContent = 'Update';

        const weightInput = document.getElementById('weight');
        const repsInput = document.getElementById('reps');

        setsList.querySelectorAll('li').forEach((setItem) => {
            setItem.addEventListener('click', (event) => {
                const [reps, weight] = setItem.textContent.split('|').map(text => text.split(':')[1].trim());
                repsInput.value = reps;
                weightInput.value = weight.replace('kg', '').trim();

                add_set_for_workout.textContent = "Update Set";

                selectedSet = event.target;
            });
        });

        const deleteButton = document.createElement('button');

        deleteButton.textContent = 'Delete';

        deleteButton.id = 'delete';

        formButtons.appendChild(deleteButton);

        deleteButton.addEventListener('click', ()=> {
             HomeRequests.deleteWorkout(selectedWorkoutId).finally();

             selectedWorkout.remove();

             hideWorkoutForm();
        });

    })
}

window.onload = async function() {
    const userId = await HomeRequests.getUserIdFromSession();

    updateDateDisplay();

    HomeRequests.getWorkoutsByDate(formattedDate, workouts_list_view).finally();

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
    static appendToList(workout, view) {
        const workoutId = workout.id;
        const muscleGroup = workout.muscleGroup;
        const exerciseName = workout.exerciseName;
        const sets = workout.sets.split('|');

        const formattedSets = sets.map(set => {
            const [reps, weight] = set.split(',');
            return `Reps: ${reps} | Weight: ${weight} kg`;
        }).join('<br>');

        const workoutItem = document.createElement('div');
        workoutItem.dataset.id = workoutId;
        workoutItem.classList.add('workouts-list-item');
        workoutItem.innerHTML = `
            <strong>${muscleGroup}: ${exerciseName}</strong>
            <div>${formattedSets}</div>
            `;

        view.appendChild(workoutItem);
    }

    static updateList(workout) {
        const workoutId = workout.id;
        const muscleGroup = workout.muscleGroup;
        const exerciseName = workout.exerciseName;
        const sets = workout.sets.split('|');

        const formattedSets = sets.map(set => {
            const [reps, weight] = set.split(',');
            return `Reps: ${reps} | Weight: ${weight} kg`;
        }).join('<br>');

        if (selectedWorkout) {

            selectedWorkout.dataset.id = workoutId;
            selectedWorkout.querySelector('strong').textContent = `${muscleGroup}: ${exerciseName}`;
            selectedWorkout.querySelector('div').innerHTML = formattedSets;
        }
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
                HomeRequests.appendToList(workout, view);
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
            HomeRequests.appendToList(result, view)
        } else {
            alert('Workout save failed: ' + result.error);
        }
    }

    static async updateWorkout(workout) {
        const response = await fetch('http://localhost:8080/workout/update', {
            method : 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        } );

        const result = await response.json();

        if (response.ok) {
            HomeRequests.updateList(result)
        } else {
            alert('Workout save failed: ' + result.error);
        }
    }

    static async deleteWorkout(workoutId) {
        const response = await fetch(`http://localhost:8080/workout/deleteById?id=${encodeURIComponent(workoutId)}`, {
            method : 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        } );

        const result = await response.json();

        if (response.ok) {
            alert("Workout deleted successfully");
        } else {
            alert('Workout delete failed: ' + result.error);
        }
    }
}
