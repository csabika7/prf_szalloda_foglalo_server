import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, Observer, Subscription } from 'rxjs';

export interface Alert {
  type: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService { 
  private subject:Subject<Alert> = new Subject<Alert>();

  constructor() { }

  alert(alert) {
    this.subject.next(alert);
  }

  subscribe(fun): Subscription {
    return this.subject.subscribe(fun);
  }
}
