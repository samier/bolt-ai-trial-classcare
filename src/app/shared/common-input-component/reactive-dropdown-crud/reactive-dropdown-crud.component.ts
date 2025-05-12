import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subject } from 'rxjs';
import { IDropdown } from 'src/app/types/interfaces';
import { FormValidationService } from '../form-validation.service';

@Component({
  selector: 'app-reactive-dropdown-crud',
  templateUrl: './reactive-dropdown-crud.component.html',
  styleUrls: ['./reactive-dropdown-crud.component.scss'],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class ReactiveDropdownCrudComponent implements OnInit {

  //#region Public | Private Variables

  @ViewChild('select', { static: false }) select: NgSelectComponent | undefined;
  @Input() controlName!: string;
  @Input() formArrayName: string = '' ;
  @Input() groupName: any = null ;
  @Input() placeholder: string = '';
  @Input() searchPlaceholder: string = '';
  @Input() dropDownArray: IDropdown[] = [];
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Output() createUpdate = new EventEmitter<{ id: string | number; name: string }>();
  @Output() deleteData = new EventEmitter<string | number>();

  searchControl = new FormControl();
  id: string | null = null;
  formControl!: any;
  formArray!: any;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private rootForm: FormGroupDirective,
    public formValidationService: FormValidationService,
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.formArray = this.rootForm.control.controls[this.formArrayName];
    this.formControl = this.formArray ? this.formArray?.controls[this.groupName]?.controls[this.controlName] : this.rootForm?.control?.get(this.controlName);
  }

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (this.select && !this.id) {
      this.select.filter(inputElement?.value ? inputElement?.value : '');
    }
  }

  onInputChange(event: Event): void {
    this.searchControl?.setValue(null);
    this.id = null;
  }

  focusOnSearch(): void {
    setTimeout(() =>( document.querySelector(`#search${this.groupName}`) as HTMLElement )?.focus(), 0);
  }

  editReason(item: any, event: Event): void {
    event.stopPropagation();
    this.searchControl.setValue(item.name);
    this.id = item.id;
  }

  deleteReason(id: string | number, event: Event): void {
    event.stopPropagation();
    this.deleteData.emit(id);
    this.searchControl.setValue(null);
    this.id = null;
  }

  createAndUpdate(event: Event): void {
    event.stopPropagation();

    const data = {
      name: this.searchControl?.value ?? '',
      id: this.id ?? ''
    };

    this.createUpdate.emit(data);
  }

  clearSelection(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.searchControl.setValue(null);
    this.id = null;
    this.setSuccess(null);
  }
  
  toggleMenu(item: any, event: Event): void {
    event.stopPropagation();
  
    // Close all other dropdown menus
    this.dropDownArray.forEach((dropdownItem: any) => {
      if (dropdownItem !== item) {
        dropdownItem.openToggle = false;
      }
    });
  
    item.openToggle = !item.openToggle;
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  setSuccess(id: any): void {
    if (this.formArrayName && this.groupName !== null) {
      const formArray = this.rootForm?.control?.get(this.formArrayName);
      if (formArray && formArray['controls'][this.groupName]) {
        formArray['controls'][this.groupName]?.get(this.controlName)?.setValue(id);
      }
    } else {
      this.rootForm?.control?.get(this.controlName)?.setValue(id);
    }
    this.searchControl.setValue(null);
    this.id = null;
  }
}