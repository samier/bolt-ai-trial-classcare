import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormValidationService } from '../form-validation.service';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';


@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]

})
export class InputComponent implements OnInit {
  //#region Public | Private Variables
  @Input() controlName!: string;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() minDate: string | undefined;
  @Input() maxDate: string | undefined;
  @Input() max: string | undefined;
  @Input() min: string | undefined;
  @Input() readonly: boolean =false;
  @Input() disabled: boolean =false;
  @Input() accept: string = 'image/*';
  @Input() multiple: boolean = false;
  @Input() maxSize: number = 8;
  @Output() input = new EventEmitter()
  @Output() change = new EventEmitter()
  @ViewChild('fileInput') fileInput!: ElementRef;

  @Input() formArrayName: string = '' ;
  @Input() GroupName: any = null ;

  // formGroup!:FormGroup
  FormControl!:any
  formArray


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public formValidationService: FormValidationService,private rootFrom : FormGroupDirective, private toastr: Toastr) {}

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

  onInputChange(value,type) {
    if  (value && type == 'file') {
      this.input.emit()
    } else if (value && type == 'file') {
      this.change.emit()
    }
  }

  onMultipleFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files as FileList;

    if (files && files.length > 0) {
      let fileListArray: File[] = Array.from(files);

      // Ensure form control exists
      const uploadControl = this.rootFrom?.control.get(this.controlName);
      if (!uploadControl) {
        console.error(`Form control "${this.controlName}" is not available.`);
        return;
      }

      // Merge with existing files
      if (fileListArray.length > 0 && uploadControl.value?.length > 0) {
        const existingFiles = uploadControl.value as File[];
        const combinedArray = fileListArray.concat(existingFiles);

        // Remove duplicate files
        const uniqueFiles = Array.from(new Set(combinedArray.map(file => file.name)))
          .map(name => combinedArray.find(file => file.name === name) as File);

        uploadControl.patchValue(uniqueFiles);
      } else {
        uploadControl.patchValue(fileListArray);
      }

      // Emit selected files
      this.change.emit(files);

      // Clear input field
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }

      // Validate total file size
      const totalSizeMB = this.getTotalSize(fileListArray);
      if (totalSizeMB > this.maxSize) {
        this.toastr.showError(`Total file size cannot exceed more than ${this.maxSize} MB.`);
        return;
      }
    }
  }

  /**
   * Calculates total file size in MB.
   */
  getTotalSize(files: File[]): number {
    return files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
  }


  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
