import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  message: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService) { }

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
    this.router.navigate(["/signup"]);
  }
}
