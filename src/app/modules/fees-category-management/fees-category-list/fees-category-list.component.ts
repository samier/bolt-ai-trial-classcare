import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { FeesCategoryManagementService } from '../fees-category-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import {
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-fees-category-list',
  templateUrl: './fees-category-list.component.html',
  styleUrls: ['./fees-category-list.component.scss'],
})
export class FeesCategoryComponent implements OnInit {
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody: any;
  constructor(
    private FeesCategoryService: FeesCategoryManagementService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService
  ) {}

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'type_name' },
        { data: 'CGST' },
        { data: 'SGST' },
        { data: 'is_optional',orderable: false },
        { data: 'optional_fees',orderable: false },
        { data: 'trust_associated',orderable: false },
        { data: 'trust_name',orderable: false },
        { data: 'category_type',orderable: false },
        { data: 'months', width: '300px', orderable: false },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.FeesCategoryService.getTrustDetailList(dataTablesParameters).subscribe(
      (resp: any) => {
        this.tbody = resp.data;
        callback
          ? callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            })
          : null;
        setTimeout(() => {
          this.datatableElement?.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            }
          );
        }, 10);
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  deleteTrustDetail(fees_id: any) {
    let result = confirm('Are you sure want to delete this record?');
    if (result) {
      this.FeesCategoryService.deleteTrustDetails(fees_id).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showServerSuccess(resp.message);
          this.reloadData();
        } else {
          this.toastr.showError(resp.message);
        }
      });
    }
  }

  canDelete(type:any){
    if(type == 'Transport Fees'){
      return false;
    }else if(type == 'Hostel Fees'){
      return false;
    }else if(type == 'RTE Fees'){
      return false;
    }else if(type == 'Meal Fees'){
      return false;
    }
    return true;
  }
}
