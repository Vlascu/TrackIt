import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RegisterService {
    private readonly apiUrl = 'http://localhost:8080/user/register';

    constructor(private http: HttpClient) {}

    registerUser(userData: {
        firstName: string;
        lastName: string;
        password: string;
        bodyWeight: string;
        height: string;
        age: string;
    }): Observable<any> {
        return this.http.post(this.apiUrl, userData, {withCredentials: true});
    }
}
