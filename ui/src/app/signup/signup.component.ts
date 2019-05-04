import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  username: string;
  password: string;
  email: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService) { }

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
    this.router.navigate(["/login"]);
  }
}
