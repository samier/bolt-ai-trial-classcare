import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { InquiryFormService } from './inquiry-form.service';
import moment from 'moment';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  styleUrls: ['./inquiry-form.component.scss']
})
export class InquiryFormComponent implements OnInit, AfterViewInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  inquiryForm!: FormGroup
  inquiryID: string | null = ''
  formData: any = null
  isFormGenerated: boolean = false
  errorMessage = ''
  isSave = false
  @ViewChild('fileInput') fileInput!: ElementRef;
  maxDate = moment().format('YYYY-MM-DD');
  selectedBranch:any = {
    image : 'assets/images/initial_bracnh_logo.png',
    name : 'School Name'
  }
  singleBranch : boolean = false

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _formValidationService: FormValidationService,
    private _toaster: Toastr,
    private _inquiryFormService: InquiryFormService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.inquiryID = this._activatedRoute.snapshot.paramMap.get('id') || null
    if (this.inquiryID) {
      this.getForm()
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

  onSubmit() {
    if (this.inquiryForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.inquiryForm);
      this._toaster.showError('please fill all the required fields');
      return;
    }

    const confirmation = window.confirm(this.formData.form.submit_confirm_message);

    if (confirmation) {
      const payload = this.inquiryForm.value
      // payload.status = 0
      payload.created_by = this.formData.form.created_by
      payload.section_id = this.formData.form.section_id
      payload.age = payload.age ?? ""
      payload.form_builder_id = this.formData.form.id
      payload.academic_id = this.inquiryForm.value.academic_year_id
      payload.b_id = this.inquiryForm.value.branch_id

      this.isSave = true
      this._inquiryFormService.storeInquiry(this.inquiryID, payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.isSave = false
          this._toaster.showSuccess(this.formData.form.submit_message);
          this.inquiryForm.reset();
        } else {
          this.isSave = false
          this._toaster.showError(res.message);
        }
      }, (error) => {
        this.isSave = false
        this._toaster.showError(error?.error?.message ?? error?.message)
      })
    }
  }

  getValidatorValue(field: any, type: string): number | null {
    const validator = field.validators.find((v: string) => v.startsWith(type));
    return validator ? parseInt(validator.split(':')[1], 10) : null;
  }

  async imageUpload(event, control) {
    const file = event.target.files[0]
    
    if(!(file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png")) {
      this._toaster.showError(`Can not upload ${file.type} file type. Please upload jpg, jpeg or png files only.`);
      event.target.value = '';
      return;
    }

    if (file) {
      const size = file.size / 1000000
      if (size >= 2) {
        this._toaster.showError('Total file size cannot exceed more than 2 MB.');
        event.target.value = '';
        return;
      }
    }

    const imagebase64 = await this.CommonService.convertToBase64(file);
    const data = {
      attachment_name: file.name,
      imagebase64: imagebase64,
    }
    this.inquiryForm.controls[control]?.patchValue(data);
  }

  selectionChange(event, item) {
    if (item.key === 'branch_id') {
      this.formData.form.form_fields.find(ele => ele.key === 'academic_year_id').options = null
      this.inquiryForm.controls['academic_year_id'].patchValue(null);

      this.formData.form.form_fields.find(ele => ele.key === 'class_id').options = null
      this.inquiryForm.controls['class_id'].patchValue(null);

      const selectedBranchAcademicYear = this.formData.academic_year.filter(ele => ele.branch_id == event.id)

      this.formData.form.form_fields.find(ele => ele.key === 'academic_year_id').options = selectedBranchAcademicYear

      this.selectedBranch = event

    } else if (item.key === 'academic_year_id') {

      this.inquiryForm.controls['class_id'].patchValue(null);

      const payload = {
        section_id : this.formData.form.section_id,
        b_id: this.inquiryForm.value.branch_id,
        academic_id: event.id
      }

      this.getClassList(payload);
    }
  }

  resetForm() {
    this.inquiryForm.reset();
    this.fileInput.nativeElement.value = '';
  }

  calculateAge(control): void {
    if (control == 'date_of_birth') {
      const dob = this.inquiryForm?.value?.date_of_birth

    if (dob) {
      let birthDate

      birthDate = moment(dob);
      const today = moment();

      const ageYears = today.diff(birthDate, 'years');
      const ageMonths = today.diff(birthDate.add(ageYears, 'years'), 'months');

      const formattedAge = `${ageYears} Years ${ageMonths} Months`;

      this.inquiryForm.controls['age'].setValue(formattedAge);
    }
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.inquiryForm = this._fb.group({})

    this.formData.form.form_fields.forEach(field => {

      let validators: any = [];
      // if (field?.selected) {
      if (field?.required) {
        validators.push(Validators.required);
      }

      if (field?.validators?.email) {
        validators.push(Validators.email);
      }

      if (field?.validators) {
        for (const key in field?.validators) {
          if (key === 'min') {
            validators.push(Validators.min(field?.validators[key]));
          } else if (key === 'max') {
            validators.push(Validators.max(field?.validators[key]));
          } else if (key === 'minLength') {
            validators.push(Validators.minLength(field?.validators[key]));
          } else if (key === '  ') {
            validators.push(Validators.maxLength(field?.validators[key]));
          } else if (key === 'pattern') {
            
            validators.push(ClassCareValidatores.pattern(field?.validators[key],'This input value is not valid'));
          }

          // else if (key === 'url') {
          //   validators.push(Validators.pattern(`(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})`));
          // }else if (validator.startsWith('date')) {
          //   validators.push(Validators.pattern(/^\d{4}-\d{2}-\d{2}$/));  // YYYY-MM-DD
          // }

        }
      }

      this.inquiryForm.addControl(field.key, this._fb.control(null, validators));
      // }
    });
  }

  ngAfterViewInit() {
    this.sendHeight();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.sendHeight();
  }

  sendHeight() {
    setTimeout(() => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ height }, "*");
    }, 300); // Delay ensures content is loaded
  }

  getForm() {
    this._inquiryFormService.getInquiryForm(this.inquiryID).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status && res.data.form) {
        this.formData = res.data
        this.initForm();
        const branch = this.formData.form.form_fields.find((ele => ele.key == 'branch_id'))
        this.singleBranch = branch?.options?.length == 1
        if(this.singleBranch){
          this.inquiryForm.get('branch_id')?.patchValue(branch?.options[0].id)
          this.selectionChange(branch.options[0], branch)
        }
        this.isFormGenerated = true
      } else {
        this.formData = null
        this.isFormGenerated = true
        this.errorMessage = res?.message ?? 'Please contact to admin';
        this._toaster.showError(res?.message)
      }
    }, (error) => {
      this.formData = null
      this.isFormGenerated = true
      this.errorMessage = error?.error?.message ?? error?.message ?? 'Please contact to admin';
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  getClassList(payload) {
    this._inquiryFormService.getClassList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.formData.form.form_fields.find(ele => ele.key === 'class_id').options = res.data ?? []
      } else {
        this._toaster.showError(res?.message)
      }
    }, (error) => {
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  //#endregion Private methods
}