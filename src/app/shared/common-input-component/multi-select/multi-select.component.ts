import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDropdown } from 'src/app/types/interfaces';
import { FormValidationService } from '../form-validation.service';
import { ControlContainer, FormGroup, FormGroupDirective } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class MultiSelectComponent implements OnInit {
  //#region Public | Private Variables
  @Input() controlName!: string;
  @Input() placeholder: string = '';
  @Input() itemsShowLimit?: number = 3;
  @Input() isDisabled: boolean = false;
  @Input() dropDownArray: IDropdown[] = [];
  @Input() formArrayName: string = '' ;
  @Input() GroupName: any = null ;
  @Output() change = new EventEmitter()
  // formGroup!:FormGroup
  FormControl!:any
  formArray!:any

  multiSelectDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };


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
    this.multiSelectDropdownSettings.itemsShowLimit = this.itemsShowLimit
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


  // backspace(event) {
  //   if (event.target.value == '') {

  //   }
  // }

  onChangeValue(value) {
    if (value.length > 0) {
      this.FormControl.patchValue(value);
    } else if (value.length == 0) {
      this.FormControl.patchValue(null);
    } 
    this.change.emit(value);
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}