import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.httpClient.post("http://localhost/v1/user/login",
    {username: username, password: password}, httpOptions);
  }

  logout() {
    return this.httpClient.post("http://localhost/v1/user/logout", null);
  }

  signup(username: string, email: string, password: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.httpClient.post("http://localhost/v1/user/register",
    {username: username, email: email, password: password}, httpOptions);
  }
}