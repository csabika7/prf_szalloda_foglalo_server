import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';
import { Alert } from '../reservation/reservation.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  @Input() activeDialog: Map<String, Boolean>;
  @Input() alerts: Array<Alert>

  username: string;
  password: string;
  email: string;

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.username = '';
    this.password = '';
    this.email = '';
  }

  signup() {
    this.loginService.signup(this.username, this.email, this.password).subscribe((data: any) => {
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
