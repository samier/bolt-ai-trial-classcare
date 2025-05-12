import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from '../../report/report.service';
import { ResultService } from '../result.service';

@Component({
  selector: 'app-teacher-remark-add',
  templateUrl: './teacher-remark-add.component.html',
  styleUrls: ['./teacher-remark-add.component.scss']
})
export class TeacherRemarkAddComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  teacherRemarkForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  sectionList:any = []
  classList:any = []
  tbody:any = [];

  remark_id:any = null;

  saveState:any = 'Save & next'

  studentsArray:any = []


  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _reportService: ReportService,
    public resultService : ResultService,
    private _activatedRoute : ActivatedRoute,
    private toastr: Toastr,
    private _router : Router,
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
    this.getSectionList();
    this.remark_id = this._activatedRoute.snapshot.paramMap.get('remark_id') || null
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
      this.studentsArray.push(...this.tbody)
      this.studentsArray = this.studentsArray.map((el:any) => {
        let student = this.tbody.find((x:any) => x.id === el.id)
        if(student && student != undefined){
          return {
            ...el,
            remark : student.remark,
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
      this.createStudentArray()

      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        const currentPage = dtInstance.page();
        dtInstance.page(currentPage + 1).draw('page');
      });
    }else{
      this.studentsArray.push(...this.tbody)

      const studentArray = this.studentsArray.map(ele => {
        return {
          student_id : ele.id,
          remark : ele.remark ? ele.remark : "" 
        }
      })

      let payload  = {
        ...this.teacherRemarkForm.value,
        students_remarks: studentArray,
        result_remark_id : this.remark_id
      }

       payload.students_remarks = Array.from(new Map(payload.students_remarks.map(item => [item.student_id, item])).values());
      

      if (this.remark_id) {
        this.resultService.editStudentRemark(payload).subscribe((resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message)
            this._router.navigate([this.resultService.setUrl(URLConstants.TEACHER_REMARK_LIST)]);
          }
        }, (error: any) => {
          this.toastr.showError(error?.error?.message ?? error?.message)
        })

      } else {
        this.resultService.createStudentRemarks(payload).subscribe((resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message)
            this._router.navigate([this.resultService.setUrl(URLConstants.TEACHER_REMARK_LIST)]);
          }
        }, (error: any) => {
          this.toastr.showError(error?.error?.message ?? error?.message)
        })
      }
    }
  }

  clearForm() {
    this.teacherRemarkForm.reset();
    this.teacherRemarkForm.controls['section_id'].patchValue(null);
    this.tbody = []
  }


  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.teacherRemarkForm = this._fb.group({
      section_id: [null,[Validators.required]],
      class_id: [null,[Validators.required]],
      remark_title: [null,[Validators.required]],
    })

    this.teacherRemarkForm.valueChanges.subscribe((res) => {
      this.teacherRemarkForm.controls['class_id'].markAsPristine();
      this.teacherRemarkForm.controls['class_id'].markAsUntouched();
    })
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
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
        { data: 'status', orderable: false },
        { data: 'remark', orderable: false, searchable: false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.teacherRemarkForm.value,
      remark_id: this.remark_id,
      class_id: this.teacherRemarkForm.controls['class_id'].value
    };
    if (this.remark_id) {
      const payload = {
        ...dataTablesParameters,
        result_remarks_id: this.remark_id
      }
      this.resultService.getStudentRemarkOnId(payload).subscribe((res: any) => {
        this.tbody = res.data


        if (res?.remark_details) {
          this.classList = res?.classes.map((el: any) => {
            return { ...el, disabled: true }
          });
          this.teacherRemarkForm.patchValue({
            section_id: res.remark_details?.section_id,
            class_id: res.remark_details?.class_id,
            remark_title: res.remark_details?.remark_title,
          });
        }
        callback({
          recordsTotal: res.recordsTotal,
          recordsFiltered: res.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            let page = dtInstance.page.info();
            if ((page.page + 1) == page.pages) {
              this.saveState = 'Save';
            } else {
              this.saveState = 'Save & Next'
            }
            dtInstance.columns.adjust();
          });
        }, 10);
      })
    }
    else{
      this.resultService.getStudentList(
        dataTablesParameters
      ).subscribe((resp: any) => {
        this.tbody = resp.data.map((el: any) => {
          let student = this.studentsArray.find((x: any) => x.id === el.id)
  
          if (student && student != undefined) {
            return {
              ...el,
            }
          } else {
            return el
          }
        });
  
        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            let page = dtInstance.page.info();
            if ((page.page + 1) == page.pages) {
              this.saveState = 'Save';
            } else {
              this.saveState = 'Save & Next'
            }
            dtInstance.columns.adjust();
          });
        }, 10);
      });
    }
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionList() {
    this._reportService.getSectionList("").subscribe((res:any)=> {
      if (res.status) {
        if(this.remark_id){
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
    this.teacherRemarkForm.controls['class_id'].reset()
    const selectedSection = this.teacherRemarkForm.value.section_id ? this.teacherRemarkForm.value.section_id : '' 
    this._reportService.getStudentClassList(selectedSection).subscribe((res:any)=> {
      if (res.status) {
        this.classList = res.data
      }
    })
  }

  //#endregion Private methods

}
