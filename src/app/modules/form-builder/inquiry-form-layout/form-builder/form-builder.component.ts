import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FormBuilderService } from '../../form-builder.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  homeworkForm: FormGroup = new FormGroup({})
  editingIndex: number | null = null;
  @Input() formSetupData: any
  @Output() typeChange: any = new EventEmitter<any>();
  @Output() formBuilderChange: any = new EventEmitter<any>();
  isSave: boolean = false
  isSaveNext: boolean = false
  inquiryFormId
  @Input() editData

  fields: any[] = []

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _formBuilderService: FormBuilderService,
    private _toaster: Toastr
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    if(this.editData){
      this.fields = this.editData.form_fields
      this.inquiryFormId = this.editData.id
    } else {
      this.getFormFields();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  startEditing(index: number) {
    this.editingIndex = index;
  }

  stopEditing() {
    this.editingIndex = null;
  }

  onSave(type) {
    type == 'save-next' ? this.isSaveNext = true : this.isSave = true

    const data = this.fields.filter(ele => ele.selected)
    if ((this.formSetupData || this.editData) && data.length > 0) {
      const payload = {
        form_fields: this.fields,
        assign_to_user: this.formSetupData ? this.formSetupData?.assign_to_user : this.editData?.assign_to_user,
        form_name: this.formSetupData ? this.formSetupData?.form_name : this.editData?.form_name,
        inquiry_fees: this.formSetupData ? this.formSetupData?.inquiry_fees : this.editData?.inquiry_fees,
        section_id: this.formSetupData ? (this.formSetupData?.section_id.length > 0 ? this.formSetupData?.section_id.map(ele => ele.id) : [])  : this.editData?.section_id,
        branch_ids: this.formSetupData ? (this.formSetupData?.branch_ids.length > 0 ? this.formSetupData?.branch_ids.map(ele => ele.id) : [])  : this.editData?.branch_ids,
        source: this.formSetupData ? this.formSetupData?.source : this.editData?.source,
        status: this.formSetupData ? this.formSetupData?.status : this.editData?.status,
        submit_button_name: this.formSetupData ? this.formSetupData?.submit_button_name : this.editData?.submit_button_name,
        submit_confirm_message: this.formSetupData ? this.formSetupData?.submit_confirm_message : this.editData?.submit_confirm_message,
        submit_message: this.formSetupData ? this.formSetupData?.submit_message : this.editData?.submit_message
      }


      const apiCall = this.inquiryFormId
        ? this._formBuilderService.updateInquiryFormFields(this.editData.id, payload)
        : this._formBuilderService.storeInquiryFormFields(payload);

      apiCall.pipe(takeUntil(this.$destroy)).subscribe(
        (res: any) => {
          this.isSave = false;
          this.isSaveNext = false;
          if (res.status) {
            this.inquiryFormId = res.data.form_unique_id;
            this.formBuilderChange.emit(this.inquiryFormId);
            localStorage.setItem('inquiryFormId',this.inquiryFormId);
            this._toaster.showSuccess(res.message);
          } else {
            this._toaster.showError(res.message);
          }
        },
        (error) => {
          this.isSave = false;
          this.isSaveNext = false;
          this._toaster.showError(error?.error?.message ?? error?.message);
        }
      );

    } else {
      this.isSave = false;
      this.isSaveNext = false;
      this._toaster.showError('Please Select Fields..')
    }

    if (type == 'save-next') {
      this.typeChange.emit(3);
    }

  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getFormFields() {
    this._formBuilderService.getInquiryFormFields().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.fields = res.data
      } else {
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this._toaster.showError(error?.error.message ?? error?.message)
    })
  }

  //#endregion Private methods
}