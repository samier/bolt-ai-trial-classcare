import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IncomeExpenseService } from '../income-expense.service';
import { amountType, incomeExpenseStatus, incomeSource } from 'src/app/common-config/static-value';
@Component({
  selector: 'app-income-list',
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.scss']
})
export class IncomeListComponent {
  //#region Public | Private Variables
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  closeResult: any = "";
  requisition_modal_data: any;
  reasonForRejection: any = '';
  incomeSourceList: any = incomeSource
  headList: any = [];
  paymentModes: any = [];
  amountType: any = amountType;
  incomeExpenseStatus: any = incomeExpenseStatus;
  URLConstants = URLConstants;
  attachment: any = null

  filter: any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private modalService: NgbModal,
    public CommonService: CommonService,
    public dateFormateService: DateFormatService,
    private toastr: Toastr,
    private formBuilder: FormBuilder,
    private incomeExpenseService: IncomeExpenseService,
  ) {
  }
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------


  ngOnInit(): void {
    this.initForm();
    this.getHadList();
    this.getPaymentModes();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'created_at' },
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'income_date' },
        { data: 'income_source' },
        { data: 'name' },
        { data: 'head_id', name: 'head.name' },
        { data: 'receipt_no' },
        { data: 'amount' },
        { data: 'payment_mode_id', name: 'payment_mode.name' },
        { data: 'tax_id', name: 'tax.name' },
        { data: 'total_amount' },
        { data: 'action', orderable: false, searchable: false }
      ],
      order: [[0, 'desc']],
    };
  }


  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getPaymentModes() {
    this.incomeExpenseService.getPaymentModes().subscribe((resp: any) => {
      this.paymentModes = resp.data;
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  getHadList() {
    this.incomeExpenseService.getHeadList('income').subscribe((res: any) => {
      this.headList = res.data;
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  delete(id: number) {
    let confirm = window.confirm("Are you sure, You want to delete it ?");
    if (confirm) {
      this.incomeExpenseService.deleteIncome(id).subscribe((res: any) => {
        if (res.status) {
          this.toastr.showSuccess(res.message);
        } else {
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
  }

  copyRecord(item: any) {
    let confirm = window.confirm("Are you sure, You want to copy it ?");
    if (confirm) {
      this.incomeExpenseService.copyIncome(item.id).subscribe((res: any) => {
        if (res.status) {
          this.toastr.showSuccess(res.message);
        } else {
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
  }

  deleteAttachment(id: any) {
    let confirm = window.confirm("Are you sure, You want to delete this attachment ?");
    if (confirm) {
      this.incomeExpenseService.deleteIncomeAttachment(id).subscribe((res: any) => {
        if (res.status) {
          this.toastr.showSuccess(res.message);
          this.attachment = {
            id: null,
            attachment_url: null,
            attachment_name: null
          }
          this.reloadData();
        } else {
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });
    }
  }


  openAttachment(content: any, row: any) {
    this.attachment = {
      id: row.id,
      attachment_url: row.attachment_url,
      attachment_name: row.attachment
    }
    this.modalService.open(content, {
      size: 'lg',
      centered: true
    }).result.then((result) => {
    }, (reason: any) => {
    });
  }

  getFileType(url: string): string {
    return this.CommonService.getFileType(url)
  }


  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if ((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status') {
        this.filterCount++;
      }
    })
    if (this.filterForm.value?.income_date && this.filterForm.value?.income_date?.startDate == null) {
      this.filterCount--;
    }
  }

  clearAll() {
    this.filterForm.reset();
    this.filterForm.controls['amount_type'].setValue('=');
    this.countFilters()
    this.reloadData();
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.filterForm = this.formBuilder.group({
      income_date: [],
      income_source: [],
      head_id: [],
      amount: [],
      amount_type: ['='],
      payment_mode_id: [],
      draft: [false],
      copied: [false],
    });
    this.countFilters()
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = { ...dataTablesParameters, ...this.filterForm.value }
    this.incomeExpenseService.incomeIndex(dataTablesParameters).subscribe((resp: any) => {
      this.tbody = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 100);

    });
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Private methods


}
