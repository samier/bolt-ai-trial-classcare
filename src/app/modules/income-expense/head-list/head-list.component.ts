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
import { HeadModalComponent } from '../head-modal/head-modal.component';

@Component({
  selector: 'app-head-list',
  templateUrl: './head-list.component.html',
  styleUrls: ['./head-list.component.scss']
})
export class HeadListComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  addHeadForm: FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody: any[] = [];
  ledgerList: any[] = [];
  filteredLedgerList: any[] = [];
  tableLoading: boolean = false;
  isSaveLoading: boolean = false;
  URLConstants = URLConstants;
  headData: any;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private incomeExpenseService: IncomeExpenseService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private _fb: FormBuilder,
    private formValidationService: FormValidationService
  ) { }

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

  async openModal(headData?: any) {
    headData ? this.headData = headData : this.headData = null;
    const modalRef = this.modalService.open(HeadModalComponent, {
      // centered: true,
      backdrop: 'static',
      size: 'lg',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });

    // Pass data to the modal component
    modalRef.componentInstance.headData = this.headData;

    await modalRef.result.then((response: any) => {
      if (response.data) {
        this.reloadData();
      }
    })

  }

  closeModal() {
    this.modalService.dismissAll();
  }

  deleteHead(id: any) {
    const conf = confirm("Are you sure you want to delete this head?");
    if (conf) {
      this.incomeExpenseService.deleteHead(id).subscribe((res: any) => {
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
          this.closeModal();
          this.reloadData();
        } else {
          this.toastr.showError(res?.message);
        }
      },
        (error: any) => {
          this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
        });
    } else {
      return;
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.addHeadForm = this._fb.group({
      id: [this.headData?.id ?? null],
      name: [this.headData?.name ?? null, [Validators.required]],
      account_type: [this.headData?.ledger?.ledger_type ?? 'income'],
      ledger_id: [this.headData?.ledger_id ?? null, [Validators.required]],
      opening_balance: [this.headData?.opening_balance ?? null],
    })
    console.log(this.addHeadForm);

  }

  initDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      searching: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },

      columns: [
        { data: 'created_at', name: 'created_at' },
        { data: 'name', name: 'name' },
        { data: 'ledger', name: 'ledger.name' },
        { data: 'ledger_type', name: 'ledger.ledger_type' },
        { data: 'opening_balance', name: 'opening_balance' },
        { data: 'total_amount', name: 'total_amount' },
        { data: 'action', orderable: false, searchable: false }
      ],
      order: [[0, 'desc']],
    }
  }

  loadData(dataTablesParameter: any, callback: any): void {
    this.tableLoading = true;

    this.incomeExpenseService.indexHead(dataTablesParameter).subscribe((res: any) => {
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

  handleAccountTypeChange(state?: any) {
    let account_type = this.addHeadForm.value.account_type
    this.filteredLedgerList = this.ledgerList.filter((el: any) => {
      return el.ledger_type == account_type
    })
    if (state == 'change') {
      this.addHeadForm.controls['ledger_id'].setValue(null)
    }
  }

  getLedgerList() {
    this.incomeExpenseService.ledgerList().subscribe((res: any) => {
      if (res?.status) {
        this.ledgerList = res?.data;
        this.handleAccountTypeChange();
      }
    })
  }

  //#endregion Private methods
}
