import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  DATE_FORMAT: string;

  constructor(private httpClient: HttpClient) { 
    this.DATE_FORMAT = "YYYY-MM-DD"
  }

  findHotels(from: moment.Moment, to: moment.Moment) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const fromDateParam = from.format(this.DATE_FORMAT);
    const toDateParam = to.format(this.DATE_FORMAT);
    return this.httpClient.get(`http://localhost:3000/hotel/find?arrival=${fromDateParam}&leaving=${toDateParam}`, httpOptions);
  }

  reserve(hotelId: string, roomId: string, from: moment.Moment, to: moment.Moment) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const fromDateParam = from.format(this.DATE_FORMAT);
    const toDateParam = to.format(this.DATE_FORMAT);
    return this.httpClient.post(`http://localhost:3000/hotel/${hotelId}/room/${roomId}/${fromDateParam}/${toDateParam}/reserve`, httpOptions);
  }
}
