import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../services/home.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
    standalone: true,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
    loginData = {
        firstName: '',
        lastName: '',
        password: ''
    };

    constructor(private loginService: LoginService, 
                private userService: HomeService, 
                private router: Router,
                private authState: AuthStateService) {}

    ngOnInit() {
        if(this.authState.getAlreadyLogged())
            this.userService.logout().subscribe();
    }

    onSubmit() {
        this.authState.setAlreadyLogged(true);

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