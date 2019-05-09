import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';
import { Alert } from '../reservation/reservation.component';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() activeDialog: Map<String, Boolean>;
  @Input() alerts: Array<Alert>;
  @Input() dialog: NgbModalRef;

  username: FormControl;
  password: FormControl;

  constructor(private loginService: LoginService) { }

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
      this.alerts.push(data);
      localStorage.setItem("user", this.username.value);
      this.dialog.dismiss();
      console.log(data);
    }, (errResponse) => {
      this.alerts.push(errResponse.error);
    });
  }

  navigateToSignup() {
    this.activeDialog.set("signup", true);
    this.activeDialog.set("login", false);
  }
}
