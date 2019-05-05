import { Component, OnInit } from '@angular/core';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ReservationService } from '../reservation.service';
import * as moment from 'moment';

interface Room {
  _id: Number,
  number_of_beds: Number,
  extra_features: Array<string>,
  remaining: Number
}

interface Hotel {
  _id: Number,
  stars: Number,
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

  constructor(private calendar: NgbCalendar, private reservationService: ReservationService) { }

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
    const from = moment.utc({year: this.fromDate.year, month: this.fromDate.month - 1, day: this.fromDate.day})
    const to = moment.utc({year: this.toDate.year, month: this.toDate.month - 1, day: this.toDate.day})
    this.reservationService.findHotels(from, to).subscribe((data: any) => {
      this.hotels = data;
    }, (error) => {
      console.log('error');
      console.log(error);
    })
  }

  reserve() {
    console.log("reserving");
  }
}
