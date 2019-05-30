import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auth-dialog',
  template: `
  <div>
    <div class="modal-header">
        <h4 class="modal-title" id="modal-basic-title" *ngIf="isLoginViewActive()">Login</h4>
        <h4 class="modal-title" id="modal-basic-title" *ngIf="isSignupViewActive()">Sign up</h4>
        <button type="button" class="close" aria-label="Close" (click)="closeDialog()">
          <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="modal-body">
      <app-login (close)="closeDialog()" (switchTo)="onSwitchView($event)" *ngIf="isLoginViewActive()"></app-login>
      <app-signup (switchTo)="onSwitchView($event)" *ngIf="isSignupViewActive()"></app-signup>
    </div>
  </div>
  `
})
export class AuthDialogComponent {
  loginActive: boolean;
  signupActive: boolean;

  constructor(private active: NgbActiveModal) {
    this.loginActive = true;
    this.signupActive = false;
  }

  isLoginViewActive() {
    return this.loginActive;
  }

  isSignupViewActive() {
    return this.signupActive;
  }

  onSwitchView(view: string) {
    if(view === "login") {
      this.loginActive = true;
      this.signupActive = false;
    } else if(view === "signup") {
      this.signupActive = true;
      this.loginActive = false;
    }
  }

  closeDialog() {
    this.active.dismiss();
  }
}
