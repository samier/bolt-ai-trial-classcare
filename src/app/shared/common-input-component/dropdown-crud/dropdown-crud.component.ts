import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { IDropdown } from 'src/app/types/interfaces';

@Component({
  selector: 'app-dropdown-crud',
  templateUrl: './dropdown-crud.component.html',
  styleUrls: ['./dropdown-crud.component.scss']
})
export class DropdownCrudComponent implements OnInit, OnChanges {
  //#region Public | Private Variables

  openDropDown: boolean = false
  selectedName: string = ''
  searchText: string = ''
  @Input() placeholder: string = '';
  @Input() searchPlaceholder: string = '';
  @Input() dropDownArray: IDropdown[] = [];
  @Input() selectedId: string | null | number = null
  @Output() createUpdate = new EventEmitter();
  @Output() deleteData = new EventEmitter();
  @Output() selectedValue = new EventEmitter();
  @Input() disabled: boolean = false;

  filterArray: any[] = [];
  id: string | null = ''

  @ViewChildren('dropdowns') dropdowns!: QueryList<ElementRef>;
  @ViewChildren('dropdownInput') dropdownInputs!: QueryList<ElementRef>;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor() { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnChanges(){
    if (this.selectedId) {
      this.filterArray = this.dropDownArray?.map(ele => {
        return { ['openToggle']: false, ...ele }
      })
      this.selectedName = this.filterArray?.find(ele => ele.id == this.selectedId)?.name || ''
    }else{
      this.clearSelection(null)
    }
  }
  ngOnInit(): void {
    // if(this.dropDownArray && this.dropDownArray.length > 0){
    //   this.filterArray = this.dropDownArray.map(ele => {
    //     return { ['openToggle']: false, ...ele }
    //   })
    // }
    // if (this.selectedId) {
    //   this.selectedName = this.filterArray.find(ele => ele.id == this.selectedId)?.name || ''
    // }
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  filterOptions() {
    this.filterArray = this.dropDownArray?.filter((reason: any, i) => {
      return reason?.name?.toLowerCase().includes(this.searchText?.toLowerCase() || "")
    }
    );
    if (!this.searchText) {
      this.id = null
    }
  }

  changeSelecttion(row: any) {
    this.selectedName = row.name;
    this.selectedValue.emit(row);
    this.toggleDropdown();
  }

  toggleDropdown() {
    this.openDropDown = !this.openDropDown;
    this.filterOptions();
    this.focusOnInput();
  }

  focusOnInput() {
    setTimeout(() => {
      this.dropdownInputs?.forEach((input) => {
        input.nativeElement?.focus();
      });
    }, 100)
  }


  toggleAction(row: any, event: Event, i) {
    this.filterArray?.forEach((reason: any) => {
      reason.openToggle = false
    })
    row.openToggle = !row.openToggle;
    event.stopPropagation();
  }

  editReason(row: any, event: Event) {
    event.stopPropagation();
    this.searchText = row.name;
    this.id = row.id
    row.openToggle = false;
    this.filterOptions();
    this.focusOnInput();
  }

  deleteReason(id: any, event: Event) {
    this.deleteData.emit(id)
    this.openDropDown = false
    event.stopPropagation();
    this.focusOnInput();
  }

  createAndUpdate(event: Event) {
    const data = {
      name: this.searchText,
      id: this.id
    }
    this.createUpdate.emit(data);
    this.openDropDown = false
    this.clearSelection(null)
  }

  clearSelection(event: any) {
    if(event) {
      event.stopPropagation();
    }
    this.filterArray?.forEach(ele => ele.openToggle = false);
    this.searchText = ''
    this.selectedName = ''
    this.selectedValue.emit(null);
    this.filterOptions();
    this.focusOnInput();
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  // reason selector 
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    let clickedInsideDropdown = false;

    this.dropdowns?.forEach((dropdown, index) => {
      if (dropdown.nativeElement?.contains(event.target)) {
        clickedInsideDropdown = true;
      }
    });

    if (!this.id) {
      this.filterArray?.forEach(ele => ele.openToggle = false);
      this.searchText = ''
      this.filterOptions()
    }

    if (!clickedInsideDropdown) {
      this.openDropDown = false;
    }
  }
  //#endregion Private methods
}
