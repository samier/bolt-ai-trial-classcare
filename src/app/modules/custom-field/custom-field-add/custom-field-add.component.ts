import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
// import { CommonService } from '../../common-components/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CustomFieldService } from '../custom-field.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-custom-field-add',
  templateUrl: './custom-field-add.component.html',
  styleUrls: ['./custom-field-add.component.scss']
})
export class CustomFieldAddComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  customFieldForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants
  fieldTypeList: any = []
  whereToUse: any = []
  isCustomField: boolean = false
  customFieldId: string | null = null
  get values(): FormArray {
    return this.customFieldForm.get('values') as FormArray;
  }

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private _fb: FormBuilder,
    public customFieldService: CustomFieldService,
    private formValidationService: FormValidationService,
    private toastr: Toastr,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    public CommonService: CommonService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.getPreDefineConstant()
    this.initForm(null);
    this.customFieldId = this._activatedRoute.snapshot.paramMap.get('id') || null

    if (this.customFieldId) {
      this.getCustomField()
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


  addOption(data = '') {
    const optionControl = this._fb.control(data);  // Create a form control for each option
    this.values.push(optionControl);  // Add the control to the form array
  }

  removeOption(index: number) {
    this.values.removeAt(index);  // Remove control by index
  }

  saveCustomField() {

    if (this.customFieldForm.invalid) {
      this.formValidationService.getFormTouchedAndValidation(this.customFieldForm);
      return;
    } 
    else if (this.customFieldForm.value.field_type == 'dropdown' && (this.customFieldForm.value.values.includes(null) || this.customFieldForm.value.values.includes(''))) {
      this.toastr.showError('please enter option name');
      return
    }

    this.isCustomField = true

    const payload = this.customFieldForm.value

    if (payload.field_type !== 'dropdown') {
      payload.values = []
    }

    if (this.customFieldId) {
      this.customFieldService.updateCustomeField(payload, this.customFieldId).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isCustomField = false
        if (res.status) {
          this.resetForm();
          this.toastr.showSuccess(res.message);
          this._router.navigate([this.customFieldService.setUrl(URLConstants.CUSTOM_FIELD)])
        } else {
          this.toastr.showError(res.message)
        }
      }, (error) => {
        this.isCustomField = false
        this.toastr.showError(error?.error?.errors?.['values.0'][0] ?? error?.error)
      })
    } else {
      this.customFieldService.storeCustomeField(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isCustomField = false
        if (res.status) {
          this.resetForm();
          this.toastr.showSuccess(res.message);
          this._router.navigate([this.customFieldService.setUrl(URLConstants.CUSTOM_FIELD)])
        } else {
          this.toastr.showError(res.message)
        }
      }, (error) => {
        this.isCustomField = false
        this.toastr.showError(error?.error?.errors?.['values.0'][0] ?? error?.error)
      })
    }

  }

  fieldTitleChange() {
    const name = this.customFieldForm.value.field_title
    this.customFieldForm.controls['field_name'].patchValue(name.replace(/ /g, "_"))
  }

  resetForm() {
    this.customFieldForm.reset();
    this.values.controls = []
    this.addOption();
  }

  fieldTypeChange(event) {
    if (event?.name == 'dropdown') {
      this.values.controls = []
      this.addOption();
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(data) {
    this.customFieldForm = this._fb.group({
      field_title: [data?.field_title ?? '', [Validators.required]],
      field_name: [data?.field_name ?? ''],
      field_type: [data?.field_type ?? null, [Validators.required]],
      required: [data?.required ? true : false],
      where_to_use: [data?.where_to_use.toString() ?? null, [Validators.required]],
      values: this._fb.array(data?.values ?? [])
    })
  }

  getPreDefineConstant() {
    this.customFieldService.getPreDefineConstant().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.fieldTypeList = Object.entries(res.data.field_type).map(([key, val]) => ({
          id: key,
          name: val
        }));

        this.whereToUse = Object.entries(res.data.where_to_use).map(([key, val]) => ({
          id: key,
          name: val
        }));
      }
    })
  }

  getCustomField() {
    this.customFieldService.getCustomFieldOnId(this.customFieldId).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.customFieldForm.patchValue({
          field_title : res.data.field_title,
          field_name: res.data.field_name,
          field_type : res.data.field_type ,
          required : res.data.required ,
          where_to_use : res.data.where_to_use.toString() ,
        });
        res.data.values.forEach(element => {
          this.addOption(element);
        });
      }
    })
  }

  //#endregion Private methods
}
