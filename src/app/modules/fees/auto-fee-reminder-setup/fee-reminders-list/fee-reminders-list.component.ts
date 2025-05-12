import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesService } from '../../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { studentStatusFeeReminder } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-fee-reminders-list',
  templateUrl: './fee-reminders-list.component.html',
  styleUrls: ['./fee-reminders-list.component.scss']
})
export class FeeRemindersListComponent implements OnInit {
  //#region Public | Private Variables
  
  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
  reminderFilterForm : FormGroup = new FormGroup({});
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  filter: boolean = true;
  isShowLoading: boolean = false;
  isResetLoading: boolean = false;
  isTableLoading: boolean = false;
  tbody: any [] = [];
  feeCategoryList: any;
  indexStart: any = 1;
  filterCount: any = 0;
  studentAndReminderStatus = studentStatusFeeReminder

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private feeService: FeesService,
    private toastr: Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getFeeCategoryList();
    this.initDatatable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  onShow(){
    this.isShowLoading = true;
    this.reloadData();
  }

  onReset(){
    this.isResetLoading = true;
    this.reminderFilterForm.reset();
    this.reloadData();
  }

  onDelete(id: any){
    const c = confirm('Are you sure you want to delete this Reminder Setup?');
    if (c) {
      this.feeService.deleteAutoFeeReminder(id).subscribe((res: any) => {
        if(res?.status){
          this.toastr.showSuccess(res?.message);
          this.reloadData();
        }else{
          this.toastr.showError(res?.message);
        }
      },
      (error: any) => {
        this.toastr.showError(error?.error?.message ?? error?.message ?? 'Something Went Wrong')
      })
    }else{
      return;
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.reminderFilterForm = this._fb.group({
      student_status: [null],
      status: [null],
      fee_category: [null]
    })
  }

  initDatatable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true, 
      searching: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        {data: null, orderable: false, searchable: false },
        {data: 'title'},
        {data: 'student_status'},
        {data: 'fees_category'},
        {data: 'fees_reminder_method'},
        {data: 'status'},
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.conutFilters();
    const payload = {
      ...dataTablesParameters,
      status: this.CommonService.getID(this.reminderFilterForm?.value?.status),
      student_status: this.CommonService.getID(this.reminderFilterForm?.value?.student_status),
      fee_category: this.CommonService.getID(this.reminderFilterForm?.value?.fee_category)
    }
    this.isTableLoading = true;
    this.feeService.getAutoFeeReminderList(payload).subscribe(
      (res: any) => {
        this.isTableLoading = false;
        this.isShowLoading = false;
        this.isResetLoading = false
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
      },(error)=> {
        this.isTableLoading = false;
        this.isShowLoading = false;
        this.isResetLoading = false
        this.toastr.showError(error?.error?.message ?? error?.message);
      }
    )
  }

  conutFilters(){
    this.filterCount = 0;
    const filter = this.reminderFilterForm?.value;
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

  reloadData(){
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getFeeCategoryList(){
    this.feeService.getFeesCategoryList({}).subscribe((res: any) => {
      if(res){
        this.feeCategoryList = res?.data?.map(item => {
          return {
            id: item?.id,
            name: item?.type_name
          }
        });
      }
    })
  }
	
  //#endregion Private methods
}