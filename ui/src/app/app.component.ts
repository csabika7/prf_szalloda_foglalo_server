import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Alert, AlertService} from './alert.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';

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
    private alertService: AlertService, private modal: NgbModal) {}

  ngOnInit() {
    this.alerts = [];
    this.alertSub = this.alertService.subscribe(alert => this.alerts.push(alert));
  }

  ngOnDestroy() {
    this.alertSub.unsubscribe();
  }

  loggedIn() {
    return !!localStorage.getItem('user');
  }

  openAuthDialog() {
    this.modal.open(AuthDialogComponent);
  }

  closeAlert(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
