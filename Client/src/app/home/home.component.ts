import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from '../services/home.service'
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule],
})
export class HomeComponent implements OnInit {
  @ViewChild('dateInput') dateInput!: HTMLInputElement;
  @ViewChild('datePickerInput') datePickerInput!: ElementRef<HTMLInputElement>;

  currentDate = new Date();
  formattedDate = this.formatDateString(this.currentDate);

  showDatePicker = false;
  showForm = false;

  workouts: any[] = [];
  selectedWorkout: any = null;

  selectedSetIndex: number | null = null;
  exercises: string[] = [];
  sets: any[] = [];
  muscleGroups = ['Chest', 'Back', 'Legs', 'Biceps', 'Triceps', 'Abs', 'Shoulders', 'Forearm'];
  
  workoutForm: FormGroup;

  constructor(
    private homeService: HomeService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.workoutForm = this.fb.group({
      muscleGroup: ['', Validators.required],
      exerciseName: ['', Validators.required],
      weight: ['', Validators.required],
      reps: ['', Validators.required]
    });
  }
  

  ngOnInit() {
    this.checkSession();
    this.loadWorkouts();
    
    this.workoutForm.get('muscleGroup')?.valueChanges.subscribe(muscle => {
      if (muscle) this.loadExercises(muscle);
    });
  }

  openWorkoutForm() {
    this.showForm = true;
    this.selectedWorkout = null;
    this.sets = [];
    this.workoutForm.reset();
  }

  private checkSession() {
    this.homeService.getUserIdFromSession().subscribe(userId => {
      console.log(userId);
      if (userId === -1) this.router.navigate(['/login']);
    });
  }

  private loadWorkouts() {
    this.homeService.getWorkoutsByDate(this.formattedDate)
    .subscribe({
      next: (data) => {
    
        this.workouts = Array.isArray(data) ? data : Object.values(data);
      },
      error: (err) => {
        console.error('Error loading workouts:', err);
        this.workouts = [];
      }
    });
  }

  private loadExercises(muscleGroup: string) {
    this.homeService.getAllExercisesByMuscleGroup(muscleGroup)
      .subscribe(exercises => this.exercises = exercises);
  }

  handleDateSelection(event: any) {
    const selectedDate = new Date(event.target.value);
    this.currentDate = selectedDate;
    this.formattedDate = this.formatDateString(selectedDate);
    this.loadWorkouts();
    this.showDatePicker = false;
  }

  openDatePicker() {
    this.showDatePicker = true;
    
    setTimeout(() => {
      this.datePickerInput.nativeElement.showPicker(); 
      this.datePickerInput.nativeElement.focus();
      this.datePickerInput.nativeElement.click();
    }, 0);
  }

  datePickerClosed() {
    this.showDatePicker = false;
  }

  getFormattedDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatDateString(date: Date): string {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  changeDate(days: number) {
    this.currentDate.setDate(this.currentDate.getDate() + days);
    this.formattedDate = this.formatDateString(this.currentDate);
    this.loadWorkouts();
  }

  addSet() {
    const { weight, reps } = this.workoutForm.value;
    
    if (this.selectedSetIndex !== null) {
      this.sets[this.selectedSetIndex] = { weight, reps };
      this.selectedSetIndex = null;
    } else {
      this.sets.push({ weight, reps });
    }
    
    this.workoutForm.patchValue({ weight: '', reps: '' });
  }

  editSet(index: number) {
    const set = this.sets[index];
    this.workoutForm.patchValue({
      weight: set.weight,
      reps: set.reps
    });
    this.selectedSetIndex = index;
  }

  removeSet(event: Event, index: number) {
    event.stopPropagation();
    this.sets.splice(index, 1);
    this.selectedSetIndex = null;
  }

  saveWorkout() {
    if (this.sets.length === 0 || this.workoutForm.value.muscleGroup === null || this.workoutForm.value.exerciseName === null) {
        alert('Please fill all required fields and add at least one set');
        return;
    }

    const formData = {
        muscleGroup: this.workoutForm.value.muscleGroup,
        exerciseName: this.workoutForm.value.exerciseName,
        sets: this.sets.map(set => `${set.reps},${set.weight}`).join('|'),
        date: this.formattedDate,
        ...(this.selectedWorkout && { id: this.selectedWorkout.id })
    };

    const operation = this.selectedWorkout 
        ? this.homeService.updateWorkout(formData)
        : this.homeService.saveWorkout(formData);

    operation.subscribe({
        next: () => {
            this.loadWorkouts();
            this.closeForm();
        },
        error: (err) => {
            console.error('Operation failed:', err);
            alert('Failed to save workout. Please try again.');
        }
    });
  }

  editWorkout(workout: any) {
      this.selectedWorkout = workout;
      this.sets = workout.sets.split('|').map((set: string) => {
          const [reps, weight] = set.split(',');
          return { reps, weight };
      });
      
      this.workoutForm.patchValue({
          muscleGroup: workout.muscleGroup,
          exerciseName: workout.exerciseName
      });
      
      this.showForm = true;
  }

  deleteWorkout(workoutId: string) {
      if (confirm('Are you sure you want to delete this workout?')) {
          this.homeService.deleteWorkout(workoutId).subscribe({
              next: () => {
                  this.workouts = this.workouts.filter(w => w.id !== workoutId);
                  
                  if (this.selectedWorkout?.id === workoutId) {
                      this.closeForm();
                  }
              },
              error: (err) => {
                  console.error('Delete failed:', err);
                  alert('Failed to delete workout. Please try again.');
              }
          });
      }
  }

  logout() {
    this.homeService.logout().subscribe({
      next: () => {this.router.navigate(['/login'])},
      error: (error) => {console.log(error)}
    });
  }

  closeForm() {
    this.showForm = false;
    this.selectedWorkout = null;
    this.selectedSetIndex = null;
    this.sets = [];
    this.workoutForm.reset();
  }
}