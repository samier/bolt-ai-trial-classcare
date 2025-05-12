import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { debounceTime, Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any;
  search:any = {
    expenseDate : '',
    expense_category_name : '',
    expenseDescription : '',
    expenseAmount : '',
    payment_mode : '',
    note : ''
  };
  selectedExpenseIds: Set<number> = new Set();
  filterCount: any = 0;
  allChecked:boolean = false;
  isPdfLoading: boolean = false;
  isResetDisabled: boolean = false;
  isResetloading : boolean = false;
  isShowLoading : boolean = false;
  expenseFilterForm : FormGroup = new FormGroup({});
  expenseCategoriesList: any = [];
  paymentModeList: any = [];

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      public commonService: CommonService,
      private _fb : FormBuilder,
      private expenseService: ExpenseService,
      public activatedRouteService: ActivatedRoute,
      private toaster:Toastr,
      public datePipe: DatePipe
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.getexpenseCategoriesList();
    this.getPaymentModes();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  getExpenseReport(){
    const expenseCategoryIds = this.getID(this.expenseFilterForm.value.expense_category);
    const paymentModeIds = this.getID(this.expenseFilterForm.value.payment_mode);
    this.isPdfLoading = true;
    const payload = {
      expense_category: expenseCategoryIds ?? '',
      payment_mode: paymentModeIds ?? '',
      end_date: this.formatDate(this.expenseFilterForm?.value?.date?.endDate) ?? '',
      start_date: this.formatDate(this.expenseFilterForm?.value?.date?.startDate) ?? ''
    };
    const format = 'pdf';
    this.toaster.showInfo("Please Wait!", "Downloading your file!");
    this.expenseService.getExpenseReport(payload).subscribe(
      (res: any) => {
        this.isPdfLoading = false;
        this.commonService.downloadFile(res, 'expense-report', format);
      },
      (error)=> {
        this.isPdfLoading = false;
        this.toaster.showError(error?.error?.message ?? error?.message);
      });
  }
  
  deleteExpense(id: any){
    const conf = confirm("Are you sure you want to delete this expense?");
    if(conf){
      this.expenseService.deleteExpense(id).subscribe((res: any) => {
        if(res.status){
          this.reloadData();
          this.toaster.showSuccess(res?.message);
        }else{
          this.toaster.showError(res?.message);
        }
      }, (error)=> {
        this.toaster.showError(error?.error?.message ?? error?.message)
      });
    }
  }

  clearAll(){
    this.isResetloading = true
    this.expenseFilterForm.reset();
    this.reloadData();
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.expenseFilterForm = this._fb.group({
      expense_category: [],
      payment_mode: [],
      date: []
    })
  }

  initDatatable(){
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      order: [[1,'desc']],
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          expense_category : that.expenseFilterForm?.value.expense_category ,
          payment_mode   : that.expenseFilterForm?.value.payment_mode ,
          date: {
            start_date: that.formatDate(that.expenseFilterForm?.value?.date?.startDate),
            end_date: that.formatDate(that.expenseFilterForm?.value?.date?.endDate)
          }
        })
        localStorage.setItem('DataTables_' + URLConstants.EXPENSE_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.EXPENSE_LIST)
          let dataTableState = JSON.parse(state)
          that.setFormState(dataTableState)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        {data: null , orderable: false, searchable: false},
        {data: 'expenseDate', name: 'expenseDate'},
        {data: 'expense_category_name', name: 'expense_category_name'},
        {data: 'expenseDescription', name : 'expenseDescription'},
        {data: 'expenseAmount', name : 'expenseAmount'},
        {data: 'payment_mode', name : 'payment_mode.mode'},
        {data: 'note', name : 'note'},
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }
  
  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    const expenseCategoryIds = this.getID(this.expenseFilterForm.value.expense_category);
    const paymentModeIds = this.getID(this.expenseFilterForm.value.payment_mode);
    Object.keys(this.search).forEach((column:any) => {
      dataTablesParameters.columns.find((dtcolumn:any) => dtcolumn.data == column).search.value = this.search[column];
    });
    const payload = {
      ...dataTablesParameters,
      expense_category: expenseCategoryIds,
      payment_mode: paymentModeIds ?? '',
      end_date: this.formatDate(this.expenseFilterForm?.value?.date?.endDate),
      start_date: this.formatDate(this.expenseFilterForm?.value?.date?.startDate)
    };
    this.expenseService.getExpenseList(Object.assign(payload)).subscribe(
      (res: any) => {
        this.isResetloading = false
        this.isShowLoading = false;
        this.tbody = res?.data;
        this.allChecked = false;
        this.selectedExpenseIds.clear();
        callback({
          recordsTotal: res?.recordsTotal,
          recordsFiltered: res?.recordsFiltered,
          data: []
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      },(error)=> {
        this.isResetloading = false
        this.isShowLoading = false;
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    )
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.expenseFilterForm.value).forEach((item:any)=>{
      if((this.expenseFilterForm.value[item] != '' && this.expenseFilterForm.value[item] != null)){
        this.filterCount++;
      }
    })
    if(this.expenseFilterForm.value?.date && this.expenseFilterForm.value?.date?.startDate == null){
      this.filterCount--;
    }
  }

  getID(data:any){
    if(data == null || data?.length == 0){
      return []
    }
    return data.map(item =>item.id)
  }

  setFormState(state) {
    this.expenseFilterForm.controls['expense_category'].patchValue(state?.expense_category || null);
    this.expenseFilterForm.controls['payment_mode'].patchValue(state?.payment_mode || null);
    this.expenseFilterForm.controls['date'].patchValue(
      state?.date?.start_date && state?.date?.end_date 
      ? { startDate: state.date.start_date, endDate: state.date.end_date } 
      : null
    );
  }
	
  formatDate(date: any): string | null {
    return date ? new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000).toISOString().split('T')[0] : null;
  }

  getexpenseCategoriesList() {
    this.expenseService.getCategoryList(null).subscribe((res: any) => {
      if (res?.data) {
        const categories = res?.data.map(item => ({
          id: item.id,  
          name: item.categoryName
        }));
        this.expenseCategoriesList = categories;
      }
    });
  }

  getPaymentModes(){
    this.expenseService.getPaymentModes().subscribe(
      (res:any) => {
        if(res?.status){
          const paymentModes = res?.data?.payment_mode.map(item => ({
            id: item.id,  
            name: item.mode
          }));
          this.paymentModeList = paymentModes;
        }
      }
    )
  }
  //#endregion Private methods
}
