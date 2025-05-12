import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { AddEventHolidayComponent } from '../add-event-holiday/add-event-holiday.component';
import { CalendarService } from '../calendar.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { EventService } from '../../event/event.service';
import { Toastr } from 'src/app/core/services/toastr';
import {  Subject, takeUntil } from 'rxjs';
import { DateFormatService } from 'src/app/service/date-format.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-holiday-list',
  templateUrl: './event-holiday-list.component.html',
  styleUrls: ['./event-holiday-list.component.scss'],
})
export class EventHolidayListComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  pageType: any;
  dtOptions: DataTables.Settings = {};
  URLConstants = URLConstants;
  boundHandleTableClick: any;
  tableBody: any = [];
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  dtTrigger: Subject<any> = new Subject();
  modalOptions: any = {
    backdrop: 'static',
    centered: true,
    size: 'lg',
    windowClass: 'duplicate-modal-section latest-design-modal',
    backdropClass: 'duplicate-modal-backdrop',
  };
  isTableVisible = true;
  hasEdit: boolean;
  hasDelete: boolean;
  hasAccess: boolean;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private calendarService: CalendarService,
    private _modalService: NgbModal,
    private activatedRouteService: ActivatedRoute,
    public _CommonService: CommonService,
    private _router: Router,
    private toastr: Toastr,
    private eventService: EventService,
    private _dateFormteService: DateFormatService,
    private datePipe: DatePipe
  ) {
    this.activatedRouteService.queryParamMap.subscribe((ele) => {
      this.pageType = ele.get('isDefaultTemplate') || null;
      this.reinitPage();
    })
    this.hasEdit = this._CommonService.hasPermission(`administrator_${this.pageType}`, 'has_edit');
    this.hasDelete = this._CommonService.hasPermission(`administrator_${this.pageType}`, 'has_delete');
    this.hasAccess = this._CommonService.hasPermission(`administrator_${this.pageType}`, 'has_access');
    this.boundHandleTableClick = this.handleTableClick.bind(this);
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initDataTable();
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundHandleTableClick);
    }
    this.boundHandleTableClick = this.handleTableClick.bind(this);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    this.dtTrigger.unsubscribe();
  }
  

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  addMultiple(type: any) {
    let queryParams: NavigationExtras = {
      queryParams: {
        isDefaultTemplate: type,
      },
    };
    this._router.navigate(
      [this._CommonService.setUrl(URLConstants.ADD_MULTI_EVENT)],
      queryParams
    );
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  reinitPage() {
    this.isTableVisible = false;
  
    if (this.datatableElement && this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy(true); // true = remove DOM as well
        this.dtTrigger = new Subject(); // Reset trigger
        this.initializeAndTriggerTable(); // Reinitialize
      });
    } else {
      this.initializeAndTriggerTable();
    }
  }

  initializeAndTriggerTable() {
    this.initDataTable();
    
    setTimeout(() => {
      this.isTableVisible = true;
  
      setTimeout(() => {
        this.dtTrigger.next(null);
      }, 100);
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
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: this.getColumns(),
      language: {
        emptyTable: 'No data available',
        zeroRecords: 'No matching records found',
      },
      drawCallback: () => {
        this.bindActionEvents();
      },
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.calendarService.getHolidayList({ ...dataTablesParameters, pageType: this.pageType  }).subscribe(
      (res: any) => {
        this.tableBody = res.data;
        if (callback) {
          // Ensure data is available before calling the callback
          callback({
            recordsTotal: res?.recordsTotal || 0,
            recordsFiltered: res?.recordsFiltered || 0,
            data: res?.data || [],
          });
        }
        setTimeout(() => {
          this.datatableElement?.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            }
          );
        }, 200);
      },
      (error: any) => {
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

  reloadTable() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getColumns() {
    return [
      {
        title: `${this.pageType} For`,
        data: 'assignTo',
        render: (data, type, row) => {
          return `<span>${
            data == '1'
            ? 'Student'
              : data == '2'
              ? 'Employee'
              : 'Student, Employee'
          }</span>`;
        },
      },
      {
        title: `${this.pageType} Title`,
        data: (row) => this.pageType === 'event' ? row.event_name : row.name,
        name: this.pageType === 'event' ? 'event_name' : 'name',
        render: (data, type, row) => {
          return `<span style="color:${row.color}">${data}</span>`;
        },
      },
      { title: 'Start Date', data: 'start_date',
        render: (data) => this.datePipe.transform(data, this._dateFormteService.getDateFormat())
       },
      { title: 'End Date', data: 'end_date',
        render: (data) => this.datePipe.transform(data, this._dateFormteService.getDateFormat())
       },
      ...(this.pageType == 'event'
        ? [
            { title: 'Start Time', data: 'start_time',
              render: (data) => this.datePipe.transform(`1970-01-01T${data}`, 'hh:mm:ss a')
             },
            { title: 'End Time', data: 'end_time',
              render: (data) => this.datePipe.transform(`1970-01-01T${data}`, 'hh:mm:ss a')
             },
            { title: 'Event Type', data: 'event_type.name' },
          ]
        : []),
      ...this.hasAccess || this.hasEdit || this.hasDelete ? [{
        title: 'Action',
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
          let actionButtons = '<div class="btn-group">';
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
          
          if (this.hasAccess) {
            actionButtons += `<button class="btn action-view" data-id="${row.id}" data-toggle="tooltip" title="View"> 
                                  <i class="fa fa-eye"></i> 
                                </button>`;
          }
          
          actionButtons += '</div>';
          return actionButtons;
        },
      }] : [],
    ];
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
    if (target.classList.contains('action-edit')) {
      this.addEditHolidayModal(id,false);
    } else if (target.classList.contains('action-delete')) {
      this.delete(Number(id));
    } else if (target.classList.contains('action-view')) {
      this.addEditHolidayModal(id,true)
    }
  }

   async addEditHolidayModal(id: any,isView:boolean = false) {
   
      const selectedObj = this.tableBody.find((holiday: any) => holiday.id == id);
      const modalRef = this._modalService.open(AddEventHolidayComponent, this.modalOptions);
      modalRef.componentInstance.selectedObj = selectedObj;
      modalRef.componentInstance.type = this.pageType
      modalRef.componentInstance.isView = isView
  
      await modalRef.result.then((response: any) => {
        if(response?.data){
          this.reloadTable();
        }
      })
  }
   
  delete(id: number) {
    const confirmed = confirm('Are you sure? You want to delete it?');
    if (confirmed) {
      this.calendarService.deleteHoliday({id: id, pageType: this.pageType}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if(res?.status){
          this.toastr.showSuccess(res?.message);
          this.reloadTable();
        } else{
          this.toastr.showError(res?.message)
        }
      },
      (error: any) => {
        this.toastr.showError(error.error.message ?? error.message ?? 'An unexpected error occured')
      })
    }
  }
 
  //#endregion Private methods
}
