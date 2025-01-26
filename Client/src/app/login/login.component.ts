import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, CommonModule],
})
export class LoginComponent {
    loginData = {
        firstName: '',
        lastName: '',
        password: ''
    };

    constructor(private loginService: LoginService, private router: Router) {}

    onSubmit() {
        this.loginService.loginUser(this.loginData)
            .subscribe({
                next: (response) => {
                    alert('Login successful!');
                    
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    alert('Login failed: ' + error.error);
                    console.error('Login error:', error);
                }
            });
    }

    onRegister() {
        this.router.navigate(['/register']);
    }
}