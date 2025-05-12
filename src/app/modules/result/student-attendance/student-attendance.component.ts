import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ResultService } from '../result.service';
import { ReportService } from '../../report/report.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { ExamServiceService } from '../../exam/exam-service.service';
import { DataTableDirective } from 'angular-datatables';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-student-attendance',
  templateUrl: './student-attendance.component.html',
  styleUrls: ['./student-attendance.component.scss']
})
export class studentAttendanceComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  studentAttendanceForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  sectionList:any = []
  classList:any = []
  tbody:any = [];

  attendance_detail_id:any = null;

  saveState:any = 'Save & next'

  studentsArray:any = []

  total_working_days:any = null;


  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _reportService: ReportService,
    public resultService : ResultService,
    private validationService : FormValidationService,
    private _activatedRoute : ActivatedRoute,
    private toastr: Toastr,
    private _router : Router,
    private _examService:ExamServiceService
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
    this.getSectionList();
    this.attendance_detail_id = this._activatedRoute.snapshot.paramMap.get('attendance_detail_id') || null

    if(this.attendance_detail_id){

    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods


  showStudents() {
    this.reloadData();
  }

  createStudentArray(){
    if(this.studentsArray.length > 0){
      this.studentsArray = this.studentsArray.map((el:any) => {
        let student = this.tbody.find((x:any) => x.id === el.id)
        
        if(student && student != undefined){
          return {
            ...el,
            total_absent : student.total_absent,  
            total_present : student.total_present, 
            total_leave : student.total_leave
          }
        }else{
          return el
        }
      });
    }else{
      this.studentsArray.push(...this.tbody)
    }
    
  }

  save(status:any){
    if(status){
      this.total_working_days = this.studentAttendanceForm.controls['total_working_days'].value
      this.createStudentArray()

      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        const currentPage = dtInstance.page();
        dtInstance.page(currentPage + 1).draw('page');
        
      });
    }else{
      this.studentsArray.push(...this.tbody)
      let data = this.studentAttendanceForm.value
      data = {
        ...data,
        start_date: this.studentAttendanceForm?.controls['date'].value?.startDate?.format("YYYY-MM-DD"),
        end_date: this.studentAttendanceForm?.controls['date'].value?.endDate?.format("YYYY-MM-DD"),
        students: this.studentsArray,
        attendance_detail_id : this.attendance_detail_id
      }
      this.resultService.saveStudentAttendance(data).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this._router.navigate([this.resultService.setUrl(URLConstants.STUDENT_ATTENDANCE_LIST)]);
        }
      }, (error:any) => {
        console.log(error);
        this.toastr.showError(error.error.message)
        
      })
    }
  }

  clearForm() {
    this.studentAttendanceForm.reset();
    this.studentAttendanceForm.controls['section_id'].patchValue(null);
  }


  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.studentAttendanceForm = this._fb.group({
      section_id: [null,[Validators.required]],
      class_id: [null,[Validators.required]],
      attendance_title: [null,[Validators.required]],
      date: [null],
      total_working_days: [null,[Validators.required, Validators.pattern("^[0-9]*$"),]],
    })

    this.studentAttendanceForm.valueChanges.subscribe((res) => {
      this.studentAttendanceForm.controls['class_id'].markAsPristine();
      this.studentAttendanceForm.controls['class_id'].markAsUntouched();
    })
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'gr_number' , orderable: false },
        { data: 'rollno', orderable: false },
        { data: 'student_full_name', orderable: false },
        { data: 'batch_name', name: 'batch_detail.name', orderable: false },
        { data: 'total_absent', orderable: false, searchable: false },
        { data: 'total_present', orderable: false, searchable: false },
        { data: 'total_leave', orderable: false, searchable: false },
        // { data: 'action',orderable:false,searchable:false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.studentAttendanceForm.value,
      attendance_detail_id: this.attendance_detail_id,
      class_id:this.studentAttendanceForm.controls['class_id'].value,
      start_date: this.studentAttendanceForm?.value?.date?.startDate?.format('YYYY-MM-DD') ?? null,
      end_date: this.studentAttendanceForm?.value?.date?.endDate?.format('YYYY-MM-DD') ?? null
    };
    this.resultService.getStudentList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.tbody = resp.data.map((el:any) => {
        let student = this.studentsArray.find((x:any) => x.id === el.id)
        
        if(student && student != undefined){
          return {
            ...el,
            total_absent : student.total_absent,  
            total_present : student.total_present, 
            total_leave : student.total_leave
          }
        }else{
          return el
        }
      });
      
      if(resp?.attendance_detail){
        this.classList = resp?.classes.map((el:any) => {
          return {...el, disabled: true}
        });
        this.studentAttendanceForm?.controls['date'].disable();
        this.studentAttendanceForm.patchValue({
          section_id: resp.attendance_detail.section_id,
          class_id: resp.attendance_detail.class_id,
          attendance_title: resp.attendance_detail.attendance_title,
          total_working_days: this.total_working_days != null ? this.total_working_days : resp.attendance_detail.total_working_days,
          ...(resp?.attendance_detail?.start_date && resp?.attendance_detail?.end_date  && {
            date: {
              startDate: resp.attendance_detail.start_date,
              endDate: resp.attendance_detail.end_date
            }
          })
        });
      }
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: [],
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          let page = dtInstance.page.info();
          if((page.page + 1) == page.pages){
            this.saveState = 'Save';
          }else{
            this.saveState = 'Save & Next'
          }
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionList() {
    this._reportService.getSectionList("").subscribe((res:any)=> {
      if (res.status) {
        if(this.attendance_detail_id){
          this.sectionList = res.data.map((el:any) => {
            return {...el, disabled: true}
          });
        }else{
          this.sectionList = res.data;
        }
      }
    })
  }

  getClasses () {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear().draw();
    });
    this.tbody = [];
    this.studentAttendanceForm.controls['class_id'].reset()
    const selectedSection = this.studentAttendanceForm.value.section_id ? this.studentAttendanceForm.value.section_id : '' 
    this._reportService.getStudentClassList(selectedSection).subscribe((res:any)=> {
      if (res.status) {
        this.classList = res.data
      }
    })
  }

  //#endregion Private methods

}
