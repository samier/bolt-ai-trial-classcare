import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IncomeExpenseService } from '../income-expense.service';
import { ledgerType } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-ledger-list',
  templateUrl: './ledger-list.component.html',
  styleUrls: ['./ledger-list.component.scss']
})
export class LedgerListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addLedgerForm: FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any [] = [];
  ledgerTypeList: any [] = ledgerType;
  tableLoading: boolean = false;
  isSaveLoading: boolean = false;
  URLConstants = URLConstants;
  ledgerData: any;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private incomeExpenseService: IncomeExpenseService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private _fb : FormBuilder,
    private formValidationService: FormValidationService
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
  
  openModal(modalName: any, ledgerData?: any){
    ledgerData ? this.ledgerData = ledgerData : this.ledgerData = null;
    this.initForm();
    this.modalService.open(modalName, {
      centered: true,
      size: 'lg',
      windowClass: 'duplicate-modal-section add-ledger',
      backdrop: 'static',
      backdropClass: 'duplicate-modal-backdrop',
    })
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  saveLedger(){
    if(this.addLedgerForm.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.addLedgerForm);
      return this.toastr.showError("Please Fill all required fields.");
    }
    const payload = {
      ...this.addLedgerForm.value
    }
    this.isSaveLoading = true;
    this.incomeExpenseService.createOrUpdateLedger(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.closeModal();
        this.reloadData();
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
    });
  }

  deleteLedger(id: any){
    const conf = confirm("Are you sure you want to delete this ledger?");
    if(conf){
      this.incomeExpenseService.deleteLedger(id).subscribe((res: any) => {
        if(res?.status){
          this.toastr.showSuccess(res?.message);
          this.closeModal();
          this.reloadData();
        }else{
          this.toastr.showError(res?.message);
        }
      },
      (error: any) => {
        this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
      });
    }else{
      return;
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm(){
    this.addLedgerForm = this._fb.group({
      id: [this.ledgerData?.id ?? null],
      name: [this.ledgerData?.name ?? null, [Validators.required]],
      ledger_type: [this.ledgerData?.ledger_type ?? null, [Validators.required]],
    })
  }

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
        { data: 'created_at', name: 'created_at' },
        { data: 'name', name: 'name' },
        { data: 'ledger_type', name: 'ledger_type' },
        { data: 'total_amount', name: 'total_amount' },
        { data: 'action', orderable: false, searchable: false}
      ],
      order: [[0, 'desc']],
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    this.tableLoading = true;

    this.incomeExpenseService.getLedgerList(dataTablesParameter).subscribe((res: any) => {
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