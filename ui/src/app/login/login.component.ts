import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';
import { Alert } from '../reservation/reservation.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() activeDialog: Map<String, Boolean>;
  @Input() alerts: Array<Alert>;
  @Input() dialog: NgbModalRef;

  username: string;
  password: string;
  message: string;

  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.username = '';
    this.password = '';
    this.message = '';
  }

  login() {
    this.loginService.login(this.username, this.password).subscribe((data: any) => {
      this.alerts.push(data);
      localStorage.setItem("user", this.username);
      this.dialog.dismiss("logged in");
    }, (errResponse) => {
      this.alerts.push(errResponse.error);
    });
  }

  navigateToSignup() {
    this.activeDialog.set("signup", true);
    this.activeDialog.set("login", false);
  }
}
