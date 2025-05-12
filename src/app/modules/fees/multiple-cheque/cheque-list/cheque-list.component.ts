import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FeesService } from '../../fees.service';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-cheque-list',
  templateUrl: './cheque-list.component.html',
  styleUrls: ['./cheque-list.component.scss']
})
export class ChequeListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();  
  URLConstants = URLConstants;
  hasEdit = this.CommonService.hasPermission('finance_collect_cheque', 'has_edit');
  hasDelete = this.CommonService.hasPermission('finance_collect_cheque', 'has_delete');
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  boundHandleTableClick: any;
  chequeReportForm: FormGroup = new FormGroup({});
  isDownloading: boolean = false;
  format: any;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private feeService: FeesService,
    private formValidationService: FormValidationService,
    private toastr: Toastr,
    private router: Router,
    private modalService: NgbModal,
    private _fb: FormBuilder
  ) {
    this.boundHandleTableClick = this.handleTableClick.bind(this);
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundHandleTableClick);
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
  
  openChequeReportModal(modalName: any, format: any){
    this.modalService.open(modalName, {
      backdrop: 'static',
      centered: false,
      size: 'lg',
      windowClass: 'duplicate-modal-section latest-design-modal',
      backdropClass: 'duplicate-modal-backdrop'
    });
    this.format = format;
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  downloadChequeReport(format: any){
    this.formValidationService.getFormTouchedAndValidation(this.chequeReportForm);
    if(this.chequeReportForm?.invalid){
      return this.toastr.showError('Please select date');
    }

    this.isDownloading = true;
    this.feeService.downloadChequeReport(this.chequeReportForm?.value, format).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res: any) => {
        this.isDownloading = false;
        if(res?.status){
          this.toastr.showSuccess(res?.message);
          this.CommonService.downloadFile(res, 'cheque-report', format);
        } else {
          this.toastr.showError(res?.message);
        }
      },
      error: async (error: any) => {
        this.isDownloading = false;
        if(error?.error?.type == 'application/json') {
          const data = JSON.parse(await error?.error.text());
          if(!data.status){
            this.toastr.showError(data?.message);
          }
        }
      }
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
	
  initForm(){
    this.chequeReportForm = this._fb.group({
      cheque_date: [null, Validators.required]
    });
  }

  initDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      order: [[1, 'asc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { title: 'Section', data: 'section', name: 'section'},
        { title: 'Student', data: 'student', name: 'student'},
        { title: 'Cheques Collected', data: 'cheque_count', name: 'cheque_count'},
        ...this.hasEdit || this.hasDelete ? [{
          title: 'Action',
          orderable: false,
          searchable: false,
          render: (data, type, row) => {
            let actionButtons = '<div class="btn-group">';
            actionButtons += `<button class="btn action-view" data-id="${row.id}" data-toggle="tooltip" title="View"> 
                                <i class="fa fa-eye"></i> 
                              </button>`;
            if (this.hasEdit) {
              actionButtons += `<button class="btn action-edit" data-id="${row.id}" data-toggle="tooltip" title="Edit"> 
                                  <i class="fa fa-pencil-alt"></i> 
                                </button>`;
            }
            if (this.hasDelete) {
              actionButtons += `<button class="btn action-delete" data-id="${row.id}" data-toggle="tooltip" title="Delete"> 
                                  <i class="fa fa-trash-alt"></i> 
                                </button>`;
                              }
            actionButtons += '</div>';
            return actionButtons;
          }
        }] : []
      ] ,
      drawCallback: () => {
        this.bindActionEvents();
      },
      language: { 
        emptyTable: 'No data available', 
        zeroRecords: 'No matching records found'
      }
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.feeService.getChequeList(dataTablesParameters).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(callback){
        callback({
          recordsTotal: res?.recordsTotal,
          recordsFiltered: res?.recordsFiltered,
          data: res?.data,
        });
      }
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 200);
    },
    (error: any) => {
      this.toastr.showError('Error occurred while fetching data');
    });
  }

  bindActionEvents() {
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundHandleTableClick);
      table.addEventListener('click', this.boundHandleTableClick);
    }
    ($('[data-toggle="tooltip"]') as any).tooltip();
  }

  handleTableClick(event: any) {
    const target = event.target.closest('button');
    if (!target) return;
    const id = target.getAttribute('data-id');
    ($('[data-toggle="tooltip"]') as any).tooltip('dispose');
    if (target.classList.contains('action-edit')) {
      this.router.navigate([this.CommonService.setUrl(URLConstants.COLLECT_CHEQUE),id])
    } else if (target.classList.contains('action-delete')) {
      this.deleteCheque(id);
    } else if (target.classList.contains('action-view')) {
      this.viewChequeDetails(id)
    }
  }

  viewChequeDetails(id: any) {
    let queryParams : NavigationExtras = {
      queryParams: {
        isDefaultTemplate: 'view'
      }
    }
    this.router.navigate([this.CommonService.setUrl(URLConstants.COLLECT_CHEQUE),id],queryParams)
  }

  deleteCheque(id: any) {
    if (confirm('Are you sure you want to delete this cheque?')) {
      this.feeService.deleteChequeDetails(id).pipe(takeUntil(this.$destroy)).subscribe({
        next: (res: any) => {
          if (res?.status) {
            this.toastr.showSuccess(res?.message);
            this.reloadTable();
          } else {
            this.toastr.showError(res?.message);
          }
        },
        error: (err: any) => {
          this.toastr.showError(err?.error?.message);
        }
      });
    }
  }
  
  reloadTable() { 
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Private methods
}