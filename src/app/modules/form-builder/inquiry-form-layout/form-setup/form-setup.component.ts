import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { FormBuilderService } from '../../form-builder.service';
import { ExamServiceService } from 'src/app/modules/exam/exam-service.service';
import { UserService } from 'src/app/modules/user/user.service';

@Component({
  selector: 'app-form-setup',
  templateUrl: './form-setup.component.html',
  styleUrls: ['./form-setup.component.scss']
})
export class FormSetupComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  formSetupForm: FormGroup = new FormGroup({})
  @Output() typeChange: any = new EventEmitter<any>();
  @Output() formSetupChange: any = new EventEmitter<any>();
  responsibleUserData: any = []
  @Input() editData
  sectionList : any
  branchList : any

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _formValidationService: FormValidationService,
    private _formBuilderService: FormBuilderService,
    private _userService : UserService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm(this.editData);
    this.getBranchList()
    this.getAllEmployee();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  submit() {
    if (this.formSetupForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.formSetupForm);
      return;
    }
    this.typeChange.emit(2);
    this.formSetupChange.emit(this.formSetupForm.getRawValue());
  }

  clearData() {
    this.formSetupForm.patchValue({
      form_name: 'Inquiry Form',
      source: '',
      status: 1,
      submit_button_name: 'Submit',
      assign_to_user: null,
      payment_mode: null,
      submit_message: 'Your Inquiry Has Been Sumited Successfuly!',
      submit_confirm_message: 'Are you sure you want to submit your inquiry? Please review your details before proceeding.',
      section_id : null,
      branch_ids : null,
    })

  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(data) {
    this.formSetupForm = this._fb.group({
      form_name: [data?.form_name ?? 'Inquiry Form', [Validators.required]],
      section_id: [data?.section_id ?? null, [Validators.required]],
      branch_ids: [data?.branch_ids ?? null, [Validators.required]],
      source: [data?.source ?? ''],
      status: [data?.status ? Number(data?.status) : 1, [Validators.required]],
      submit_button_name: [data?.submit_button_name ?? 'Submit', [Validators.required]],
      assign_to_user: [data?.assign_to_user ?? null, [Validators.required]],
      inquiry_fees: [{ value: data?.payment_mode ?? 1, disabled: true }],
      submit_message: [data?.submit_message ?? 'Your Inquiry Has Been Sumited Successfuly!', [Validators.required]],
      submit_confirm_message: [data?.submit_confirm_message ?? 'Are you sure you want to submit your inquiry? Please review your details before proceeding.', [Validators.required]],
    })
  }

  getAllEmployee() {
    this._formBuilderService.getAllEmployee().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.responsibleUserData = res.data.map((ele) => {
          return {
            id: ele.id,
            name: ele.full_name
          }
        })
      }
    })
  }

  getSectionList() {
    const payload = {
      branches : this.formSetupForm?.value?.branch_ids?.length > 0 ? this.formSetupForm?.value?.branch_ids.map(ele => ele.id) : [] 
    }
    this._userService.getSections(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.formSetupForm.controls['section_id'].patchValue(null)
        this.sectionList = res.data;
        if (this.editData?.section_id?.length > 0 && this.sectionList) {
          const selectedSection = this.sectionList.filter(ele => this.editData.section_id.includes(ele.id));
          this.formSetupForm.controls['section_id'].patchValue(selectedSection);
        } else {
          this.formSetupForm.controls['section_id'].patchValue(null);
        }
      }
    })
  }

  getBranchList() {
    this._userService.getBranchList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.branchList = res.data.map((ele) => {
          return {
            id: ele.id,
            name: ele.branchName
          }
        })
        if (this.editData?.branch_ids?.length > 0 && this.branchList) {
          const selectedBranch = this.branchList.filter(ele => this.editData.branch_ids.includes(ele.id));
          this.formSetupForm.controls['branch_ids'].patchValue(selectedBranch);
          this.getSectionList()
        } else {
          this.formSetupForm.controls['branch_ids'].patchValue(null);
        }
      }
    })
  }

  //#endregion Private methods
}