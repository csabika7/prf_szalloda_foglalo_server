import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() activeDialog: Map<String, Boolean>;

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
      console.log('data');
      console.log(data);
      // localStorage.setItem("user", this.username);
      // this.router.navigate(["/fruit"]);
    }, (error) => {
      console.log('error');
      console.log(error);
    })
  }

  navigateToSignup() {
    this.activeDialog.set("signup", true);
    this.activeDialog.set("login", false);
  }
}
