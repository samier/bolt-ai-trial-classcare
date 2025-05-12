import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs/internal/Subject';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { WhatsappHistoryService } from '../whatsapp-history.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { sentSMSStatus } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-sms-history',
  templateUrl: './sms-history.component.html',
  styleUrls: ['./sms-history.component.scss']
})
export class SmsHistoryComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any;
  total_sent: any = 0;
  success_sent: any = 0;
  failed_sent: any = 0;
  isResetloading : boolean = false;
  smsFilterForm : FormGroup = new FormGroup({});
  sendStatusList: any = sentSMSStatus;
  indexStart: any = 1;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      public activatedRouteService: ActivatedRoute,
      private toaster:Toastr,
      private whatsAppHistoryService: WhatsappHistoryService,
      public dateFormateService: DateFormatService
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.whatsAppHistoryService.getSmsCount().subscribe((res:any) => {  
      this.total_sent = res?.data?.total_sent;
      this.success_sent = res?.data?.success_sent;
      this.failed_sent = res?.data?.failed_sent;
    });
    this.initForm();
    this.initDatatable();
    this.smsFilterForm?.valueChanges.subscribe(() => {
      if(!this.isResetloading){
        this.reloadData();
      }
    });
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

  clearAll(){
    this.isResetloading = true
    this.smsFilterForm?.reset();
    this.smsFilterForm?.controls['status'].patchValue('all')
    this.reloadData();
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.smsFilterForm = this._fb.group({
      status: ['all'],
      date: [null]
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
      order: [[1,'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        {data: null, orderable: false, searchable: false },
        {data: 'date'},
        {data: 'name'},
        {data: 'number'},
        {data: 'massage'},
        {data: 'status'},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    const startDate = this.smsFilterForm?.value?.date?.startDate
    const endDate = this.smsFilterForm?.value?.date?.endDate
    const payload = {
      ...dataTablesParameters,
      status: this.smsFilterForm?.value?.status ?? 'all',
      ...(startDate && endDate) &&({
        start_date : startDate.format('YYYY-MM-DD'),
        end_date : endDate.format('YYYY-MM-DD')
      })
    };
    this.whatsAppHistoryService.getSmsHistory(Object.assign(payload)).subscribe(
      (res: any) => {
        this.isResetloading = false
        this.tbody = res?.data;
        this.indexStart =  (dataTablesParameters.start / dataTablesParameters.length) * dataTablesParameters.length
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
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    )
  }

//#endregion Private methods
}