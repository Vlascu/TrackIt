let currentDate = new Date();
let formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
let selectedSet = null;
let selectedWorkoutId = "-1";
let selectedWorkout = null;

const leftDateButton = document.getElementById('left-button');
const rightDateButton = document.getElementById('right-button');
const dateChanger = document.getElementById('change-date-option');
const datePicker = document.getElementById('date-picker');
const saveWorkoutBtn = document.getElementById('save');
const addWorkoutBtn = document.getElementById('center-button');
const cancelAddWorkoutBtn = document.getElementById('cancel');
const addSetWorkoutBtn = document.getElementById('add-set');
const workoutsListView = document.getElementById('list-view');
const addWorkoutForm = document.getElementById('workout-form');
const formButtons = document.querySelector('.form-buttons');
const muscleSelect = document.getElementById('muscle-name');
const exerciseSelect = document.getElementById('exercise-name');
const workoutSetsList = document.getElementById('sets-list');

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

async function updateDateDisplay() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
    formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    await HomeRequests.getWorkoutsByDate(formattedDate, workoutsListView);
}

leftDateButton.addEventListener('click', async() => {
    currentDate.setDate(currentDate.getDate() - 1);
    await updateDateDisplay();
});

rightDateButton.addEventListener('click', async() => {
    currentDate.setDate(currentDate.getDate() + 1);
    await updateDateDisplay();
});

dateChanger.addEventListener('click', () => {
    const datePicker = document.getElementById('date-picker');
    datePicker.value = currentDate.toISOString().split('T')[0];
    datePicker.classList.remove('hidden');
    datePicker.focus();
});

datePicker.addEventListener('change', async(event) => {
    const selectedDate = new Date(event.target.value);
    if (!isNaN(selectedDate)) {
        currentDate = selectedDate;
        await updateDateDisplay();
    }
    event.target.classList.add('hidden');
});

addWorkoutBtn.addEventListener('click', () => {
    showWorkoutForm();

    saveWorkoutBtn.textContent = 'Save';
    addWorkoutForm.dataset.id = "-1";
    addSetWorkoutBtn.textContent = 'Add Set';
});

cancelAddWorkoutBtn.addEventListener('click', () => {
    const selects = addWorkoutForm.querySelectorAll('select');

    selects.forEach(select => {
        select.selectedIndex = 0;
    });

    hideWorkoutForm();
});

addSetWorkoutBtn.addEventListener('click', () => {
    const weight = document.getElementById('weight').value;
    const reps = document.getElementById('reps').value;

    if (weight && reps) {

        if (addSetWorkoutBtn.textContent === "Add Set") {
            const setItem = document.createElement('li');
            setItem.textContent = `Reps: ${reps} | Weight: ${weight} kg`;
            workoutSetsList.appendChild(setItem);
        } else if (addSetWorkoutBtn.textContent === "Update Set" && selectedSet) {
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

saveWorkoutBtn.addEventListener('click', async () => {
    const muscle = document.getElementById('muscle-name').value.trim();
    const exercise = document.getElementById('exercise-name').value.trim();
    const sets = Array.from(workoutSetsList.children).map((item) => {
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

    if (saveWorkoutBtn.textContent === "Save") {
        await HomeRequests.saveWorkout(workoutData, workoutsListView);
    } else if (saveWorkoutBtn.textContent === "Update") {
        addSetWorkoutBtn.textContent = 'Add Set';
        await HomeRequests.updateWorkout(workoutData, workoutsListView);
    }

    workoutSetsList.innerHTML = '';
    hideWorkoutForm();
});

function showWorkoutForm() {
    document.getElementById('workout-form').classList.remove('hidden');
}

if (workoutsListView) {
    workoutsListView.addEventListener('click', (event) => {
        selectedWorkout = event.target.closest('.workouts-list-item');
        if (!selectedWorkout) return;

        showWorkoutForm();

        addWorkoutForm.dataset.id = selectedWorkout.dataset.id;
        selectedWorkoutId = selectedWorkout.dataset.id;

        const [muscleGroup, exerciseName] = selectedWorkout.querySelector('strong').textContent.split(':').map(text => text.trim());
        const setsHtml = selectedWorkout.querySelector('div').innerHTML;

        const sets = setsHtml.split('<br>').map(set => {
            const [reps, weight] = set.split('|').map(text => text.split(':')[1].trim());
            return {reps, weight: weight.replace('kg', '').trim()};
        });

        document.getElementById('muscle-name').value = muscleGroup;
        document.getElementById('exercise-name').value = exerciseName;

        const setsList = workoutSetsList;
        setsList.innerHTML = '';
        sets.forEach(({reps, weight}) => {
            const setItem = document.createElement('li');
            setItem.textContent = `Reps: ${reps} | Weight: ${weight} kg`;
            setsList.appendChild(setItem);
        });

        saveWorkoutBtn.textContent = 'Update';

        const weightInput = document.getElementById('weight');
        const repsInput = document.getElementById('reps');

        setsList.querySelectorAll('li').forEach((setItem) => {
            setItem.addEventListener('click', (event) => {
                const [reps, weight] = setItem.textContent.split('|').map(text => text.split(':')[1].trim());
                repsInput.value = reps;
                weightInput.value = weight.replace('kg', '').trim();

                addSetWorkoutBtn.textContent = "Update Set";

                selectedSet = event.target;

                addButton('Remove Set', 'remove-set', formButtons, 'click', (button) => {
                    selectedSet.remove();

                    button.remove();
                });
            });
        });

        addButton('Delete', 'delete', formButtons, 'click', async (button) => {
            await HomeRequests.deleteWorkout(selectedWorkoutId);

            selectedWorkout.remove();

            button.remove();
            workoutSetsList.innerHTML = '';
            hideWorkoutForm();
        });

    })
}

function addButton(textContent, id, parent, type, listener) {
    const button = document.createElement('button');

    button.textContent = textContent;

    button.id = id;

    parent.appendChild(button);

    button.addEventListener(type, () => listener(button));
}
muscleSelect.addEventListener('change', async () => {
    const selectedMuscle = muscleSelect.value;
    await HomeRequests.getAllExercisesByMuscleGroup(selectedMuscle);
});

window.onload = async function () {
    const userId = await HomeRequests.getUserIdFromSession();

    await updateDateDisplay();

    await HomeRequests.getWorkoutsByDate(formattedDate, workoutsListView);

    if (userId === -1) {
        window.location.href = 'login.html';
    } else {
        console.log('Logged in as user ID:', userId);
    }
};

window.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-menu');
    const menuIcon = document.querySelector('.menu-icon');

    if (!menuIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

class HomeRequests {
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
            method: 'GET'
        });

        const result = await response.json();

        if (response.ok) {
            return result.userId;
        } else {
            return -1
        }
    }

    static async getWorkoutsByDate(date, view) {
        const response = await fetch(`http://localhost:8080/workout/alldate?date=${encodeURIComponent(date)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

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

    static async getAllExercisesByMuscleGroup(muscleGroup) {
        const response = await fetch(`http://localhost:8080/workout/exercises?muscleGroup=${encodeURIComponent(muscleGroup)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            exerciseSelect.innerHTML = '<option value="">Select an exercise</option>';

            for (const [index, exerciseData] of Object.entries(result)) {
                const option = document.createElement('option');

                option.value = exerciseData.exerciseName;
                option.textContent = exerciseData.exerciseName;

                exerciseSelect.appendChild(option);
            }
        } else {
            alert('Error fetching workouts: ' + result.error);
        }
    }

    static async saveWorkout(workout, view) {
        const response = await fetch('http://localhost:8080/workout/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });

        const result = await response.json();

        if (response.ok) {
            HomeRequests.appendToList(result, view)
        } else {
            alert('Workout save failed: ' + result.error);
        }
    }

    static async updateWorkout(workout) {
        const response = await fetch('http://localhost:8080/workout/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });

        const result = await response.json();

        if (response.ok) {
            HomeRequests.updateList(result)
        } else {
            alert('Workout save failed: ' + result.error);
        }
    }

    static async deleteWorkout(workoutId) {
        const response = await fetch(`http://localhost:8080/workout/deleteById?id=${encodeURIComponent(workoutId)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert("Workout deleted successfully");
        } else {
            alert('Workout delete failed: ' + result.error);
        }
    }
}
