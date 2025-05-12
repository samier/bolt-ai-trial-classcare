import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {

  // DD-MM-YYYY | DD/MM/YYYY | MM-DD-YYYY | MM/DD/YYYY | YYYY-MM-DD | YYYY/MM/DD
  private formatSubject = new BehaviorSubject<string>('DD-MM-YYYY');
  formate : string = 'DD-MM-YYYY'

  constructor() { }

  getFormatAsObservable() {
    return this.formatSubject.asObservable();
  }

  getFormat() : string {
    return this.formate
  }

  setFormat(newFormat: string): void {
    this.formate = newFormat
    this.formatSubject.next(newFormat)
  }

  getDateFormat(): string {
    switch (this.formatSubject.getValue()) {
      case 'DD-MM-YYYY':
        return 'dd-MM-yyyy';
      case 'DD/MM/YYYY':
        return 'dd/MM/yyyy';
      case 'MM-DD-YYYY':
        return 'MM-dd-yyyy';
      case 'MM/DD/YYYY':
        return 'MM/dd/yyyy';
      case 'YYYY-MM-DD':
        return 'yyyy-MM-dd';
      case 'YYYY/MM/DD':
        return 'yyyy/MM/dd';
      default:
        return 'dd-MM-yyyy';
    }
  }

  getDateTimeFormat(): string {
    switch (this.formatSubject.getValue()) {
      case 'DD-MM-YYYY':
        return 'dd-MM-yyyy, h:mm a';
      case 'DD/MM/YYYY':
        return 'dd/MM/yyyy, h:mm a';
      case 'MM-DD-YYYY':
        return 'MM-dd-yyyy, h:mm a';
      case 'MM/DD/YYYY':
        return 'MM/dd/yyyy, h:mm a';
      case 'YYYY-MM-DD':
        return 'yyyy-MM-dd, h:mm a';
      case 'YYYY/MM/DD':
        return 'yyyy/MM/dd, h:mm a';
      default:
        return 'dd-MM-yyyy, h:mm a';
    }
  }

}
