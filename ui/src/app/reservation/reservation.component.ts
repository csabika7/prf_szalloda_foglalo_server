import { Component, OnInit } from '@angular/core';
import { NgbDate, NgbCalendar, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReservationService } from '../reservation.service';
import * as moment from 'moment';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

export interface Alert {
  type: string;
  message: string;
}

interface Room {
  _id: string,
  number_of_beds: Number,
  extra_features: Array<string>,
  remaining: Number
}

interface Hotel {
  _id: string,
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

  alerts: Array<Alert>; 

  activeDialog: Map<String, Boolean>;
  dialogCloseResult: string;
  openedDialog: NgbModalRef;

  hoveredDate: NgbDate;

  fromDate: NgbDate;
  toDate: NgbDate;

  maxDate: NgbDate;
  minDate: NgbDate;

  hotels: Array<Hotel>;

  constructor(private calendar: NgbCalendar, private reservationService: ReservationService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 10);
    const today = moment();
    this.minDate = new NgbDate(today.year(), today.month() + 1, today.date());
    const nextYear = today.add(1, 'year');
    this.maxDate = new NgbDate(nextYear.year(), nextYear.month() + 1, nextYear.date() - 1)
    this.hotels = [];
    this.activeDialog = new Map();
    this.activeDialog.set("login", true);
    this.activeDialog.set("signup", false);
    this.alerts = [];
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
      this.alerts.push(errResponse.error);
    });
  }

  reserve(hotelId: string, roomId: string, dialogContent: string) {
    if(!localStorage.getItem("user")) {
      return this.openDialog(dialogContent);
    }
    this.reservationService.reserve(hotelId, roomId, this.arrivalDate(), this.leavingDate()).subscribe((data: any) => {
      console.log(data);
    }, (errResponse) => {
      this.alerts.push(errResponse.error);
    });
  }

  arrivalDate() {
    return moment.utc({year: this.fromDate.year, month: this.fromDate.month - 1, day: this.fromDate.day})
  }

  leavingDate() {
    return moment.utc({year: this.toDate.year, month: this.toDate.month - 1, day: this.toDate.day})
  }

  openDialog(content: string) {
    this.openedDialog = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    this.openedDialog.result.then((result) => {
      this.dialogCloseResult = `Closed with: ${result}`;
    }, (reason) => {
      this.dialogCloseResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  closeDialog(reason) {
    this.openedDialog.close(reason);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
