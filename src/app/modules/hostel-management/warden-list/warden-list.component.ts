import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-warden-list',
  templateUrl: './warden-list.component.html',
  styleUrls: ['./warden-list.component.scss']
})
export class WardenListComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private HostelManagementService: HostelManagementService,
      private toastr: Toastr,
      private modalService: NgbModal,
      public CommonService: CommonService,
    ) {}
    dropdownList: any = [];
    selectedItems: any = [];
    submitted: any = false;
    updated:any = false;
    formData:any = {
      name: null,
    };
  
    updateFormData = {
      school_id: null,
      name: null,
    };

    validationError:any = {

    }
    dropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.selectedItems = [];
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'name' },
          { data: 'contact_number' },
          { data: 'address' },
          { data: 'status' },
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }
  
  
    loadData(dataTablesParameters?: any, callback?: any) {
      this.HostelManagementService.getWardenList(dataTablesParameters).subscribe(
        (resp: any) => {
          this.tbody = resp.data;
          callback ? callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          }) : null;

          setTimeout(() => {
            this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            });
          }, 10);
        }
      );
    }
  
    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }

    deleteWarden(warden_id:any){
      let confirm = window.confirm('Are you sure you want to delete this record?');
      if(confirm){
        this.HostelManagementService.deleteWarden(warden_id).subscribe((resp:any)=>{
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.reloadData()
          }
          else{
            this.toastr.showError(resp.message)
          }
        })
      }
    }
  
}
