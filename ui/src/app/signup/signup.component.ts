import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginService } from '../login.service';
import { FormControl, Validators } from '@angular/forms';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {


  @Output() switchTo = new EventEmitter<string>();
  username: FormControl;
  password: FormControl;
  email: FormControl;

  constructor(private loginService: LoginService, private alertService: AlertService) { }

  ngOnInit() {
    this.username = new FormControl('', [
      Validators.required
    ]);
    this.password = new FormControl('',[
      Validators.required,
      Validators.minLength(8)
    ]);
    this.email = new FormControl('',[
      Validators.required,
      Validators.email
    ]);
  }

  signup() {
    this.loginService.signup(this.username.value, this.email.value, this.password.value).subscribe((data: any) => {
      this.alertService.alert(data);
      this.navigateToLogin();
    }, (errResponse) => {
      this.alertService.alert(errResponse.error);
    })
  }

  navigateToLogin() {
    this.switchTo.next("login");
  }
}
