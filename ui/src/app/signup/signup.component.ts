import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';
import { Alert } from '../reservation/reservation.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  @Input() activeDialog: Map<String, Boolean>;
  @Input() alerts: Array<Alert>

  username: FormControl;
  password: FormControl;
  email: FormControl;

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.username = new FormControl('', [
      Validators.required
    ]);
    this.password = new FormControl('',[
      Validators.required,
      //Validators.minLength(8)
    ]);
    this.email = new FormControl('',[
      Validators.required,
      Validators.email
    ]);
  }

  signup() {
    this.loginService.signup(this.username.value, this.email.value, this.password.value).subscribe((data: any) => {
      this.alerts.push(data);
      this.navigateToLogin();
    }, (errResponse) => {
      this.alerts.push(errResponse.error);
    })
  }

  navigateToLogin() {
    this.activeDialog.set("signup", false);
    this.activeDialog.set("login", true);
  }
}
