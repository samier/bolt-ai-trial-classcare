import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { HomeworkService } from '../../homework/homework.service';
import { ReportService } from '../report.service';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';

@Component({
  selector: 'app-batch-report',
  templateUrl: './batch-report.component.html',
  styleUrls: ['./batch-report.component.scss'],
})
export class BatchReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  batchReportFilterForm: FormGroup = new FormGroup({});
  filter: boolean = true
  is_loading: boolean = false
  isInitialCall: boolean = true;
  sectionsList: any = []
  classesList: any = []
  batchesList: any = []
  students: any = [];
  student: any = null;
  branch_id: any = window.localStorage.getItem('branch');

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    public homeworkService: HomeworkService,
    private reportService: ReportService,
    public activatedRouteService: ActivatedRoute,
    private toastr: Toastr,
    private _fb : FormBuilder,
    public leavingCertificateService : StudentLeavingCertificateService,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    const dateControl = this.batchReportFilterForm.get('date');
    if (dateControl) {
      dateControl.valueChanges.subscribe((value) => {
        if (!value.startDate && !value.endDate) {
          dateControl.markAsTouched();
          dateControl.setErrors({ required: true });
        } else {
          dateControl.setErrors(null);
        }
      });
    }
  }
  
  ngOnDestroy(): void {
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  onSectionChange(){
    this.batchReportFilterForm?.controls['classId'].patchValue(null); 
    this.batchReportFilterForm?.controls['batchId'].patchValue(null); 
    this.classesList = [];
    this.batchesList = [];
    this.getClassList();
  }
  
  onClassChange(){
    this.batchesList = [];
    this.batchReportFilterForm?.controls['batchId'].patchValue(null);
    this.getBatchList();
  }

  onBatchChange()
  {
    this.batchReportFilterForm.controls['student'].reset();
    this.student = null;
    const batchId = this.batchReportFilterForm.value.batchId
    this.leavingCertificateService.getStudentListByClassId(batchId).subscribe((res:any) => {
      this.students = res.data;
        this.students = res.data.map(ele => {
          return {
            name: ele.full_name_gr_number,
            id: ele.id
          }
      });
    });
  }

  getReport(){
    this.batchReportFilterForm?.markAllAsTouched();
    if(this.batchReportFilterForm.invalid){
      return
    }
    const startDate = this.batchReportFilterForm?.value?.date?.startDate
    const endDate = this.batchReportFilterForm?.value?.date?.endDate
    const payload = {
      startDate: startDate.format('DD-MM-YYYY'),
      endDate: endDate.format('DD-MM-YYYY'),
      batchId: this.batchReportFilterForm?.value?.batchId,
      studentId: this.batchReportFilterForm?.value?.student?.map((ele)=> ele.id),
      show_student_absent_marks: this.batchReportFilterForm.value?.show_student_absent_marks ? true : false,
    }
    this.is_loading = true
    this.reportService.getBatchReport(payload).subscribe((res: any) => {
      if(res.status){
        this.is_loading = false;
        if(res?.body?.type == 'text/html'){
          this.CommonService.downloadFile(res, 'batch-report', 'pdf');
        }else{
          this.toastr.showError("No data found")
        }
      }
    },
    (error: any)=> {
      this.is_loading = false;
      this.toastr.showError(error?.error?.message ?? error?.message);
    });
  }

  reset(){
    this.batchReportFilterForm?.reset();
    this.batchReportFilterForm?.markAsUntouched();
    this.getSectionList();
    this.classesList = []
    this.batchesList = []
    this.isInitialCall = true
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm(){
    this.batchReportFilterForm = this._fb.group({
      sectionId: [null],
      classId: [null],
      batchId: [null, [Validators.required]],
      date: [null, [Validators.required]],
      student: [null],
      show_student_absent_marks : [false]
    });
  } 

  getSectionList(){
    this.homeworkService.getSectionList({ branch: this.branch_id }).subscribe((res: any) => {
      if(res.status){
        this.sectionsList = [{ id: '', name: 'All Section' }].concat(res?.data)
        this.batchReportFilterForm.controls['sectionId'].patchValue('');
        this.getClassList();
      }
    })
  }

  getClassList(){
    const section = this.batchReportFilterForm?.value?.sectionId ? [this.batchReportFilterForm?.value?.sectionId] : []
    this.homeworkService.getClassList(section).subscribe((res: any) => {
      if(res.status){
        this.classesList = res?.data
        if(this.isInitialCall){
          this.classesList = [{ id: '', name: 'All Class' }].concat(res?.data)
          this.batchReportFilterForm.controls['classId'].patchValue('');
          this.isInitialCall = false
          this.getBatchList();
        }
      }
    })    
  }
  
  getBatchList(){
    const payload = {
      branchId: this.branch_id,
      classes: this.batchReportFilterForm?.value?.classId ? [this.batchReportFilterForm?.value?.classId] : [],
    } 
    this.homeworkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res.status){
        this.batchesList = res?.data;
      }
    })
  }

  //#endregion Private methods
}