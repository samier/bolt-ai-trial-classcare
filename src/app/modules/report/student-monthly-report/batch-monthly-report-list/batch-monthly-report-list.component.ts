import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../../report.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-batch-monthly-report-list',
  templateUrl: './batch-monthly-report-list.component.html',
  styleUrls: ['./batch-monthly-report-list.component.scss']
})
export class BatchMonthlyReportListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any = [];
  id : any;
  allChecked: boolean = false;
  downloadAll: boolean = false;
  selectedItems: Set<number> = new Set();
  hasDownload: boolean = this.CommonService.hasPermission('report_student_monthly_report', 'has_download');
  hasDelete: boolean = this.CommonService.hasPermission('report_student_monthly_report', 'has_delete');
  //#endregion Public | Private Variables
  
  isOpenByClick: boolean = true

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    public reportService: ReportService, 
    private toastr: Toastr,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initDataTable();
    this.id = this.route.snapshot.params['id']
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  handleSelectAll(event: any){
    const checked = event.target.checked;;
    this.tbody.forEach(item => {
      item.selected = checked;
      if(checked){
      this.selectedItems.add(item.id);
      }else{
      this.selectedItems.delete(item.id);
      }
    })
  }

  handleSelect(event: any, id: any){
    if(event.target.checked){
      this.selectedItems.add(id);
    }else{
      this.selectedItems.delete(id);
    }
    this.allChecked = this.selectedItems.size == this.tbody?.length;
  }

  downloadReport(item?: any){
    if(!item && this.selectedItems?.size === 0){
      this.toastr.showError('Please select at least one Record');
      return
    }
    const payload = {
      studentIds: item?.id ? [item?.id] : Array.from(this.selectedItems),
    }
    this.toastr.showInfo("Downloading your file","Please Wait");
    this.reportService?.downloadStudentMonthlyReport(this.id,payload)
    .subscribe((res: any) => {
      if(res?.body?.type == 'text/html'){
        this.CommonService.downloadFile(res, `${this.id}-monthly-report`, 'pdf');
      }else{
        this.toastr.showError(res?.message)
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected error occurred');
    });
  }

  deleteReport(item : any){
    const c = confirm("Are you sure you want to delete this record?")
    if(!c){
      return
    }
    this.reportService?.deleteStudentMonthlyReport(this.id, item?.id)
    .subscribe((res: any) => {
      if(res?.status){
        this.reloadData();
        this.toastr.showSuccess(res?.message);
      }else{
        this.toastr.showError(res?.message)
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occured')
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initDataTable(){
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      order: [[ 2, 'asc' ]],

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },

      columns:[
        {data: null, orderable: false, searchable: false},
        {data: 'id', orderable: false, searchable: false},
        {data: 'full_name'},
        {data: 'batch_name', orderable: false, searchable: false},
        {data: 'action', orderable: false, searchable: false},
      ]
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    const payload = {
      ...dataTablesParameter,
      id: this.id,
    }
    this.allChecked = false;
    this.reportService.getStudentMonthlyReportList(payload).subscribe((res: any) => {
      this.tbody = res?.data?.original?.data
      callback({
        recordsTotal: res?.data?.original.recordsTotal,
        recordsFiltered: res?.data?.original.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.column(0).visible(this.hasDownload);
          dtInstance.column(4).visible(this.hasDownload || this.hasDelete);
          dtInstance.columns.adjust();
        });
      }, 10);
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message)
    })
  }

  reloadData(){
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  //#endregion Private methods
}