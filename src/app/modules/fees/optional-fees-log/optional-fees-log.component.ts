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
  selector: 'app-optional-fees-log',
  templateUrl: './optional-fees-log.component.html',
  styleUrls: ['./optional-fees-log.component.scss']
})
export class OptionalFeesLogComponent {
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
  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
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
          { data: 'created_at' },
          { data: 'fees_category', name:'category_fees.type_name' },
          { data: 'course', name: 'course.name' },
          { data: 'old_fees' },
          { data: 'new_fees' },
          { data: 'status' },
          { data: 'student_count' },
          { data: 'success_count' },
          { data: 'failed_count' },
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }
  
  
    loadData(dataTablesParameters?: any, callback?: any) {
      this.FeesService.optionalFeesLogList(dataTablesParameters).subscribe(
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
