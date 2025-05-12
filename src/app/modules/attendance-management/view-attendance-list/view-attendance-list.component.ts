import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';
import moment from 'moment';
import { Toastr } from 'src/app/shared/services/toastr';
import { ResultService } from '../../result/result.service';
import { ExamServiceService } from '../../exam/exam-service.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { AttendanceManagementService } from '../attendance-management.service';
import { DomSanitizer } from '@angular/platform-browser';
import { sessionList } from 'src/app/common-config/static-value';
import { BatchService } from '../../batch/batch.service';

@Component({
  selector: 'app-view-attendance-list',
  templateUrl: './view-attendance-list.component.html',
  styleUrls: ['./view-attendance-list.component.scss']
})
export class ViewAttendanceListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  viewAttendanceForm : FormGroup = new FormGroup({})
  @ViewChild('picker', { static: false })
  private picker!: any;  
  filterCount: any = 0;
  filter:any = false;
  URLConstants = URLConstants;
  sectionsList: any[] = [];
  classesList: any[] = [];
  batchesList: any[] = [];
  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  minDate: any;
  maxDate: any;
  currentAcademicYear: any;
  displayedMonth: any = '';
  attendanceSession: any;
  sessionList = sessionList;
  html: any;
  pdfLoading: boolean = false;
  excelLoading: boolean = false;
  showLoading : boolean = false;
  attendanceType : { id: number, name: string }[]= [];
  
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public CommonService: CommonService,
    public homeworkService: HomeworkService, 
    private _fb : FormBuilder,
    private _resultService: ResultService,
    private examService : ExamServiceService,
    private toastr: Toastr,
    public formValidationService: FormValidationService,
    private _AttendanceManagementService: AttendanceManagementService,
    private sanitizer: DomSanitizer,
    private batchService: BatchService
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.getClassList();
    this.getBatchList();
    this.getBranchNotification();
    this._resultService.getAcademicYearsList({current_branch_id: [localStorage.getItem('branch')]}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.currentAcademicYear = res?.data?.find(ele => ele.current);
      this.minDate = this.currentAcademicYear?.start_time
      this.maxDate = this.currentAcademicYear?.end_time
    });
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  countFilters(){
    this.filterCount = 0;
    const filter = this.viewAttendanceForm?.value;
    Object.keys(filter).forEach((item) => {
      if (item === 'date') {
        if (filter[item]?.startDate && filter[item]?.endDate) {
          this.filterCount++;
        }
      }else if (filter[item] && (Array.isArray(filter[item]) ? filter[item].length : true)) {
        this.filterCount++;
      }
    })
  }

  onSectionChange(){
    this.viewAttendanceForm?.controls['classId'].patchValue(null); 
    this.viewAttendanceForm?.controls['batchId'].patchValue(null); 
    this.classesList = [];
    this.batchesList = [];
    this.getClassList();
  }
  
  onClassChange(){
    this.batchesList = [];
    this.viewAttendanceForm?.controls['batchId'].patchValue(null);
    this.getBatchList();
  }

  reset(event: any){
    if(event){
      event.stopPropagation();
    }
    this.viewAttendanceForm?.reset();
    this.viewAttendanceForm.markAsPristine();
    this.filterCount = 0;
    this.displayedMonth = '';
    this.html = '';
    this.classesList = [];
    this.batchesList = [];
    this.getClassList();
    this.getBatchList();
  }

  chosenMonthHandler(event: Date): void {
    const selectedMonth = moment(event).startOf('month');
  
    if (
      (!this.minDate || selectedMonth.isSameOrAfter(moment(this.minDate), 'month')) &&
      (!this.maxDate || selectedMonth.isSameOrBefore(moment(this.maxDate), 'month'))
    ) {
      this.displayedMonth = selectedMonth.format('YYYY-MM');
      this.viewAttendanceForm.get('month')?.setValue(selectedMonth.toDate());
      this.picker.close();
    } else {
      this.toastr.showError('Selected month is outside the allowed range.');
    }
  }

  onShow() {
    this.formValidationService.getFormTouchedAndValidation(this.viewAttendanceForm)
    if (this.viewAttendanceForm.invalid) {
      return this.toastr.showError("Please fill all the required fields"); 
    }
    const date = moment(this.viewAttendanceForm?.value?.month).format('YYYY-MM')
    const payload = {
      batch_id: this.viewAttendanceForm?.value?.batchId ?? null,
      date:date,
      attendance_type:this.CommonService.getID(this.viewAttendanceForm?.value?.attendanceTypeId)?? null,
    };
    this.showLoading = true;
    this.countFilters();
    this.getReport(payload);
  }

  downloadReport(format: any) {
    if (this.viewAttendanceForm.invalid) {
      this.formValidationService.getFormTouchedAndValidation(this.viewAttendanceForm);
      return this.toastr.showError("Please fill all the required fields"); 
    }
    const date = moment(this.viewAttendanceForm?.value?.month).format('YYYY-MM')
    const payload = {
      batch_id: this.viewAttendanceForm?.value?.batchId ?? null,
      date:date,
      attendance_type:this.CommonService.getID(this.viewAttendanceForm?.value?.attendanceTypeId)?? null,
    };
    this.countFilters();
    format == 'pdf' ? this.pdfLoading = true : format == 'excel' ? this.excelLoading = true : '';
    this._AttendanceManagementService.getAttendanceReportPdf(payload, format).pipe(takeUntil(this.$destroy)).subscribe((resp: any) => {
      this.pdfLoading = false;
      this.excelLoading = false;
      this.CommonService.downloadFile(resp, 'attendance-report', format);
    }, 
    async(error: any) => {
    
      this.pdfLoading = false;
      this.excelLoading = false;
      
      if(error?.error?.type == 'application/json') {
        const data = JSON.parse(await error?.error.text());
        if(!data.status){
          this.toastr.showError(data?.message);
        }
      }
    });
  }
  

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.viewAttendanceForm = this._fb.group({
      sectionId: [''],
      classId: [''],
      batchId: [null,[Validators.required]],
      attendanceTypeId: [null,[Validators.required]],
      month: [null,[Validators.required]],
    })
  }

  getSectionList(){
    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.sectionsList = [{id: '', name: 'All Section'}].concat(res?.data);
      }
    })
  }

  getClassList(){
    const payload = {
      section_id: this.viewAttendanceForm?.value?.sectionId ?? null,
      user_id: this.user_id ?? null,
    }
    this.homeworkService.getClass(payload, 0).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res.status){
        this.classesList = [{id: '', name: 'All Class'}].concat(res?.data);
      }
    }) 
  }
  
  getBatchList(){
    const payload = {
      classes: this.viewAttendanceForm?.value?.classId ? [this.viewAttendanceForm?.value?.classId] : [],
    } 
    this.homeworkService.getBatchOnClass(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res.status){
        this.batchesList = res?.data;
      }
    })
  }

  getBranchNotification(){
    this.examService.getNotification().pipe(takeUntil(this.$destroy)).subscribe((res: any) =>{
      if (res.status)
      {
        this.attendanceSession = res?.data?.attendance_session;
        this.attendanceType = this.attendanceSession == 1 ? [...this.sessionList] : this.sessionList.slice(0, 2);
      }
    });
  }

  getReport(payload: any) {
    this._AttendanceManagementService.getAttendanceReport(payload).pipe(takeUntil(this.$destroy)).subscribe(
      (resp: any) => {
        this.showLoading = false;
        this.html = this.sanitizer.bypassSecurityTrustHtml(resp);
      },
      (error: any) => {
        this.showLoading = false;
        this.toastr.showError(error?.message ?? error?.error?.message)
      }
    );
  }

  //#endregion Private methods
}