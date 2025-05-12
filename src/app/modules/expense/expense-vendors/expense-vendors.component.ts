import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { data } from 'jquery';
@Component({
  selector: 'app-expense-vendors',
  templateUrl: './expense-vendors.component.html',
  styleUrls: ['./expense-vendors.component.scss']
})
export class ExpenseVendorsComponent implements OnInit {

  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any;
  search:any = {
    categoryName: '',
    amount: '',
  };
  isResetloading : boolean = false;
  vendorsFilterForm : FormGroup = new FormGroup({});;
  vendorsList: any = [];
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
    this.getVendorsList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  clearAll(){
    this.isResetloading = true
    this.vendorsFilterForm.reset();
    this.reloadData();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  getVendorsList(){
    this.expenseService.getVendorsList(null).subscribe(
      (res:any) => {
        if(res){
          this.vendorsList = res?.data.map(item => {
            return {
            id: item.id,  
            name: item.vendorName
            }
          });
        }
      }
    )
  }

  initForm() {
    this.vendorsFilterForm = this._fb.group({
      vendor: [],
      date: []
    })

    this.vendorsFilterForm?.get('date')?.valueChanges?.pipe(distinctUntilChanged(),takeUntil(this.$destroy))?.subscribe((res:any)=>{
      if (!this.isResetloading) {
        this.reloadData();
      }
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
      order: [[2,'desc']],
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          date: {
            start_date: that.formatDate(that.vendorsFilterForm?.value?.date?.startDate),
            end_date: that.formatDate(that.vendorsFilterForm?.value?.date?.endDate)
          },
          vendor   : that.vendorsFilterForm?.value?.vendor
        })
        localStorage.setItem('DataTables_Expense/Vendors', JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_Expense/Vendors')
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
        {data: 'vendorName', name: 'vendorName'},
        {data: 'amount', name : 'amount'},
        {data: 'category', name : 'categories'}
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any){
    const payload = {
      ...dataTablesParameters,
      end_date: this.formatDate(this.vendorsFilterForm?.value?.date?.endDate),
      start_date: this.formatDate(this.vendorsFilterForm?.value?.date?.startDate),
      id: this.vendorsFilterForm?.value?.vendor ?? '',
    };
    this.expenseService.getVendorsList(Object.assign(payload)).subscribe(
      (res: any) => {
        this.isResetloading = false;
        this.tbody = res?.data;
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
        this.isResetloading = false;
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    )
  }

  setFormState(state) {
    this.vendorsFilterForm.controls['vendor'].patchValue(state?.vendor || null )
    this.vendorsFilterForm.controls['date'].patchValue(
      state?.date?.start_date && state?.date?.end_date 
      ? { startDate: state.date.start_date, endDate: state.date.end_date } 
      : null
    );
  }

  formatDate(date: any): string | null {
    return date ? new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000).toISOString().split('T')[0] : null;
  }
  //#endregion Private methods
}