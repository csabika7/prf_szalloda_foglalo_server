import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(private httpClient: HttpClient) { }

  findHotels(from: moment.Moment, to: moment.Moment) {
    let DATE_FORMAT = "YYYY-MM-DD";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const fromDateParam = from.format(DATE_FORMAT);
    const toDateParam = to.format(DATE_FORMAT);
    return this.httpClient.get(`http://localhost:3000/hotel/find?arrival=${fromDateParam}&leaving=${toDateParam}`, httpOptions);
  }
}
