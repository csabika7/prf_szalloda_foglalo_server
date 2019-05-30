import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginService } from '../login.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators } from '@angular/forms';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Output() switchTo = new EventEmitter<string>();
  @Output() close = new EventEmitter<string>();
  username: FormControl;
  password: FormControl;

  constructor(private loginService: LoginService, private alertService: AlertService) { }

  ngOnInit() {
    this.username = new FormControl('', [
      Validators.required
    ]);
    this.password = new FormControl('', [
      Validators.required
    ]);
  }

  login() {
    this.loginService.login(this.username.value, this.password.value).subscribe((data: any) => {
      this.alertService.alert(data);
      localStorage.setItem("user", this.username.value);
      this.close.next("logged in");
    }, (errResponse) => {
      this.alertService.alert(errResponse.error);
    });
  }

  navigateToSignup() {
    this.switchTo.next("signup");
  }
}
