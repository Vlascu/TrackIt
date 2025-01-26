import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register.service';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../services/home.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
    standalone: true,
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [CommonModule, FormsModule]
})
export class RegisterComponent implements OnInit{
    userData = {
        firstName: '',
        lastName: '',
        password: '',
        bodyWeight: '',
        height: '',
        age: ''
    };

    constructor(private registerService: RegisterService, 
                private userService: HomeService, 
                private router: Router,
                private authState : AuthStateService) {}

    ngOnInit() {
        if(this.authState.getAlreadyLogged())
            this.userService.logout().subscribe();
    }

    onSubmit() {
        const { bodyWeight, height, age } = this.userData;

        const weight = parseFloat(bodyWeight);
        const userHeight = parseFloat(height);
        const userAge = parseInt(age, 10);

        if (isNaN(weight) || weight < 0) {
            alert('Body weight must be a non-negative number.');
            return;
        }
        if (isNaN(userHeight) || userHeight < 0) {
            alert('Height must be a non-negative number.');
            return;
        }
        if (isNaN(userAge) || userAge < 0) {
            alert('Age must be a non-negative number.');
            return;
        }

        this.registerService.registerUser(this.userData)
            .subscribe({
                next: () => {
                    alert('User registered successfully!');
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    alert('Registration failed: ' + error.error);
                    console.error('Registration failed:', error.error);
                }
            });
    }

    onLogin() {
        this.router.navigate(['/login']);
    }
}