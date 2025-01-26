// profile.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WeightUpdate } from '../interfaces/weight-update';
import { switchMap } from 'rxjs';
import { HomeService } from '../services/home.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  standalone: true,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, NavbarComponent, FormsModule, NgApexchartsModule]
})


export class ProfileComponent implements OnInit {
  chartOptions: any;

  isDropdownVisible = false;
  showWeightUpdate = false;

  newWeight = '';
  user: any = {
    firstName: 'Loading...',
    lastName: 'Loading...',
    height: 'Loading...',
    bodyWeight: 'Loading...',
    age: 'Loading...',
    bmi: 'Loading...',
    bmiCategory: 'Loading...'
  };


  constructor(private profileService: ProfileService,
    private router: Router,
    private homeService: HomeService) {
  }

  ngOnInit() {
    this.loadUserData();
    this.loadWeightHistory();
    this.checkSession();
  }

  private checkSession() {
    this.homeService.getUserIdFromSession().subscribe(userId => {
      console.log(userId);
      if (userId === -1) this.router.navigate(['/login']);
    });
  }

  loadUserData() {
    this.profileService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.user.bmi = user.bmi.toFixed(2);
        this.user.bmiCategory = this.getBmiCategory(user.bmi);
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
      }
    });
  }

  loadWeightHistory() {
    this.profileService.getWeightUpdates().subscribe({
      next: (updates: WeightUpdate[]) => {
        this.initChart(updates);
      },
      error: (error) => {
        console.error('Failed to load weight history:', error);
      }
    });
  }

  private initChart(updates: WeightUpdate[]) {
    this.chartOptions = {
      series: [{
        name: 'Weight',
        data: updates.map(u => u.newWeightValue)
      }],
      chart: {
        type: 'line',
        height: 200
      },
      xaxis: {
        categories: updates.map(u => `${u.day}/${u.month}/${u.year}`),
        title: { text: 'Date' }
      },
      yaxis: {
        title: { text: 'Weight (kg)' }
      },
      colors: ['#4CAF50'],
      stroke: { width: 3 }
    };
  }

  getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Healthy weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  toggleWeightUpdate() {
    this.showWeightUpdate = !this.showWeightUpdate;
  }

  saveWeight() {
    if (!this.newWeight) return;

    this.profileService.updateWeight(this.newWeight).pipe(
      switchMap(() => {
        this.user.bodyWeight = this.newWeight;
        this.newWeight = '';
        this.showWeightUpdate = false;
        return this.profileService.getWeightUpdates();
      })
    ).subscribe({
      next: (updates: WeightUpdate[]) => {
        this.initChart(updates);
      },
      error: (error) => {
        console.error('Weight update failed:', error);
      }
    });
  }

  logout() {
    this.homeService.logout().subscribe({
      next: () => { this.router.navigate(['/login']) },
      error: (error) => { console.log(error) }
    });
  }
}