import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AcademicYearService } from '../academic-year.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-year-transfer-details',
  templateUrl: './year-transfer-details.component.html',
  styleUrls: ['./year-transfer-details.component.scss']
})
export class YearTransferDetailsComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  dtOptionsForTransferList: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  transferStudentList: any[] = [];
  isTransferStudent: boolean = false;
  URLConstants  = URLConstants
  yearTransferId : string = ''


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public academicYearService : AcademicYearService,
    private activatedRouteService: ActivatedRoute
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.isTransferStudent = false;
    this.yearTransferId =  this.activatedRouteService.snapshot.paramMap.get('id')!;

    if (this.yearTransferId) {
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
      year_transfer_id : this.yearTransferId
    }
    this.academicYearService.getYearTransferLog(payload)
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
