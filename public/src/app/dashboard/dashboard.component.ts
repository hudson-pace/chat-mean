import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  subscription: Subscription = new Subscription();
  user;
  allUsers;
  updateUserForm = new FormGroup({
    password: new FormControl(''),
    description: new FormControl(''),
  });
  constructor(
    private authenticationService: AuthenticationService,
  ) {
    this.subscription.add(this.authenticationService.getUserSubject().subscribe(user => {
      this.user = user}
      ));
  }

  ngOnInit(): void {
    if (this.user.role === 'Admin') {
      this.authenticationService.getAllUsers().subscribe(users => this.allUsers = users);
    }
  }

  onSubmit(): void {
    let formValue = { ...this.updateUserForm.value };
    for (let property in this.updateUserForm.value) {
      if (formValue[property].length === 0) {
        delete formValue[property];
      }
    }
    if (Object.keys(formValue).length !== 0) {
      this.authenticationService.updateUser(this.user.username, formValue).subscribe(result => {
        console.log(result);
      });
    }
  }

  deleteUser(user): void {
    this.authenticationService.deleteUser(user.username).subscribe(result => {
      console.log(result);
    })
  }
}
