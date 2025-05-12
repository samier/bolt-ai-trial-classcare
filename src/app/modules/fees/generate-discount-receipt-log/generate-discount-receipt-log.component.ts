import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesService } from '../fees.service';
import { Subject, takeUntil } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-generate-discount-receipt-log',
  templateUrl: './generate-discount-receipt-log.component.html',
  styleUrls: ['./generate-discount-receipt-log.component.scss']
})
export class GenerateDiscountReceiptLogComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  logs: any[] = [];
  URLConstants  = URLConstants
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public commonService: CommonService,
    public feesService: FeesService,
    public  dateFormateService : DateFormatService
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initDatatable();
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
  initDatatable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu:[50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        {  data: 'id' },
        {  data: 'generatedBy.first_name' },
        {  data: 'total_students' },
        {  data: 'generated_students' },
        {  data: 'status' },
        {  data: 'created_at' },
        {  data: 'id', orderable:false, searchable:false },
      ],
    };
  }

  loadData(dataTablesParameters: any, callback: any) {
    this.feesService.generateDiscountReceiptDatatable(dataTablesParameters)
      .pipe(takeUntil(this.$destroy))
      .subscribe((resp: any) => {
        this.logs = resp.data
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
