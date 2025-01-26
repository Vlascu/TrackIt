import { Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workout-form',
  templateUrl: './workout-form.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WorkoutFormComponent),
    multi: true
  }],
  imports: [ReactiveFormsModule, CommonModule]
})
export class WorkoutFormComponent implements ControlValueAccessor {
  @Input() muscleGroups: string[] = ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Abs', 'Forearm'];
  @Input() exercises: string[] = [];
  @Input() workoutData: any;
  
  form: FormGroup;
  selectedSetIndex: number | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      muscleGroup: ['', Validators.required],
      exerciseName: ['', Validators.required],
      weight: ['', Validators.required],
      reps: ['', Validators.required],
      sets: [[]]
    });
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (value) this.form.patchValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.form.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workoutData'] && this.workoutData) {
      this.populateForm(this.workoutData);
    }
  }

  private populateForm(data: any) {
    this.form.patchValue({
      muscleGroup: data.muscleGroup,
      exerciseName: data.exerciseName,
      sets: data.sets || []
    });
    
    this.form.patchValue({
      weight: '',
      reps: ''
    });
    this.selectedSetIndex = null;
  }

  addSet() {
    const { weight, reps } = this.form.value;
    const sets = [...this.form.value.sets];
    
    if (this.selectedSetIndex !== null) {
      sets[this.selectedSetIndex] = { weight, reps };
      this.selectedSetIndex = null;
    } else {
      sets.push({ weight, reps });
    }

    this.form.patchValue({
      sets,
      weight: '',
      reps: ''
    });
  }

  editSet(index: number) {
    const set = this.form.value.sets[index];
    this.form.patchValue({
      weight: set.weight,
      reps: set.reps
    });
    this.selectedSetIndex = index;
  }

  removeSet(index: number) {
    const sets = this.form.value.sets.filter((_: any, i: number) => i !== index);
    this.form.patchValue({ sets });
  }
}