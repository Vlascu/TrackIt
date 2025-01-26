import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    private readonly apiUrl = 'http://localhost:8080/user/login';

    constructor(private http: HttpClient) {}

    loginUser(loginData: {
        firstName: string;
        lastName: string;
        password: string;
    }): Observable<any> {
        return this.http.post(this.apiUrl, loginData, {withCredentials: true});
    }
}