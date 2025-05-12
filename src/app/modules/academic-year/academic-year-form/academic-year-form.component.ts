import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { AcademicYearService } from '../academic-year.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import moment from 'moment';

@Component({
  selector: 'app-academic-year-form',
  templateUrl: './academic-year-form.component.html',
  styleUrls: ['./academic-year-form.component.scss']
})
export class AcademicYearFormComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  academicYearForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  id:any;
  academicYear:any;
  saving:boolean = false;
  minDate:any;
  maxDate:any;
  @ViewChild('picker', { static: false })
  private picker!: any;  
  displayedYear: any = '';
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public academicYearService:AcademicYearService,
    public commonService:CommonService,
    private toastr:Toastr,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private _fb: FormBuilder,
    public formValidationService: FormValidationService,
  ) { }

  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.id = this._activatedRoute.snapshot.paramMap.get('id') || null
    if(this.id){
      this.getAcademicYearOnId();
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

  handleChangeYearName(){
    this.minDate = null;
    this.maxDate = null;
    this.displayedYear = '';
    this.academicYearForm.patchValue({
      current_year : null
    })
    const year = this.academicYearForm.get('year')?.value?.split('-');
    if(year?.length != 2 || (year[1] - 1) != year[0] || this.academicYearForm.get('year')?.value?.length != 9) return;
    this.minDate = year[0] + '-01-01';
    this.maxDate = year[1] + '-12-31';
    this.displayedYear = year[1]; 
    this.academicYearForm.patchValue({
      current_year : year[1] + '-01-01'
    })
  }

  chosenYearHandler(event: Date): void {
    const year = event.getFullYear(); 
    this.displayedYear = year.toString(); 
    const fullDate = new Date(year, 0, 1); 
    this.academicYearForm.get('current_year')?.setValue(fullDate); 
    this.picker.close(); 
  }

  submit(){
    if(this.academicYearForm.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.academicYearForm)
      return;
    }
    const year = this.academicYearForm.get('year')?.value?.split('-');
    if(year?.length != 2 || (year[1] - 1) != year[0] || this.academicYearForm.get('year')?.value?.length != 9){
      this.toastr.showError('please enter valid year')
      return;
    }
    const date = new Date(this.academicYearForm.get('current_year')?.value)
    this.academicYearForm.get('current_year')?.setValue(moment(date).format('YYYY-01-01'))
    const current_year = this.academicYearForm.get('current_year')?.value?.toString()?.split('-')?.[0] ?? null;
    if(!year.includes(current_year)){
      this.toastr.showError('please select valid academic year')
      return;
    }

    this.saving = true;
    this.academicYearService.storeOrUpdateAcademicYear(this.academicYearForm.value,this.id).subscribe((res:any) => {
        if(res.status) {
          this.toastr.showSuccess(res.message)
          this.commonService.triggerYearDropdownRefresh();
          this.router.navigate([this.commonService.setUrl(URLConstants.ACADEMIC_YEAR_LIST)]);
        } else {
          this.toastr.showError(res.message)
        }
        this.saving = false;
      } ,(error)=> {
        this.saving = false;
        this.toastr.showError(error?.error?.message || error?.message)
      })
  }

  cancel(){
    this.academicYearForm.reset()
    this.displayedYear = '';
    if(this.id){
      this.getAcademicYearOnId();
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(){
    this.academicYearForm = this._fb.group({
      year: [null, [Validators.required]],
      current_year: [null, [Validators.required]],
      start_time: [null, [Validators.required]],
      end_time: [null, [Validators.required]],
    })
  }

  getAcademicYearOnId() {
    this.academicYearService.getAcademicYearOnId(this.id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.academicYear = res.data; 
        this.setFormValues();
      } else {
        this.toastr.showError(res.message)
      }
    } ,(error)=> {
        this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  setFormValues(){
    this.academicYearForm.patchValue({
      year : this.academicYear?.year,
      current_year : this.academicYear?.current_year,
      start_time : this.academicYear?.start_time,
      end_time : this.academicYear?.end_time,
    })
    const year = this.academicYear?.year?.split('-');
    if(year?.length != 2 || (year[1] - 1) != year[0] || this.academicYear?.year?.length != 9) return;
    this.minDate = year[0] + '-01-01';
    this.maxDate = year[1] + '-12-31';
    this.displayedYear = this.academicYear?.current_year?.split('-')?.[0] || year[1]; 
  }

  //#endregion Private methods


}
