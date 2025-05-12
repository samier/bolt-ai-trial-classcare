import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesService } from '../fees.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-generate-discount-receipt-log-details',
  templateUrl: './generate-discount-receipt-log-details.component.html',
  styleUrls: ['./generate-discount-receipt-log-details.component.scss']
})
export class GenerateDiscountReceiptLogDetailsComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  logs: any[] = [];
  URLConstants  = URLConstants
  discount_receipt_id:any;


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public commonService: CommonService,
    public feesService: FeesService,
    private activatedRouteService: ActivatedRoute
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.discount_receipt_id =  this.activatedRouteService.snapshot.paramMap.get('id')!;
    this.initDatatable();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

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
        {  data: 'student.first_name' },
        {  data: 'message' },
      ],
    };
  }

  loadData(dataTablesParameters: any, callback: any) {
    const payload = {
      ...dataTablesParameters,
      discount_receipt_id : this.discount_receipt_id
    }
    this.feesService.generateDiscountReceiptLog(payload)
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
