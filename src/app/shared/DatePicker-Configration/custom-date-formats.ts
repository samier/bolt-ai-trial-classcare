import { MatDateFormats } from '@angular/material/core';

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD-MM-YYYY', // Input format for parsing
  },
  display: {
    dateInput: 'DD-MM-YYYY', // Format displayed in the input field
    monthYearLabel: 'MMM YYYY', // Label for the month/year picker
    dateA11yLabel: 'LL', // Accessibility label for date
    monthYearA11yLabel: 'MMMM YYYY', // Accessibility label for month/year picker
  },
};