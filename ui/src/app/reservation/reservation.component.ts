import { Component, OnInit, Input } from '@angular/core';
import { NgbDate, NgbCalendar, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReservationService } from '../reservation.service';
import * as moment from 'moment';
import { Alert, AlertService } from '../alert.service';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';

interface Room {
  _id: string,
  number_of_beds: Number,
  extra_features: Array<string>,
  remaining: Number
}

interface Hotel {
  _id: string,
  stars: Number,
  userRatings: Number,
  name: string,
  extra_features: Array<string>,
  rooms: Array<Room>
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  hoveredDate: NgbDate;

  fromDate: NgbDate;
  toDate: NgbDate;

  maxDate: NgbDate;
  minDate: NgbDate;

  hotels: Array<Hotel>;

  constructor(private calendar: NgbCalendar, private reservationService: ReservationService,
    private alertService: AlertService, private modal: NgbModal) { }

  ngOnInit() {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
    const today = moment();
    this.minDate = new NgbDate(today.year(), today.month() + 1, today.date());
    const nextYear = today.add(1, 'year');
    this.maxDate = new NgbDate(nextYear.year(), nextYear.month() + 1, nextYear.date() - 1)
    this.hotels = [];
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  findHotels() {
    this.reservationService.findHotels(this.arrivalDate(), this.leavingDate()).subscribe((data: any) => {
      this.hotels = data;
    }, (errResponse) => {
      this.alertService.alert(errResponse.error);
    });
  }

  reserve(hotelId: string, roomId: string) {
    if(!localStorage.getItem("user")) {
      this.alertService.alert({ message: 'You have to be logged in reserve a room!', type: 'danger' });
      this.modal.open(AuthDialogComponent);
      return;
    }
    this.reservationService.reserve(hotelId, roomId, this.arrivalDate(), this.leavingDate()).subscribe((message: Alert) => {
      this.alertService.alert(message);
    }, (errResponse) => {
      this.alertService.alert(errResponse.error);
    });
  }

  arrivalDate() {
    return moment.utc({year: this.fromDate.year, month: this.fromDate.month - 1, day: this.fromDate.day})
  }

  leavingDate() {
    return moment.utc({year: this.toDate.year, month: this.toDate.month - 1, day: this.toDate.day})
  }

  rate(hotel: Hotel) {
    if(!localStorage.getItem("user")) {
      this.alertService.alert({ message: 'You have to be logged in reserve a room!', type: 'danger' });
      this.modal.open(AuthDialogComponent);
      return;
    }
    this.reservationService.rate(hotel._id, hotel.userRatings).subscribe((message: Alert) => {
      this.alertService.alert(message);
    }, (errResponse) => {
      this.alertService.alert(errResponse.error);
    });
  }
}
