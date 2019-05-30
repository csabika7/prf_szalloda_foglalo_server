import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../reservation.service';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  reservations: any;

  constructor(private reservationService: ReservationService, private alertService: AlertService) {
    this.reservations = [];
  }

  ngOnInit() {
    this.reservationService.reservationLog().subscribe((data: any) => {
      this.reservations = data;
    }, (errResponse) => {
      this.alertService.alert(errResponse.error);
    });;
  }
}
