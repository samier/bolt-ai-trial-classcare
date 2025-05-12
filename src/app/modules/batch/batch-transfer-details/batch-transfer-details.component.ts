import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { BatchService } from '../batch.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-batch-transfer-details',
  templateUrl: './batch-transfer-details.component.html',
  styleUrls: ['./batch-transfer-details.component.scss']
})
export class BatchTransferDetailsComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptionsForTransferList: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  transferStudentList: any[] = [];
  isTransferStudent: boolean = false;
  URLConstants  = URLConstants
  batchTransferId : string = ''


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public commonService: CommonService,
    public batchService: BatchService,
    private activatedRouteService: ActivatedRoute
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.isTransferStudent = false;
    this.batchTransferId =  this.activatedRouteService.snapshot.paramMap.get('id')!;

    if (this.batchTransferId) {
      this.defineDtoptionForTransferStudentList();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

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
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForTransferStudentList(dataTablesParameters, callback);
      },
      columns: [
        {  data: 'id' },
        {  data: 'student.first_name' },
        {  data: 'message' },
      ],
    };
  }

  loadDataForTransferStudentList(dataTablesParameters: any, callback: any) {
    const payload = {
      ...dataTablesParameters,
      batch_transfer_id : this.batchTransferId
    }
    this.batchService.getBatchTransferLog(payload)
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
