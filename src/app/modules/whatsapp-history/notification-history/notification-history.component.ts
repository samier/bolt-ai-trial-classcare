import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { WhatsappHistoryService } from '../whatsapp-history.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { sentNotificationList } from 'src/app/common-config/static-value';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-history',
  templateUrl: './notification-history.component.html',
  styleUrls: ['./notification-history.component.scss']
})
export class NotificationHistoryComponent implements OnInit {
  //#region Public | Private Variables
  // @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  $destroy: Subject<void> = new Subject<void>();
  notificationHistoryF : FormGroup = new FormGroup({});
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  isResetloading: boolean = false;
  tbody: any;
  indexStart: any = 1;
  moduleList: any =[];
  total_count: any;
  read_count: any;
  unread_count: any;
  sendNotificationList:any = sentNotificationList;
  boundProfileClick: any;
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private whatsAppHistoryService: WhatsappHistoryService,
      public dateFormateService: DateFormatService,
      private toastr: Toastr,
      private datePipe: DatePipe,
      private router: Router
  ) {
    this.boundProfileClick = this.handleProfileLink.bind(this);
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.onModuleChange();
    this.notificationHistoryF?.valueChanges.subscribe(() => {
      if(!this.isResetloading){
        this.reloadData();
      }
    });

    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundProfileClick);
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
  
  clearAll(){
    this.isResetloading = true
    this.notificationHistoryF?.reset();
    this.notificationHistoryF?.controls['status_read'].patchValue('')
    this.reloadData();
  }

  onModuleChange(){
    this.whatsAppHistoryService
      .getModuleName()
      .subscribe((res: any) => {
        if (res.status) {
          this.moduleList = res.data;
        }
      });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.notificationHistoryF = this._fb.group({
      date: [null],
      module_id : [null],
      status_read : ['']
      
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
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        { title: 'Sr.No.', orderable: false,
          render: function (data, type, row, meta) {
          return meta.row + 1 ; // Adds Sr.No. based on row index
          } 
        },
        {
          title: 'Created', data: 'created_at', defaultContent: '-',
          "render": function (data) {
            return that.datePipe.transform(data, that.dateFormateService.getDateTimeFormat())
          }
        },
        {
          title: 'Name',
          data: 'name',
          orderable: false,
          render: (data: any, type: any, row: any) => {
            const profilePath = row?.student_id ? this.CommonService.setUrl(`${URLConstants.STUDENT_PROFILE}/${row?.unique_id}`) : this.CommonService.setUrl(`${URLConstants.USER_PROFILE}/${row?.faculty_id}`)
            return `<a href="#" class="clickable-link" data-link="${profilePath}">${data}</a>`;
          }
        },
        
        { title: 'Message', data: 'msg' , orderable: false },
        { title: 'status', data: 'status',
          render: function (data, type, row) {
            if(data == 1){
              return `<img src="assets/images/double-check.svg" width="16" height="16">`;
            }else{
              return `<img src="assets/images/single-tickdi.svg" width="16" height="16">`
            }
          }
          
         },
        // {data: null, orderable: false, searchable: false },
        // {data: 'created_at', orderable: false},
        // {data: 'name', orderable: false},
        // {data: 'msg', orderable: false},
        // {data: 'status', orderable: false},
      ],
      language: { 
        emptyTable: 'No data available', 
        zeroRecords: 'No matching records found'
      },
      drawCallback: () => {
        this.bindClickEvent()
      }
    };
  }

  bindClickEvent(){
    const table = document.querySelector('.table-responsive');
    if (table) {
      table.removeEventListener('click', this.boundProfileClick);
      table.addEventListener('click', this.boundProfileClick);
    }
  }

  handleProfileLink(event: any) {
    event.preventDefault();
    const target = event.target.closest('a');
    if (!target) return;

    const path = target.getAttribute('data-link');
    this.router.navigate([path])
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    
    const startDate = this.notificationHistoryF?.value?.date?.startDate
    const endDate = this.notificationHistoryF?.value?.date?.endDate
    const payload = {
      ...dataTablesParameters,
      ...(startDate && endDate) &&({
        start_date : startDate.format('YYYY-MM-DD'),
        end_date : endDate.format('YYYY-MM-DD')
      }),
      module:  this.CommonService.getID( this.notificationHistoryF?.value?.module_id) ?? null,
      status_read : this.notificationHistoryF?.value?.status_read ??null,
      
    };
    
    this.whatsAppHistoryService.getNotificationHistory(payload).subscribe(
      (res: any) => {
        this.isResetloading = false
        this.total_count = res?.data?.original?.total_count;
        this.read_count = res?.data?.original?.read_count;
        this.unread_count = res?.data?.original?.unread_count;
     
        // this.tbody = res?.data?.original?.data;
        // this.indexStart =  (dataTablesParameters.start / dataTablesParameters.length) * dataTablesParameters.length
        callback({
          recordsTotal: res?.data?.original?.recordsTotal,
          recordsFiltered: res?.data?.original?.recordsFiltered,
          data: res?.data?.original?.data,
          // data: []
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 200);
      },(error)=> {
        this.isResetloading = false
        this.toastr.showError(error?.error?.message ?? error?.message)
      }
    )
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
	
  //#endregion Private methods
}