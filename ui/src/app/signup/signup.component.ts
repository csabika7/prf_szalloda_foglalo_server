import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  @Input() activeDialog: Map<String, Boolean>;

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
      console.log('data');
      console.log(data);
      // localStorage.setItem("user", this.username);
      // this.router.navigate(["/fruit"]);
    }, (error) => {
      console.log('error');
      console.log(error);
    })
  }

  navigateToLogin() {
    this.activeDialog.set("signup", false);
    this.activeDialog.set("login", true);
  }
}
