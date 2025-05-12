import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeworkService } from '../../homework/homework.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { StudentService } from '../../student/student.service';
import moment from 'moment';
import { ResultService } from '../../result/result.service';

@Component({
  selector: 'app-student-monthly-report',
  templateUrl: './student-monthly-report.component.html',
  styleUrls: ['./student-monthly-report.component.scss']
})
export class StudentMonthlyReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  studentFilterForm : FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild('picker', { static: false })
  private picker!: any;  
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  filter: boolean = true;
  isInitialCall: boolean = true;
  is_generating: boolean = false
  sectionsList: any[] = [];
  classesList: any[] = [];
  batchesList: any[] = [];
  faculties: any[] = [];
  tbody: any = [];
  branch_id: any = window.localStorage.getItem('branch');
  displayedMonth: any = '';
  studentId: any = '';
  student:any;
  currentAcademicYear: any;
  minDate: any;
  maxDate: any;

  isOpenByClick: boolean = true
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    public homeworkService: HomeworkService,
    public reportService: ReportService, 
    public activatedRouteService: ActivatedRoute,
    private toastr: Toastr,
    private route: ActivatedRoute,
    private leaveManagementSerivce:LeaveManagmentService,
    private router: Router,
    private studentService:StudentService,
    private _fb : FormBuilder,
    private resultService: ResultService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
    this.getSectionsList();
    this.getFaculty();
    this.resultService.getAcademicYearsList({current_branch_id: [localStorage.getItem('branch')]}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.currentAcademicYear = res?.data?.find(ele => ele.current);
      this.minDate = this.currentAcademicYear?.start_time
      this.maxDate = this.currentAcademicYear?.end_time
    })
    this.studentId = this.route.snapshot.params['unique_id'];
    if(this.studentId){
      this.leaveManagementSerivce.getStudentProfileDetail(this.studentId).subscribe((resp:any) => {
        if(resp.status == false && !resp.id){
          this.router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_LIST)]);
          return;
        }
        this.router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_MONTHLY_REPORT_PROFILE+resp.unique_id)]);
        this.student = resp;
        this.studentService.setStudent({
          id : resp.unique_id,
        });
      });
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

  onSectionChange(){ 
    this.studentFilterForm?.controls['class'].patchValue(null); 
    this.studentFilterForm?.controls['batch'].patchValue(null); 
    this.classesList = [];
    this.batchesList = [];
    this.getClassList();
  }

  onClassChange(){
    this.batchesList = [];
    this.studentFilterForm?.controls['batch'].patchValue(null);
    this.getBatchList();
  }

  generateReport(){
    this.studentFilterForm?.markAllAsTouched();
    if(this.studentFilterForm?.invalid){
      return
    }
    const date = moment(this.studentFilterForm?.value?.month).format('MM-YYYY')
    const payload = {
      ...this.studentFilterForm.value,
      month: date
    }
    this.is_generating = true;
    this.reportService.generateStudentMonthlyReport(payload)
    .subscribe((res: any) => {
      this.is_generating = false;
      if(res.status){
        this.toastr.showSuccess(res?.message);
        this.reloadData();
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.is_generating = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected error occurred');
    });
  }

  reset(){
    this.studentFilterForm?.reset();
    this.studentFilterForm?.markAsUntouched();
    this.getSectionsList();
    this.displayedMonth = ''
    this.classesList = [];
    this.batchesList = [];
    this.isInitialCall = true;
  }

  chosenMonthHandler(event: Date): void {
    const selectedMonth = moment(event).startOf('month');
  
    if (
      (!this.minDate || selectedMonth.isSameOrAfter(moment(this.minDate), 'month')) &&
      (!this.maxDate || selectedMonth.isSameOrBefore(moment(this.maxDate), 'month'))
    ) {
      this.displayedMonth = selectedMonth.format('YYYY-MM');
      this.studentFilterForm.get('month')?.setValue(selectedMonth.toDate());
      this.picker.close();
    } else {
      this.toastr.showError('Selected month is outside the allowed range.');
    }
  }

  downloadReport(item: any){
    const payload = {
      ...(this.studentId && {studentIds: [this.student?.id]})
    }
    this.reportService?.downloadStudentMonthlyReport(item?.id, payload)
    .subscribe((res: any) => {
      if(res?.body?.type == 'text/html'){
        this.CommonService.downloadFile(res , `${item?.id}-monthly-report`, 'pdf');
      }else{
        this.toastr.showError(res?.message ?? 'Failed to download report');
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occured');
    });
  }

  deleteReport(item : any){
    const c = confirm("Are you sure you want to delete this record?")
    if(!c){
      return
    }
    this.reportService?.deleteStudentMonthlyReport(item?.id, this.student?.id)
    .subscribe((res: any) => {
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.reloadData();
      }else{
        this.toastr.showError(res?.message)
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occured')
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.studentFilterForm = this._fb.group({
      section_id: [null],
      class: [null],
      batch: [null, [Validators.required]],
      month: [null, [Validators.required]],
      user_id: [null]
    })
  }

  initDataTable(){
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100 ,200],
      serverSide: true,
      processing: true,
      searching: true,
  
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
  
      columns: [
        { data: 'id', orderable: false, searchable: false },
        { data: 'class_name', orderable: false },
        { data: 'batch_name', orderable: false },
        { data: 'name', orderable: false, searchable: true },
        { data: 'action', orderable: false, searchable: false }
      ]
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    const payload = {
      ...dataTablesParameter,
      ...(this.studentId && {unique_id: this.studentId})
    }
    this.reportService.getMonthlyReportList(payload).subscribe((res: any) => {
      this.tbody = res?.data?.original?.data
      callback({
        recordsTotal: res?.data?.original.recordsTotal,
        recordsFiltered: res?.data?.original.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.column(1).visible(!this.studentId);
          dtInstance.column(2).visible(!this.studentId);
          dtInstance.columns.adjust();
        });
      }, 10);
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occurred');
    })
  }

  reloadData(){
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionsList(){
    this.homeworkService.getSectionList({ branch: this.branch_id }).subscribe((res: any) => {
      if(res.status){
        this.sectionsList = [{ id: '', name: 'All Section' }].concat(res?.data)
        this.studentFilterForm.controls['section_id'].patchValue(null);
        this.getClassList();
      }
    })
  }
	
  getClassList(){
    const section = this.studentFilterForm?.value?.section_id ? [this.studentFilterForm?.value?.section_id] : []
    this.homeworkService.getClassList(section).subscribe((res: any) => {
      if(res.status){
        this.classesList = res?.data
        if(this.isInitialCall){
          this.classesList = [{ id: '', name: 'All Class' }].concat(res?.data)
          this.studentFilterForm.controls['class'].patchValue(null);
          this.isInitialCall = false
          this.getBatchList();
        }
      }
    })  
  }

  getBatchList(){
    const payload = {
      branchId: this.branch_id,
      classes: this.studentFilterForm?.value?.class ? [this.studentFilterForm?.value?.class] : [],
    } 
    this.homeworkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res.status){
        this.batchesList = res?.data;
      }
    })
  }

  getFaculty() {
    this.reportService.getFacultyAndPrincipal().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res?.status) {
        this.faculties = res?.data?.faculties?.map((item) => {
          return { id: item?.id, name: item?.full_name }
        })
      }
    })
  }
  //#endregion Private methods
}