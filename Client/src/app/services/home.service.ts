import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getUserIdFromSession(): Observable<number> {
    return this.http.get<{ userId: number }>(`${this.baseUrl}/user/sessionId`, {withCredentials: true}).pipe(
      map(response => response.userId),
      catchError(() => of(-1))
    );
  }

  getWorkoutsByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/workout/alldate?date=${encodeURIComponent(date)}`, {withCredentials: true});
  }

  getAllExercisesByMuscleGroup(muscleGroup: string): Observable<string[]> {
    return this.http.get<any[]>(`${this.baseUrl}/workout/exercises?muscleGroup=${encodeURIComponent(muscleGroup)}`, {withCredentials: true}).pipe(
      map(exercises => exercises.map(e => e.exerciseName))
    );
  }

  saveWorkout(workoutData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/workout/save`, workoutData, {withCredentials: true});
  }

  updateWorkout(workoutData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/workout/update`, workoutData, {withCredentials: true});
  }

  deleteWorkout(workoutId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/workout/deleteById?id=${encodeURIComponent(workoutId)}`, {withCredentials: true});
  }

  logout(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/logout`, { withCredentials: true });
  }
}