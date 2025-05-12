import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BatchService } from '../batch.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-batch-transfer-list',
  templateUrl: './batch-transfer-list.component.html',
  styleUrls: ['./batch-transfer-list.component.scss']
})
export class BatchTransferListComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptionsForTransferList: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  transferStudentList: any[] = [];
  isTransferStudent: boolean = false;
  URLConstants  = URLConstants

  
  isOpenByClick: boolean = true

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public commonService: CommonService,
    public batchService: BatchService,
    private _router : Router,
    public  dateFormateService : DateFormatService
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.isTransferStudent = false;
    this.defineDtoptionForTransferStudentList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------


  goToDetailsPage(id) {
    this._router.navigate([this.batchService.setUrl(`${URLConstants.BATCH_LIST}/${id}`)])
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  defineDtoptionForTransferStudentList() {
    this.dtOptionsForTransferList = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu:[50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForTransferStudentList(dataTablesParameters, callback);
      },
      columns: [
        {  data: 'id' },
        {  data: 'fromBatch.name' },
        {  data: 'toBatch.name' },
        {  data: 'total_students' },
        {  data: 'transfered_students' },
        {  data: 'status' },
        {  data: 'created_at' },
        {  data: 'id', orderable:false, searchable:false },
      ],
    };
  }

  loadDataForTransferStudentList(dataTablesParameters: any, callback: any) {
    this.batchService.getBatchTransferList(dataTablesParameters)
      .pipe(takeUntil(this.$destroy))
      .subscribe((resp: any) => {
        this.isTransferStudent = false;
        this.transferStudentList = resp.data
        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      });
  }

  //#endregion Private methods
}
