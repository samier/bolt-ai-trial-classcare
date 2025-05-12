import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormValidationService } from '../form-validation.service';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import dayjs from 'dayjs';
import { DateFormatService } from 'src/app/service/date-format.service';


@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]

})
export class DateRangePickerComponent implements OnInit {
  //#region Public | Private Variables
  @Input() controlName!: string;
  @Input() placeholder: string = '';
  @Output() input = new EventEmitter()
  @Input() defaultStartDate: string | undefined;
  @Input() defaultEndDate: string | undefined ;
  @Output() change = new EventEmitter()

  // formGroup!:FormGroup
  FormControl!:any

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  };

  dateConfig: any = {
    applyLabel: 'Apply',
    format: 'YYYY-MM-DD',
    displayFormat: this._dateFormateService.getFormat(),
    cancelLabel: 'Cancel',
    clearLabel: 'Clear',
    parentEl:"body"
  }


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public formValidationService: FormValidationService,private rootFrom : FormGroupDirective,private _dateFormateService: DateFormatService) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    // this.formGroup = this.rootFrom.control;
    this.FormControl = this.rootFrom.control.controls[this.controlName]

    if (this.defaultStartDate || this.defaultEndDate) {
      const startDate = this.defaultStartDate ? dayjs(this.defaultStartDate) : null;
      const endDate = this.defaultEndDate ? dayjs(this.defaultEndDate) : null;

      this.FormControl.patchValue({
        startDate: startDate ? startDate : undefined,
        endDate: endDate ? endDate : undefined
      });
    }
  }


  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  datesUpdated(event) {
    let startDate
    let endDate

    if(event.endDate?.$d == 'Invalid Date') {
      const selectedRange = {
          startDate: event.startDate,
          endDate: event.startDate
        };
        this.rootFrom.control.controls[this.controlName].patchValue(selectedRange)

        endDate = event.startDate ? event.startDate.format('YYYY-MM-DD') : null
    } else {
      endDate = event.endDate ?event.endDate.format('YYYY-MM-DD') : null
    }
    if ((event.startDate && event.endDate) || ((this.FormControl?.value ? this.FormControl?.value?.startDate == null : false) && (this.FormControl?.value ? this.FormControl?.value?.endDate == null : false))) {
      this.change.emit(event)
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
