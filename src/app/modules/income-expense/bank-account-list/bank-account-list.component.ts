import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { IncomeExpenseService } from '../income-expense.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.scss']
})
export class BankAccountListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any [] = [];
  tableLoading: boolean = false;
  URLConstants = URLConstants
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private incomeExpenseService: IncomeExpenseService,
    private toastr: Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initDataTable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  delete(id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(confirm){
      this.incomeExpenseService.deleteBankAccountDetails(id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message);
        }else{
          this.toastr.showError(resp.message);
        }resp
        this.reloadData();
      })
    }
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100 ,200],
      serverSide: true,
      searching: true,
  
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
  
      columns: [
        { data: 'name', name: 'name' },
        { data: 'account_holder_name', name: 'account_holder_name'},
        { data: 'account_for', name: 'account_for'},
        { data: 'account_number', name: 'account_number'},
        { data: 'ifsc_code', name: 'ifsc_code'},
        { data: 'account_type', name: 'account_type'},
        { data: 'branch_address', name: 'branch_address'},
        { data: 'action', orderable: false, searchable: false},
      ]
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    this.tableLoading = true;

    this.incomeExpenseService.getBankAccountList(dataTablesParameter).subscribe((res: any) => {
      this.tableLoading = false;
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
    },
    (error: any) => {
      this.tableLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Private methods
}