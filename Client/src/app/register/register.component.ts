import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register.service';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
    userData = {
        firstName: '',
        lastName: '',
        password: '',
        bodyWeight: '',
        height: '',
        age: ''
    };

    constructor(private registerService: RegisterService, private router: Router) {}

    onSubmit() {
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