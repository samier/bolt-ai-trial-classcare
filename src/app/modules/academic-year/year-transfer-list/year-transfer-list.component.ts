import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AcademicYearService } from '../academic-year.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-year-transfer-list',
  templateUrl: './year-transfer-list.component.html',
  styleUrls: ['./year-transfer-list.component.scss']
})
export class YearTransferListComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptionsForTransferList: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  transferStudentList: any[] = [];
  isTransferStudent: boolean = false;
  URLConstants  = URLConstants

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public academicYearService : AcademicYearService,
    private _router : Router,
    public dateFormatService: DateFormatService,
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
    this._router.navigate([this.academicYearService.setUrl(`${URLConstants.YEAR_LIST}/${id}`)])
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
      scrollX: true,
      scrollCollapse: true,
      order: [[6,'desc']],
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForTransferStudentList(dataTablesParameters, callback);
      },
      columns: [
        {  data: 'id', orderable:false, searchable:false },
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
    this.academicYearService.getYearTransferList(dataTablesParameters)
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
