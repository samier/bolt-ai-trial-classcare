import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DataTableDirective } from 'angular-datatables';
import { AttendanceManagementService } from '../attendance-management.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { HomeworkService } from '../../homework/homework.service';
import moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-batch-wise-attendance-list',
  templateUrl: './batch-wise-attendance-list.component.html',
  styleUrls: ['./batch-wise-attendance-list.component.scss']
})
export class BatchWiseAttendanceListComponent implements OnInit {
  //#region Public | Private Variables

  dtOption: DataTables.Settings = {}
  $destroy: Subject<void> = new Subject<void>();
  batchAttendanceForm : FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any;
  sectionsList: any = [];
  classesList: any = [];
  search:any = {
    batch_name : '',
    class_name : '',
    attendance_status : ''
  };
  filter:boolean = false;
  isShowLoading : boolean = false;
  branch_id: any = window.localStorage.getItem('branch');
  todaysDate: any = new Date();
  user_id: any = window.localStorage.getItem('user_id');
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private _fb : FormBuilder,
    public CommonService : CommonService,
    public homeworkService: HomeworkService,
    public AttendanceManagementService : AttendanceManagementService,
    private toastr: Toastr,
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
    this.getSectionList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onShowClick(){
    this.isShowLoading = true;
    this.reloadData();
  }

  onSectionChange(){
    this.batchAttendanceForm?.controls['classId'].patchValue(null);
    this.classesList = [];
    this.getClassList();
  }

  reset(){
    this.batchAttendanceForm?.reset();
    this.batchAttendanceForm?.markAllAsTouched();
    this.classesList = [];
    this.batchAttendanceForm?.controls['date'].patchValue(this.todaysDate);
    this.getSectionList();
    this.reloadData();
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.batchAttendanceForm = this._fb.group({
      sectionId: [null],
      classId: [null],
      date: [this.todaysDate]
    })
  }

  initDataTable() {
    this.dtOption = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [50, 100, 200],
        ['Show 50 entries', 'Show 100 entries', 'Show 200 entries']
      ],
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      order: [[0, 'asc']],

      lengthChange: true,
      stateSave: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'class_name', name: 'class_name' },
        { data: 'batch_name', name: 'batch_name' },
        { data: 'attendance', name: 'attendance_status', orderable: false },
      ]
    }
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    Object.keys(this.search).forEach((column: any) => {
      const columnIndex = dataTablesParameters.columns.findIndex((dtColumn: any) => dtColumn.data === column);
      if (columnIndex !== -1) {
        dataTablesParameters.columns[columnIndex].search.value = this.search[column];
      }
    });
    const date  = this.batchAttendanceForm?.value?.date ?? new Date();
    const section = this.batchAttendanceForm?.value?.sectionId ? [this.batchAttendanceForm?.value?.sectionId] : [];
    const classes = this.batchAttendanceForm?.value?.classId ? [this.batchAttendanceForm?.value?.classId] : []
    const payload = {
      ...dataTablesParameters,
      startDate: moment(date).format('DD-MM-YYYY'),
      section_id : section,
      class_id : classes
    };
    this.AttendanceManagementService.getBatchWiseAttendance(Object.assign(dataTablesParameters, payload)).subscribe((resp: any) => {
      this.isShowLoading = false
      this.tbody = resp?.data
      callback({
        recordsTotal: resp?.recordsTotal,
        recordsFiltered: resp?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);

    }, (error: any) => {
      this.isShowLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message)
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getSectionList(){
    this.homeworkService.getSectionList({ branch: this.branch_id }).subscribe((res: any) => {
        if(res.status){
          this.sectionsList = [{ id: '', name: 'All Section' }].concat(res?.data)
          this.batchAttendanceForm.controls['sectionId'].patchValue(null);
          this.getClassList();
        }
      })
  }

  getClassList(){
    const payload = {
      section_id: this.batchAttendanceForm?.value?.sectionId ?? null,
      user_id: this.user_id ?? null,
    }
    this.homeworkService.getClass(payload, 0).subscribe((res: any) => {
      if(res.status){
        // this.classesList = res?.data
        if(res?.data?.length > 0){
          this.classesList = [{ id: '', name: 'All Class' }].concat(res?.data)
        }
        this.batchAttendanceForm.controls['classId'].patchValue(null);
      }
    })    
  }

  //#endregion Private methods
}