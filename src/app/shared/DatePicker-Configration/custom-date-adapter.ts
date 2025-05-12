import { Injectable, Optional, Inject } from '@angular/core';
import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { Subscription } from 'rxjs';
import { DateFormatService } from 'src/app/service/date-format.service';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  private dateFormat: string = 'DD-MM-YYYY'; // Default format
  private formatSubscription: Subscription;

  constructor(  @Inject(MAT_DATE_LOCALE) private matDateLocale: string,
  private dateFormatService: DateFormatService
   // Inject DateFormatService
  ) {
    super(matDateLocale);
     // Subscribe to the format changes
     this.formatSubscription = this.dateFormatService.getFormatAsObservable().subscribe((newFormat: string) => {
      this.dateFormat = newFormat;
    });
  }

  //  Unsubscribe when the adapter is destroyed
   ngOnDestroy() {
    if (this.formatSubscription) {
      this.formatSubscription.unsubscribe();
    }
  }

  // Dynamically set the date format
  setDateFormat(format: string): void {
    this.dateFormat = format;
  }

  private clampDateToValidRange(date: Date): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
  
    // Get the last day of the selected month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  
    // Clamp the day to the valid range of the new month
    return new Date(year, month, Math.min(day, lastDayOfMonth));
  }
  
  override parse(value: string): Date | null {
    if (!value) {
      return null;
    }
  
    const parts = value.split(/[-\/]/);
    let day, month, year;
  
    switch (this.dateFormat) {
      case 'DD-MM-YYYY':
      case 'DD/MM/YYYY':
        [day, month, year] = parts;
        break;
      case 'MM-DD-YYYY':
      case 'MM/DD/YYYY':
        [month, day, year] = parts;
        break;
      case 'YYYY-MM-DD':
      case 'YYYY/MM/DD':
        [year, month, day] = parts;
        break;
      default:
        return null;
    }
  
    const parsedDate = new Date(+year, +month - 1, +day);
    return this.clampDateToValidRange(parsedDate); // Clamp to valid range
  }
  
  override format(date: Date, displayFormat: Object): string {
    if (!date) {
      return '';
    }
  
    // Clamp the date to ensure valid ranges
    const clampedDate = this.clampDateToValidRange(date);
  
    const day = clampedDate.getDate().toString().padStart(2, '0');
    const month = (clampedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = clampedDate.getFullYear();
  
    switch (this.dateFormat) {
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      default:
        return `${day}-${month}-${year}`;
    }
  }
}
