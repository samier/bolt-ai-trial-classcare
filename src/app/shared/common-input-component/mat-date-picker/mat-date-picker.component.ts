import { Component, ComponentRef, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild, ViewContainerRef } from '@angular/core';
import { FormValidationService } from '../form-validation.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-mat-date-picker',
  templateUrl: './mat-date-picker.component.html',
  styleUrls: ['./mat-date-picker.component.scss']
})
export class MatDatePickerComponent implements OnInit {
  //#region Public | Private Variables
  @Input() controlName!: string;
  @Input() placeholder: string = this._dateFormateService.getFormat();
  @Input() maxDate: string | undefined;
  @Input() readonly: boolean =false;
  @Input() disabled: boolean =false;
  @Input() templateDriven: boolean =false;
  @Output() change = new EventEmitter()
  @Input() formArrayName: string = '' ;
  @Input() GroupName: any = null ;
  @Output() clearDate = new EventEmitter<any>()

  @Input() selectedDate!: string | null;
  @Output() selectedDateChange = new EventEmitter<string>();
  @Input() isRequired: boolean = false; // To make the date field required dynamically
  @Input() minDate?: string; // Minimum allowed date
  @Input() isSundayDisable  : boolean = false;
  formGroup!:FormGroup
  FormControl!:any
  formArray!:any
  isComponentVisible:boolean = true
  myFilter

  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  componentRef!: ComponentRef<MatDatePickerComponent>;


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public formValidationService: FormValidationService,
    private _dateFormateService : DateFormatService,
    @Optional() private rootFrom: FormGroupDirective
) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    // this.formGroup = this.rootFrom.control;

    this.myFilter = (date: Date): boolean => {
      if (!date) {
        return false; // or handle null/undefined case
      }
      const day = date.getDay();
      if (this.isSundayDisable) {
        // Prevent Sunday from being selected.
        return day !== 0;
      } else {
        return true;
      }
    }

    this._dateFormateService.getFormatAsObservable().subscribe((newFormat: string) => {
      this.isComponentVisible = false;
      setTimeout(() => {
        this.placeholder = this._dateFormateService.getFormat()
        this.isComponentVisible = true;
      }, 0);

      // if (this.componentRef) {
      //   this.componentRef.destroy();
      //   this.componentRef = this.container.createComponent(MatDatePickerComponent);
      // }
    });


    if(!this.templateDriven) {
      this.formArray = this.rootFrom.control.controls[this.formArrayName];
      this.formGroup = this.rootFrom.control;
      this.FormControl = this.formArray ?  this.formArray.controls[this.GroupName].controls[this.controlName] : this.rootFrom.control.controls[this.controlName]
    }
  }


  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onDateChange(event) {
    const data = {
        target : {
          value : moment(event.target.value).format('YYYY-MM-DD')
      }
    }
    if(this.templateDriven) {
      // In this event getting value directly as eg. 2024-10-25 this but access as a event.target.value
      this.change.emit(data);
      // In this event getting value directly as eg. 2024-10-25
      this.selectedDateChange.emit(moment(event.target.value).format('YYYY-MM-DD'));
    } else {
      this.change.emit(data);
      const formatted = moment(event.target.value).format('YYYY-MM-DD');
      this.FormControl.patchValue(formatted);
    }
  }

  handleClearDate(event?: any) {
    if(event){
      event.stopPropagation();
    }
    this.selectedDate = null; // Clears the selected date in template-driven form
    this.clearDate.emit(this.selectedDate)
  }

  clearReactiveDate(event?: any) {
    if(event){
      event.stopPropagation();
    }
    this.FormControl?.setValue(null); // Clears the selected date in reactive form
    this.clearDate.emit(this.FormControl.value)
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
