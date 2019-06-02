import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Alert, AlertService} from './alert.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { LoginService } from './login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'PRF Hotel reservation';

  alertSub: Subscription;
  alerts: Array<Alert>;

  constructor(private route: ActivatedRoute, private router: Router, 
    private alertService: AlertService, private modal: NgbModal, private loginService: LoginService) {}

  ngOnInit() {
    this.alerts = [];
    this.alertSub = this.alertService.subscribe(alert => {
      this.alerts.push(alert)
      setTimeout(() => {
        this.closeAlert(alert);
      }, 5000);
    });
  }

  ngOnDestroy() {
    this.alertSub.unsubscribe();
  }

  loggedIn() {
    return !!localStorage.getItem('user');
  }

  logout() {
    localStorage.removeItem('user');
    this.loginService.logout();
  }

  openAuthDialog() {
    this.modal.open(AuthDialogComponent);
  }

  closeAlert(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
