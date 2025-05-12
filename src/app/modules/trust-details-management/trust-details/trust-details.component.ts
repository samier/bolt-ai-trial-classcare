import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { TrustDetailManagementService } from '../trust-details-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import {
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-trust-details',
  templateUrl: './trust-details.component.html',
  styleUrls: ['./trust-details.component.scss'],
})
export class TrustDetailsComponent implements OnInit {
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody: any;
  constructor(
    private TrustService: TrustDetailManagementService,
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
        { data: 'name' },
        { data: 'contact_number' },
        { data: 'email' },
        { data: 'address' },
        // { data: 'bank_name' },
        // { data: 'account_number' },
        // { data: 'account_holder_name' },
        // { data: 'type_of_account' },
        // { data: 'ifsc_code' },
        // { data: 'branch_name' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.TrustService.getTrustDetailList(dataTablesParameters).subscribe(
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

  deleteTrustDetail(trust_id: any) {
    let result = confirm('Are you sure want to delete this record?');
    if (result) {
      this.TrustService.deleteTrustDetails(trust_id).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showServerSuccess(resp.message);
          this.reloadData();
        } else {
          this.toastr.showError(resp.message);
        }
      });
    }
  }
}
