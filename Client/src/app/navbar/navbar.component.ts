import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule]
})
export class NavbarComponent {
  isDropdownVisible = false;
  @Output() onLogoutClick = new EventEmitter<void>();
  @Output() onChangeDateClick = new EventEmitter<void>();

  constructor(private router : Router){}

  isProfilePage(): boolean {
    return this.router.url === '/profile';
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  dateClick(): void {
    this.onChangeDateClick.emit();
  }
  logoutClick(): void {
    this.onLogoutClick.emit();
  }
}