import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { HomeworkService } from '../../homework/homework.service';
import { ReportService } from '../report.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-exam-general-report',
  templateUrl: './exam-general-report.component.html',
  styleUrls: ['./exam-general-report.component.scss']
})
export class ExamGeneralReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  examReportFilterForm: FormGroup = new FormGroup({});
  filter: boolean = true
  is_loading: boolean = false
  isInitialCall: boolean = true;
  selectedReport: any
  sectionsList: any = []
  classesList: any = []
  batchesList: any = []
  examTypeList: any = []
  faculties: any = []
  branch_id: any = window.localStorage.getItem('branch');
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
    private _fb : FormBuilder
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.getExamTypeList();
    this.getFaculty();
    const dateControl = this.examReportFilterForm.get('date');
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
    this.examReportFilterForm?.controls['classId'].patchValue(null); 
    this.examReportFilterForm?.controls['batchId'].patchValue(null); 
    this.classesList = [];
    this.batchesList = [];
    this.getClassList();
  }

  onClassChange(){
    this.batchesList = [];
    this.examReportFilterForm?.controls['batchId'].patchValue(null);
    this.getBatchList();
  }
  
  reset(){
    this.examReportFilterForm?.reset();
    this.examReportFilterForm?.markAsUntouched();
    this.examReportFilterForm?.controls['report_type'].patchValue(1);
    this.examReportFilterForm?.controls['exam_type'].patchValue('');
    this.getSectionList();
    this.classesList = []
    this.batchesList = []
    this.isInitialCall = true
  }

  getReport(){
    this.examReportFilterForm?.markAllAsTouched();
    if(this.examReportFilterForm.invalid){
      return
    }
    const startDate = this.examReportFilterForm?.value?.date?.startDate
    const endDate = this.examReportFilterForm?.value?.date?.endDate
    if (endDate.diff(startDate, 'months', true) > 1) {
      this.toastr.showError("The end date cannot be more than one month after the start date");
      return;
    }
    const payload = {
      startDate: startDate.format('DD-MM-YYYY'),
      endDate: endDate.format('DD-MM-YYYY'),
      batch: this.examReportFilterForm?.value?.batchId ?? null,
      class: this.examReportFilterForm?.value?.classId ?? null,
      section_id: this.examReportFilterForm?.value?.sectionId ?? null,
      user_id: this.examReportFilterForm?.value?.userId,
      exam_type: this.examReportFilterForm?.value?.exam_type ?? null,
      report_type: this.examReportFilterForm?.value?.report_type ?? null
    }
    this.is_loading = true
    this.reportService.getExamReport(payload).subscribe((res: any) => {
      if(res.status){
        this.is_loading = false;
        if(res?.body?.type == 'text/html'){
          this.CommonService.downloadFile(res, 'exam-report', 'pdf');
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

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.examReportFilterForm = this._fb.group({
      sectionId: [null],
      classId: [null],
      batchId: [null, [Validators.required]],
      date: [null, [Validators.required]],
      exam_type: [null],
      report_type: [1],
      userId: [null],
    })
  }

  getExamTypeList(){
    this.reportService.getExamTypes().subscribe((res: any) => {
      this.examTypeList = [{ id: '', name: 'All Exam' }].concat(res?.data);
      this.examReportFilterForm.controls['exam_type'].patchValue('');
    })
  }

  getSectionList(){
    this.homeworkService.getSectionList({ branch: this.branch_id }).subscribe((res: any) => {
      if(res.status){
        this.sectionsList = [{ id: '', name: 'All Section' }].concat(res?.data)
        this.examReportFilterForm.controls['sectionId'].patchValue('');
        this.getClassList();
      }
    })
  }
  
  getClassList(){
    const section = this.examReportFilterForm?.value?.sectionId ? [this.examReportFilterForm?.value?.sectionId] : []
    this.homeworkService.getClassList(section).subscribe((res: any) => {
      if(res.status){
        this.classesList = res?.data
        if(this.isInitialCall){
          this.classesList = [{ id: '', name: 'All Class' }].concat(res?.data)
          this.examReportFilterForm.controls['classId'].patchValue('');
          this.isInitialCall = false
          this.getBatchList();
        }
      }
    })   
  }

  getBatchList(){
    const payload = {
      branchId: this.branch_id,
      classes: this.examReportFilterForm?.value?.classId ? [this.examReportFilterForm?.value?.classId] : [],
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