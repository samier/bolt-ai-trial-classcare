import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { HomeworkService } from '../homework.service';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-notice-history',
  templateUrl: './notice-history.component.html',
  styleUrls: ['./notice-history.component.scss']
})
export class NoticeHistoryComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  noticeHistoryForm : FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any;
  filter: boolean = true;
  isStudent: boolean = true;
  isShowLoading: boolean = false;
  isInitialCall: boolean = true;
  isInitailized: boolean = false;
  isSelected: boolean = false;
  sectionsList: any[] = [];
  classesList: any[] = [];
  batchesList: any[] = [];
  studentsList: any[] = [];
  rolesList: any [] = [];
  employeesList: any [] = [];
  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  search:any = {
    title: '',
    attachment_type: ''
  };
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      public homeworkService: HomeworkService, 
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
    this.getSectionsList();
    this.getRolesList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  onNoticeTypeChange(value: number){
    this.isStudent = value === 1 ? true : false;
    this.isSelected = false;
    this.updateFormValidation();
    this.onReset();
  }

  onSectionChange(){
    this.noticeHistoryForm?.controls['classId'].patchValue(null); 
    this.noticeHistoryForm?.controls['batchId'].patchValue(null); 
    this.noticeHistoryForm?.controls['studentId'].patchValue(null); 
    this.classesList = [];  
    this.batchesList = [];  
    this.studentsList = [];
    this.getClassList(); 
  }

  onClassChange(){
    this.noticeHistoryForm?.controls['batchId'].patchValue(null);
    this.noticeHistoryForm?.controls['studentId'].patchValue(null);
    this.batchesList = []; 
    this.studentsList = [];
    this.getBatchesList();
  }

  onBatchChange(){
    this.noticeHistoryForm?.controls['studentId'].patchValue(null);
    this.studentsList = [];
    this.getStudentsList();
  }

  onRoleChange(){
    this.noticeHistoryForm?.controls['employeeId'].patchValue(null);
    this.employeesList = [];
    this.getEmployeesList();
  }

  onShow(){
    this.updateFormValidation();
    this.noticeHistoryForm.markAllAsTouched();
    if(this.noticeHistoryForm.invalid){
      return;
    }
    this.isSelected = true
    if (!this.isInitailized){
      this.initializeDatatable();
      this.isInitailized = true;
      this.isShowLoading = true
    }else{
      this.isShowLoading = true
      this.reloadData();
    }
  }

  onReset(){
    this.isSelected = false
    this.noticeHistoryForm.reset();
    this.noticeHistoryForm.markAsPristine();
    this.reloadData();
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.noticeHistoryForm = this._fb.group({
      sectionId: [null],
      classId: [null],
      batchId: [null],
      studentId: [null],
      employeeId: [null],
      roleId: [null],
    })
  }

  initializeDatatable() {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      order: [[1, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'id', orderable: false, searchable: false },
        { data: 'title', name: 'title' },
        { data: 'type', name: 'type' },
        { data: 'id', name: 'id', orderable: false, searchable: false },
      ]
    };
  }

  loadData(dataTablesParameters: any, callback: any): void {
    Object.keys(this.search).forEach((column: any) => {
      const columnIndex = dataTablesParameters.columns.findIndex((dtColumn: any) => dtColumn.data === column);
      if (columnIndex !== -1) {
        dataTablesParameters.columns[columnIndex].search.value = this.search[column];
      }
    });
  
    const payload = {
      ...dataTablesParameters,
      academic_year_id: this.currentYear_id,
      branch_id: this.branch_id,
      user_type: this.isStudent ? 'students' : 'users',
      ids: this.isStudent ? this.getID(this.noticeHistoryForm?.value?.studentId) : this.getID(this.noticeHistoryForm?.value?.employeeId)
    };

    this.homeworkService.getNoticeHistory(payload).subscribe(
      (res: any) => {
        this.isShowLoading = false;
        res?.data?.original?.data.map((item: any) => {
          switch(item.type){
            case 1:
              item.type = 'School Notice'
              break;
            case 2:
              item.type = 'Employee Notice';
              break;
            case 3:
              item.type = 'Class Notice';
              break;
            default:
              item.type = 'Unknown';
              break;
          }
        });
        this.tbody = res?.data?.original?.data
        callback({
          recordsTotal: res?.data?.original?.recordsTotal,
          recordsFiltered: res?.data?.original?.recordsFiltered,
          data: [] 
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      },
      (error) => {
        this.isShowLoading = false;
        if(error?.message || error?.error?.message === "The ids field is required."){
          this.toastr.showError(`Please Select ${this.isStudent ? "Student" : "Employee"} for History`);
        }else{
          this.toastr.showError(error?.error?.message ?? error?.message);
        }
      }
    );
  }  

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  updateFormValidation() {
    const controlsToValidate = this.isStudent 
      ? ['sectionId', 'classId', 'batchId', 'studentId'] 
      : ['roleId', 'employeeId'];
  
    Object.values(this.noticeHistoryForm.controls).forEach(control => control.clearValidators());
    controlsToValidate.forEach(controlName => {
      this.noticeHistoryForm.controls[controlName].setValidators([Validators.required]);
      this.noticeHistoryForm.controls[controlName].updateValueAndValidity();
    });
  }  

  getSectionsList(){
    this.homeworkService.getSectionList({ branch: this.branch_id }).subscribe((res:any)=>{
      if (res?.status) {
        this.sectionsList = res?.data
        this.noticeHistoryForm.controls['sectionId'].patchValue(this.sectionsList);
        this.getClassList();
      }
    })
  }
	
  getClassList(){
    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id: this.branch_id,
      user_id: this.user_id,
      section: this.getID(this.noticeHistoryForm?.value?.sectionId) ?? null
    };
    if(payload.section){
      this.homeworkService.getClassByMultipleSection(payload).subscribe((res: any) => {
        if (res?.status) {
          this.classesList = res?.data;
          if(this.isInitialCall){
            this.noticeHistoryForm.controls['classId'].patchValue(this.classesList);
            this.isInitialCall = false
          }
          this.getBatchesList();
        }
      })
    }
  }

  getBatchesList(){
    const payload = {
      academic_year_id: this.currentYear_id,
      branchId: this.branch_id,
      classes: this.getID(this.noticeHistoryForm?.value?.classId) ?? null
    };
    if(payload.classes){
      this.homeworkService.getBatchOnClass(payload).subscribe((res: any) => {
        if (res?.status) {
          this.batchesList = res.data;
          this.noticeHistoryForm.controls['batchId'].patchValue(null);
          this.noticeHistoryForm.markAsPristine();
        }
      })
    }
  }

  getStudentsList(){
    const payload = {
      branchId: this.branch_id ?? '',
      batches: this.getID(this.noticeHistoryForm?.value?.batchId) ?? []
    };
    this.homeworkService.getStudent(payload).subscribe((res: any) => {
      if (res?.status) {
        this.studentsList = res?.data;
      }
    })
  }

  getRolesList(){
    this.homeworkService.getRoleList().subscribe((res: any) => {
      if (res?.status) {
        this.rolesList = res?.data;
      }
    })
  }

  getEmployeesList(){
    const payload = {
      branch_id : this.branch_id ,
      role_id   : this.getID(this.noticeHistoryForm?.value?.roleId) ?? null ,
    }
    if(payload.role_id){
      this.homeworkService.getEmployeeList(payload).subscribe((res:any) => {
        if(res?.status){
          const data = res?.data?.map((obj:any)=>{
            return {
              ...obj,
              name: obj?.full_name
            }
          })
          this.employeesList = data
        }
      });
    }
  }

  getID(obj:any){
    if(!obj || obj?.length ==0 ){
      return
    }
    const ids = obj?.map(obj => obj.id) ?? []
    return ids
  }
  //#endregion Private methods
}