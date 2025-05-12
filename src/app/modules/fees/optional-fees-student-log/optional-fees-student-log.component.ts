import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeesService } from '../fees.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-optional-fees-student-log',
  templateUrl: './optional-fees-student-log.component.html',
  styleUrls: ['./optional-fees-student-log.component.scss']
})
export class OptionalFeesStudentLogComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private FeesService: FeesService,
      private toastr: Toastr,
      private modalService: NgbModal,
      public CommonService: CommonService,
      public activatedRouteService: ActivatedRoute
    ) {}
    public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];
    acedemicYear:any = localStorage.getItem('acedemicYear');
    optional_log_id:any = null;
  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.optional_log_id = this.activatedRouteService.snapshot.params['id'];
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 50,
        lengthMenu : [50,100,200],
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'student_name', name:'student_name' },
          { data: 'old_fees' },
          { data: 'new_fees' },
          { data: 'start_date' },
          { data: 'end_date' },
          { data: 'status' },
          { data: 'message' },
        ],
      };
    }
  
  
    loadData(dataTablesParameters?: any, callback?: any) {
      dataTablesParameters = {...dataTablesParameters, optional_log_id: this.optional_log_id}
      this.FeesService.optionalFeesStudentLogList(dataTablesParameters).subscribe(
        (resp: any) => {
          this.tbody = resp.data;
          callback ? callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          }) : null;
        }
      );
    }
  
    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }
  
}
