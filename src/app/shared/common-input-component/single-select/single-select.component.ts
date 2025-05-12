import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective } from '@angular/forms';
import { FormValidationService } from '../form-validation.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IDropdown } from 'src/app/types/interfaces';

@Component({
  selector: 'app-single-select',
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class  SingleSelectComponent implements OnInit {
  //#region Public | Private Variables
  @ViewChild('select', { static: false }) select: NgSelectComponent | undefined;
  @Input() controlName!: string;
  @Input() placeholder: string = '';
  @Input() dropDownArray: IDropdown[] = [];
  @Input() readonly: boolean = false;
  @Input() search: boolean = true;
  @Output() change = new EventEmitter()

  @Input() formArrayName: string = '' ;
  @Input() GroupName: any = null ;
  @Input() isClear : boolean = false;
  @Output() clearChange = new EventEmitter()


  // formGroup!:FormGroup
  FormControl!:any
  formArray


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public formValidationService: FormValidationService,private rootFrom : FormGroupDirective) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    // this.formGroup = this.rootFrom.control;
    this.formArray = this.rootFrom.control.controls[this.formArrayName];
    this.FormControl = this.formArray ?  this.formArray.controls[this.GroupName].controls[this.controlName] : this.rootFrom.control.controls[this.controlName]
  }


  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  /**
   * Touch on return error
   * @param controlName control name
   */
  // makeDirty(controlName: string) : void {
  //   this.formGroup.get(controlName)?.markAsDirty()
  //   this.formGroup.get(controlName)?.updateValueAndValidity({ onlySelf: true})
  // }

  onChangeValue(value) {
    if  (value) {
      this.change.emit(value)
    }
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (this.select) {
      this.select.filter(inputElement?.value ? inputElement?.value : '');
    }
  }

  focusOnSearch(): void {
    setTimeout(() =>( document.querySelector('#inputValidation') as HTMLElement )?.focus(), 0);
  }

  selectionClear() {
    this.FormControl?.setValue(null);
    this.clearChange.emit(this.FormControl.value)
  }

  // backspace(event) {
  //   if (event.target.value == '') {

  //   }
  // }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}



