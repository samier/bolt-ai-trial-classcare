import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject } from 'rxjs';
import { ResultService } from '../result.service';

@Component({
  selector: 'app-student-attendance-list',
  templateUrl: './student-attendance-list.component.html',
  styleUrls: ['./student-attendance-list.component.scss']
})
export class studentAttendanceListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  tbody:any = [];
  isOpenByClick: boolean = true
  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    public resultService : ResultService,
    private toastr: Toastr,
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initDataTable();
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


  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'id' },
        { data: 'attendance_title' },
        { data: 'section', name: 'section.name' },
        { data: 'class', name: 'class.name' },
        { data: 'total_working_days'},
        { data: 'action',orderable:false,searchable:false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.resultService.getStudentAttendanceDetailList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.tbody = resp.data
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

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  delate(id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(confirm){
      this.resultService.deleteAttendanceDetail(id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
        this.reloadData();
      })
    }
  }

  //#endregion Private methods

}
