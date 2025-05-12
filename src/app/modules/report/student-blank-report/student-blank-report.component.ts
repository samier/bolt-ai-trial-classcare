import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { BatchService } from '../../batch/batch.service';
import { HomeworkService } from '../../homework/homework.service';
import { ReportService } from '../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { student_status } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-student-blank-report',
  templateUrl: './student-blank-report.component.html',
  styleUrls: ['./student-blank-report.component.scss']
})
export class StudentBlankReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  blankReportForm : FormGroup = new FormGroup({});
  reportTypeList: any[] = [];
  sectionList: any[] = [];
  classList: any[] = [];
  batchList: any[] = [];
  user_id: any = window.localStorage.getItem('user_id');
  isGetLoading: boolean = false;
  isInitialCall: boolean = true;
  statusList: any[] = student_status
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private homeWorkService: HomeworkService,
    private batchService: BatchService,
    private reportService: ReportService,
    private toastr: Toastr,
    private formValidationService: FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionsList();
    this.getBlankReportType();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  getReport(){
    if(this.blankReportForm?.invalid){
      this.formValidationService?.getFormTouchedAndValidation(this.blankReportForm);
      return this.toastr.showError('Please fill all the required fields');
    }
    const payload = {
      batch_ids: this.CommonService.getID(this.blankReportForm?.value?.batch_ids),
      report_type: this.blankReportForm?.value?.report_type,
      status: this.blankReportForm?.value?.status,
    }
    this.isGetLoading = true;
    this.reportService.getStudentBlankReport(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isGetLoading = false;
      if(res){
        this.toastr.showSuccess(res?.message)
        this.CommonService.downloadFile(res, payload.report_type, 'pdf');
      }else{
        this.toastr.showError(res?.message)
      }
    },
    async(error: any) => {
      this.isGetLoading = false
      
      if(error?.error?.type == 'application/json') {
        const data = JSON.parse(await error?.error.text());
        if(!data.status){
          this.toastr.showError(data?.message);
        }
      }else{
        this.toastr.showError(error?.message ?? error?.error?.message);
      }
    });
  }

  clear(){
    this.blankReportForm?.reset();
    this.blankReportForm?.markAsUntouched();
    this.blankReportForm?.markAsPristine();
  }

  onSectionChange(){
    this.classList = [];
    this.batchList = [];
    this.blankReportForm?.controls['class_ids'].patchValue(null);
    this.blankReportForm?.controls['batch_ids'].patchValue(null);
    this.getClassList();
  }

  onClassChange(){
    this.batchList = [];
    this.blankReportForm?.controls['batch_ids'].patchValue(null);
    this.getBatchList();
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.blankReportForm = this._fb.group({
      report_type: [null, [Validators.required]],
      section_ids: [null],
      class_ids: [null],
      batch_ids: [null, [Validators.required]],
      status: [null]
    })
  }

  getBlankReportType(){
    this.reportService.getBlankReportType().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res.status){
        this.reportTypeList = res?.data;
      }
    })
  }

  getSectionsList(){
    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.sectionList = res?.data;
        this.blankReportForm.controls['section_ids'].patchValue(this.sectionList);
        this.getClassList();
      }
    })
  }

  getClassList(){
    const payload = {
      user_id: this.user_id,
      section: this.CommonService.getID(this.blankReportForm?.value?.section_ids) ?? null
    };
    this.homeWorkService.getClassByMultipleSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
        if(this.isInitialCall){
          this.blankReportForm.controls['class_ids'].patchValue(this.classList);
          this.isInitialCall = false;
          this.getBatchList();
        }
      }
    })    
  }

  getBatchList(){
    const payload = {
      classes: this.CommonService.getID(this.blankReportForm?.value?.class_ids) ?? null
    }
    this.homeWorkService.getBatchOnClass(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data
      }
    })
  }
	
  //#endregion Private methods
}
