import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormBuilderService } from '../form-builder.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InquiryCustomFormViewModelComponent } from '../inquiry-custom-form-view-model/inquiry-custom-form-view-model.component';
import { Router } from '@angular/router';
import moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inquiry-custom-form-list',
  templateUrl: './inquiry-custom-form-list.component.html',
  styleUrls: ['./inquiry-custom-form-list.component.scss'],
})
export class InquiryCustomFormListComponent implements OnInit {

  //#region Public | Private Variables
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants
  dtOptionsForInquiryForm: DataTables.Settings = {};
  datatableInquiryForm: DataTableDirective | null = null;
  inquiryFormData: any = []
  isInquiryFormLoading:boolean = false 
  boundHandleTableClick: any;
  boundHandleStatusChange: any;
  
  isOpenByClick: boolean = true
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _toaster : Toastr,
    private _formBuilderService : FormBuilderService,
    private _modalService : NgbModal,
    private _router: Router,
    private _dateFormteService: DateFormatService,
    private datePipe: DatePipe
  ) {
    this.boundHandleTableClick = this.handleTableClick.bind(this);
    this.boundHandleStatusChange = this.handleStatusChange.bind(this);
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.isInquiryFormLoading = true
    this.defineDtoptionForInquiryForm()
    // this.viewForm(1)

    // Cleanup event listeners on component destroy
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
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  defineDtoptionForInquiryForm() {
    const that = this
    this.dtOptionsForInquiryForm = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      order: [[5, 'asc']],
      language: {
        info: '',
        zeroRecords: 'No records found!'
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForInquiryForm(dataTablesParameters, callback);
      },
      columns: [
        { title: 'Sr no.', render: (data, type, row, meta) => meta.row + 1, orderable: false, searchable: false, },
        { title: 'Form Name', data: 'form_name' },
        {
          title: 'Branches', data: 'branches', orderable: false, searchable: false, render: (data, type, row) => {
            return `<span title="${data}" data-toggle="tooltip">${data}</span>`;
          }
        },
        {
          title: 'Section', data: 'sections', defaultContent: '-', render: (data, type, row) => {
            return `<span title="${data}" data-toggle="tooltip">${data}</span>`;
          }
        },
        { title: 'Total Submission', data: 'total_submit', defaultContent: '0' },
        { title: 'Branch Wise Count', data: 'branch_wise_inquiry_count', defaultContent: '0', orderable: false, searchable: false, },
        { title: 'Status', data: 'status', orderable: false, searchable: false, render: (data, type, row) => {
          return `
          <div class="form-check form-switch custom-check-exam latest-custom-checkbox">
          <input class="form-check-input toggle-status" type="checkbox" 
          data-id="${row.id}" ${Number(data) ? 'checked' : ''} role="switch">
          </div>
          `;
        } },
        {
          title: 'Created', data: 'created_at', defaultContent: '-',
          "render": function (data) {
            return that.datePipe.transform(data, that._dateFormteService.getDateTimeFormat())
          }
        },
        { title: 'Created By', data: 'full_name', defaultContent: '-' },
        {
          title: 'Action',
          orderable: false,
          searchable: false,
          className:'action-btn-sticky',
          render: (data, type, row) => {
            let actionButtons = '<div class="btn-group">';
        
            // Check permissions before rendering buttons
            if (this.CommonService.hasPermission('inquiry_form_builder', 'has_edit')) {
              actionButtons += `<button class="lt-btn-icon action-edit" data-id="${row.id}" ngbTooltip="Edit"> 
                                   
                                </button>`;
            }
        
            if (this.CommonService.hasPermission('inquiry_form_builder', 'has_delete')) {
              actionButtons += `<button class="lt-btn-icon action-delete" data-id="${row.id}" ngbTooltip="Delete"> 
                                   
                                </button>`;
            }
        
            if (this.CommonService.hasPermission('inquiry_form_builder', 'has_access')) {
              actionButtons += `<button class="lt-btn-icon action-view" data-id="${row.form_unique_id}" ngbTooltip="View"> 
                                   
                                </button>`;
            }
        
            actionButtons += '</div>';
            return actionButtons;
          }
        }
      ],
      drawCallback: () => {
        this.bindActionEvents();
      }
    };
  }

  bindActionEvents() {
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundHandleTableClick);
      table.addEventListener('click', this.boundHandleTableClick);

       // Handle checkbox change
    table.querySelectorAll('.toggle-status').forEach((checkbox) => {
      checkbox.removeEventListener('change', this.handleStatusChange);
      checkbox.addEventListener('change', this.handleStatusChange.bind(this));
    });
    }
    ($('[data-toggle="tooltip"]') as any).tooltip();
  }

  handleTableClick(event: any) {
    const target = event.target.closest('button');
    if (!target) return;

    const id = target.getAttribute('data-id');
    if (target.classList.contains('action-edit')) {
      this.editForm(Number(id));
    } else if (target.classList.contains('action-delete')) {
      this.deleteForm(Number(id));
    } else if (target.classList.contains('action-view')) {
      this.viewForm(id)
    }
  }

  handleStatusChange(event: any) {
    const checkbox = event.target;
    const id = Number(checkbox.getAttribute('data-id'));
    const newStatus = checkbox.checked;
    const payload = {
      form_status: newStatus ? 1 : 0,
      form_builder_id : id
    }

    this._formBuilderService.updateFormStatus(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this._toaster.showSuccess(res.message);
      } else {
        this._toaster.showError(res.message);
        checkbox.checked = !newStatus; // Revert checkbox if update fails
      }
    }, (error) => {
      this._toaster.showError(error?.error?.message ?? error?.message);
      checkbox.checked = !newStatus; // Revert checkbox if error occurs
    });
  }

  editForm(id: number) {
    this._router.navigate([this.CommonService.setUrl(URLConstants.FORM_BUILDER_INQUIRY_EDIT),id])
  }

  deleteForm(id: number) {
    if (confirm('Are you sure you want to delete this form?')) {
      this._formBuilderService.deleteInquiryForm(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this._toaster.showSuccess(res.message);
          this.reloadData()
        } else {
          this._toaster.showError(res.message);
        }
      }, (error) => {
        this._toaster.showError(error?.error?.message ?? error?.message);
      })
    }
  }

  viewForm(id: number) {
    const modalRef = this._modalService.open(InquiryCustomFormViewModelComponent,{
      size: 'xl',
      // centered: true,
      // backdrop: 'static',
      windowClass: 'latest-design-modal' // duplicate-modal-section ,
      // backdropClass: 'duplicate-modal-backdrop'
    });

    // Pass data to the modal component
    modalRef.componentInstance.inquiryFormId = id;
  }

  loadDataForInquiryForm(dataTablesParameters?: any, callback?: any) {
    this._formBuilderService.getInquiryFormList(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isInquiryFormLoading = false;
        this.inquiryFormData = resp?.data.original?.data || [];

        if (callback) {
          callback({
            recordsTotal: resp?.data.original?.recordsTotal || 0,
            recordsFiltered: resp?.data.original?.recordsFiltered || 0,
            data: this.inquiryFormData,
          });
        }

        if (this.dtElement) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }
      },
      (error) => {
        this.isInquiryFormLoading = false;
        this._toaster.showError('Failed to load inquiry forms');
        console.error('Error fetching data:', error);

        if (callback) {
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        }
      }
    );
  }

  reloadData() {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }
  }
	
  //#endregion Private methods
}