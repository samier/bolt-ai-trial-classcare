import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../user.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';

@Component({
  selector: 'app-attendance-machine-report',
  templateUrl: './attendance-machine-report.component.html',
  styleUrls: ['./attendance-machine-report.component.scss']
})
export class AttendanceMachineReportComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  attendanceMachineReportF : FormGroup = new FormGroup({});
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  isTableInitialized : boolean = false;
  isShowLoading : boolean = false;
  indexStart: any = 1;
  rolesList: any [] = [];
  tbody: any;
  userList: any [] = [];
  isOpenByClick: boolean = true

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private userService: UserService,
    private _fb : FormBuilder,
    private toastr: Toastr,
    public dateFormateService: DateFormatService,
    private _homeworkService : HomeworkService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getRolesList();
    const dateControl = this.attendanceMachineReportF.get('date');
    if(dateControl){
      dateControl.valueChanges.subscribe((value: any) => {
        const isDateInvalid = !value.startDate && !value.endDate;
        dateControl.setErrors(isDateInvalid ? { required: true } : null);
      })
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
  
  downloadMachineAttendanceReport(format: any){
    this.attendanceMachineReportF?.markAllAsTouched();
    if(this.attendanceMachineReportF.invalid){
      return this.toastr.showError("Please Select Required Fields")
    }
    const startDate = this.attendanceMachineReportF?.value?.date?.startDate ?? null;
    const endDate = this.attendanceMachineReportF?.value?.date?.endDate ?? null;
    const payload = {
      role_id: this.attendanceMachineReportF.value?.role_id?.length > 0 ? this.attendanceMachineReportF.value?.role_id.map(ele => ele.id) : [],
      user_id: this.attendanceMachineReportF.value?.user_id?.length > 0 ? this.attendanceMachineReportF.value?.user_id.map(ele => ele.id) : [],
      start_date: startDate?.format('YYYY-MM-DD'),
      end_date: endDate?.format('YYYY-MM-DD'),
      is_late: this.attendanceMachineReportF.value?.is_late ? 1 : 0,
      format: format
    }
    this.userService.getPdfExcelMachineReport(payload).subscribe((res: any) => {
      if(res?.status){
        // this.toastr.showInfo("Downloading Your File", "Please Wait");
        this.CommonService.downloadFile( res, 'attendance-machine-report',format);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.errors?.message)
    })
  }

  onSubmit(){
    this.attendanceMachineReportF?.markAllAsTouched();
    if(this.attendanceMachineReportF?.invalid){
      return;
    }
    if(this.isTableInitialized){
      this.isShowLoading = true;
      this.reloadData();
    }else{
      this.isTableInitialized = true;
      this.isShowLoading = true;
      this.initDataTable();
    }
  }

  getUserList() {
    this.userList = []  
    this.attendanceMachineReportF.controls['user_id'].reset();  
    const payload = {
      role_id: this.attendanceMachineReportF.value?.role_id.length > 0 ? this.attendanceMachineReportF.value?.role_id.map(ele => ele.id) : [],
    }
    this._homeworkService.getEmployeeList(payload).pipe(takeUntil(this.$destroy)).subscribe((resp: any) => {
      if (resp.status) {
        this.userList = resp.data.map((ele: any) => {
          return {
            id: ele.id,
            name: ele.full_name
          }
        });
      } else {
        this.toastr.showError(resp.message)
      }
    }, (error) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occurred');
    })
  }

  clearData() {
    this.attendanceMachineReportF.reset();
    this.tbody = [];
    this.userList = [];
    this.isTableInitialized = false;
    this.attendanceMachineReportF.controls['role_id'].markAsPristine();
    this.attendanceMachineReportF.controls['role_id'].markAsUntouched();
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.attendanceMachineReportF = this._fb.group({
      role_id: [null, [Validators.required]],
      date: [null, [Validators.required]],
      user_id : [null],
      is_late : [false]
    })
  }

  getRolesList(){
    this.userService.getRoleList().subscribe((res: any) => {
      if(res?.status){
        this.rolesList = res?.data;
      }
    })
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },

      columns: [
        { data: '', orderable: false, searchable: false },
        { data: 'user.full_name', name:'user.first_name'},
        { data: 'attendanceDate'},
        { data: 'action', orderable: false, searchable: false }
      ]
    }
  }

  loadData(dataTablesParameters?: any, callback?: any) : void {
    const startDate = this.attendanceMachineReportF?.value?.date?.startDate ?? null;
    const endDate = this.attendanceMachineReportF?.value?.date?.endDate ?? null;
    const payload = {
      ...dataTablesParameters,
      role_id: this.attendanceMachineReportF.value?.role_id?.length > 0 ? this.attendanceMachineReportF.value?.role_id.map(ele => ele.id) : [],
      user_id: this.attendanceMachineReportF.value?.user_id?.length > 0 ? this.attendanceMachineReportF.value?.user_id.map(ele => ele.id) : [],
      is_late: this.attendanceMachineReportF.value?.is_late ? 1 : 0,
      start_date: startDate?.format('YYYY-MM-DD'),
      end_date: endDate?.format('YYYY-MM-DD'),
    }
    this.userService.getAttendanceMachineReport(payload).subscribe((res: any) => {
      this.isShowLoading = false;
      this.tbody = res?.data?.original?.data;
      this.indexStart =  (dataTablesParameters.start / dataTablesParameters.length) * dataTablesParameters.length
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
    (error: any) => {
      this.isShowLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occurred');
    })
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
	
  //#endregion Private methods
}