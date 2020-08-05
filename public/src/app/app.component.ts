import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './services/authentication.service';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ChatApp';
  user: User;
  isChatActive: boolean = false;
  isLoginActive: boolean = false;
  isRegisterActive: boolean = false;
  isPageDimmed: boolean = false;

  constructor(private authenticationService: AuthenticationService, public router: Router) {
    this.authenticationService.getUserSubject().subscribe(x => {
      this.user = x;
      this.isPageDimmed = false;
      this.isLoginActive = false;
      this.isRegisterActive = false;
    });
  }

  logout() {
    this.authenticationService.logout();
  }
  toggleChat() {
    this.isChatActive = !this.isChatActive;
  }
  toggleLogin() {
    this.isLoginActive = !this.isLoginActive;
    this.isPageDimmed = !this.isPageDimmed;
  }
  toggleRegister() {
    this.isRegisterActive = !this.isRegisterActive;
    this.isPageDimmed = !this.isPageDimmed;
  }
  clickOutside() {
    if (this.isPageDimmed) {
      this.isPageDimmed = false;
      if (this.isRegisterActive) {
        this.isRegisterActive = false;
      }
      else if (this.isLoginActive) {
        this.isLoginActive = false;
      }
    }
  }
}
