import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from '../services/home.service'
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { WorkoutFormComponent } from '../workout-form/workout-form.component';
import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [NavbarComponent, WorkoutFormComponent, ReactiveFormsModule, CommonModule],
})
export class HomeComponent implements OnInit {
  @ViewChild('dateInput') dateInput!: HTMLInputElement;
  @ViewChild('datePickerInput') datePickerInput!: ElementRef<HTMLInputElement>;

  currentDate = new Date();
  formattedDate = this.formatDateString(this.currentDate);
  workouts: any[] = [];
  showForm = false;
  selectedWorkout: any = null;
  selectedSetIndex: number | null = null;
  muscleGroups: string[] = ['Chest', 'Back', 'Legs'];
  exercises: string[] = [];
  workoutForm: FormGroup;
  showDatePicker = false;

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
  }

  private checkSession() {
    this.homeService.getUserIdFromSession().subscribe(userId => {
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
    if (!this.selectedWorkout) this.selectedWorkout = { sets: [] };
    
    if (this.selectedSetIndex !== null) {
      this.selectedWorkout.sets[this.selectedSetIndex] = { weight, reps };
      this.selectedSetIndex = null;
    } else {
      this.selectedWorkout.sets.push({ weight, reps });
    }
    
    this.workoutForm.patchValue({ weight: '', reps: '' });
  }

  saveWorkout() {
    if (this.workoutForm.invalid) return;

    const formData = {
      ...this.workoutForm.value.workoutData,
      date: this.formattedDate
    };

    const operation = formData.id 
      ? this.homeService.updateWorkout(formData)
      : this.homeService.saveWorkout(formData);

    operation.subscribe(() => {
      this.loadWorkouts();
      this.closeForm();
    });
  }

  editWorkout(workout: any) {
    this.selectedWorkout = { ...workout, sets: workout.sets.split('|').map((s: string) => {
      const [reps, weight] = s.split(',');
      return { reps, weight };
    })};
    
    this.workoutForm.patchValue({
      muscleGroup: workout.muscleGroup,
      exerciseName: workout.exerciseName
    });
    
    this.showForm = true;
  }

  deleteWorkout(workoutId: string) {
    this.homeService.deleteWorkout(workoutId).subscribe(() => {
      this.workouts = this.workouts.filter(w => w.id !== workoutId);
      this.closeForm();
    });
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
    this.workoutForm.reset();
  }
}