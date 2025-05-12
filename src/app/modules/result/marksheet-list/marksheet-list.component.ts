import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResultService } from '../result.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-marksheet-list',
  templateUrl: './marksheet-list.component.html',
  styleUrls: ['./marksheet-list.component.scss'],
})
export class MarksheetListComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  duplicateTempForm: FormGroup = new FormGroup({});
  combinedMarksheetForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  deleteId: any = null;
  isDelete: boolean = false;
  isCopy: boolean = false;
  templateList: any = [];
  academicYearsList: any = [];
  markSheetTemplateList: any = [];
  selectAll: boolean = false;
  isDeleteAll: boolean = false;
  isMarksheetList: boolean = false;
  multiSelectDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  get combinedMarksheetArray(): FormArray {
    return this.combinedMarksheetForm.get('marksheetDetailsArray') as FormArray;
  }

  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    public resultService: ResultService,
    private toastr: Toastr,
    private _formValidationService: FormValidationService
  ) {}

  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.getMarkSheetTemplateList();
    this.getAcademicYearsList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods

  openPublishModal(modalName) {
    this._modalService.open(modalName, {
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  closeModel() {
    this._modalService.dismissAll();
    this.duplicateTempForm.reset();
  }

  copyMarkSheet(id, isCopy) {
    const payload = {
      is_copied: isCopy,
    };
    this.isCopy = true;

    this.resultService
      .copyMarkSheet(id, payload)
      .pipe(takeUntil(this.$destroy))
      .subscribe(
        (res: any) => {
          this.isCopy = false;
          if (res.status) {
            this.getMarkSheetTemplateList();
            this.toastr.showSuccess(res.message);
            if (!isCopy) {
              this.closeModel();
            }
          } else {
            this.toastr.showError(res.message);
          }
        },
        (error) => {
          this.isCopy = false;
          this.toastr.showError(error.error.message);
        }
      );
  }

  deleteTemplate() {
    let payload: any = {
      exam_result_marksheet_id: [],
    };
    if (this.deleteId) {
      payload.exam_result_marksheet_id = [this.deleteId];
    } else {
      if (this.markSheetTemplateList.length > 0) {
        payload.exam_result_marksheet_id = this.markSheetTemplateList
          .filter((ele) => ele.isSelected)
          .map((ele) => ele.id);
      }
    }

    this.isDelete = true;
    this.resultService
      .deleteMarkSheet(payload)
      .pipe(takeUntil(this.$destroy))
      .subscribe(
        (res: any) => {
          this.isDelete = false;
          if (res.status) {
            this.getMarkSheetTemplateList();
            this.toastr.showSuccess(res.message);
            this.closeModel();
            this.selectionCancel();
          } else {
            this.toastr.showError(res.message);
          }
        },
        (error) => {
          this.isDelete = false;
          this.toastr.showError(error.error.message);
        }
      );
  }

  duplicateTemplate() {
    if (this.duplicateTempForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(
        this.duplicateTempForm
      );
      return;
    }
    this.copyMarkSheet(this.duplicateTempForm.value.template_id, 0);
  }

  singleSelect(event) {
    const selectionData = this.markSheetTemplateList.map(
      (ele) => ele.isSelected
    );
    if (selectionData.includes(false)) {
      this.selectAll = false;
    } else {
      this.selectAll = true;
    }
  }

  selectAllChange(event) {
    this.markSheetTemplateList.forEach((element) => {
      element.isSelected = event;
    });
  }

  selectionCancel() {
    this.isDeleteAll = false;
    this.markSheetTemplateList.forEach((element) => {
      element.isSelected = false;
    });
    this.selectAll = false;
  }

  // COMBINED MARKSHEET FORM SECTION

  initCombinedMarksheetForm() {
    this.combinedMarksheetForm = this._fb.group({
      marksheetName: [''],
      marksheetDetailsArray: new FormArray([]),
    });
    this.addMarksheet();
  }

  private _createCombinedMarksheet() {
    return this._fb.group({
      marksheet_id: [null],
      class_id: [null],
      batch_id: [null],
    });
  }

  addMarksheet(): void {
    this.combinedMarksheetArray.push(this._createCombinedMarksheet());
  }

  removeMarksheet(i: number): void {
    this.combinedMarksheetArray.removeAt(i);
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.duplicateTempForm = this._fb.group({
      academic_year_id: [null, [Validators.required]],
      template_id: [null, [Validators.required]],
    });
  }

  getMarkSheetTemplateList() {
    this.isMarksheetList = true;
    this.resultService
      .getMarkSheetList()
      .pipe(takeUntil(this.$destroy))
      .subscribe(
        (res: any) => {
          if (res.status) {
            this.markSheetTemplateList = res.data;
            this.isMarksheetList = false;
            if (this.markSheetTemplateList?.length > 0) {
              this.markSheetTemplateList.forEach((element) => {
                element.isSelected = false;
              });
            }
          }
        },
        (error) => {
          this.isMarksheetList = false;
        }
      );
  }

  getTemplateList() {
    const payload = {
      selected_template_academic_year_id:
        this.duplicateTempForm.value.academic_year_id,
    };

    this.templateList = []
    this.duplicateTempForm['controls']['template_id'].reset();

    this.resultService
      .getTemplateList(payload)
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res.status) {
          this.templateList = res.data.map((ele) => {
            return {
              id: ele.id,
              name: ele.mark_sheet_name,
            };
          });
        }
      });
  }

  getAcademicYearsList() {
    const payload = {
      current_branch_id: [localStorage.getItem('branch')],
    };
    this.resultService
      .getAcademicYearsList(payload)
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res.status) {
          this.academicYearsList = res.data.map((ele) => {
            return {
              id: ele.id,
              name: ele.year,
            };
          });
        }
      });
  }

  //#endregion Private methods
}

