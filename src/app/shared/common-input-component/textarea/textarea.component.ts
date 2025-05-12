import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormValidationService } from '../form-validation.service';
import { ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class TextareaComponent implements OnInit {
  //#region Public | Private Variables
  @Input() controlName!: string;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() rows: number = 2;
  @Input() readonly: boolean = false;
  @Output() input = new EventEmitter()

  // formGroup!:FormGroup
  FormControl!:any


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
    this.FormControl = this.rootFrom.control.controls[this.controlName]
  }


  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onInputChange(value) {
    if  (value) {
      this.input.emit()
    }
  }


  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
