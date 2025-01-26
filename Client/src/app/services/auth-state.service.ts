import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private alreadyLogged = localStorage.getItem('alreadyLogged') === 'true';

  setAlreadyLogged(state: boolean): void {
  this.alreadyLogged = state;
  localStorage.setItem('alreadyLogged', state.toString());
}

  getAlreadyLogged(): boolean {
    return this.alreadyLogged;
  }
}
