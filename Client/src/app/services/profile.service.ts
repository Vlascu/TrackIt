import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WeightUpdate } from '../interfaces/weight-update';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:8080/user';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/current-user`, {withCredentials: true});
  }

  getWeightUpdates(): Observable<WeightUpdate[]> {
    return this.http.get<{[key: string]: WeightUpdate}>(`${this.baseUrl}/get_updates`, {withCredentials: true}).pipe(
      map(response => Object.values(response)) 
    );
  }

  updateWeight(newWeight: string): Observable<any> {
    const currentDate = new Date();
    const payload = {
      weight: newWeight,
      date: `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`
    };
    return this.http.post(`${this.baseUrl}/new_weight`, payload, {withCredentials: true});
  }
}
