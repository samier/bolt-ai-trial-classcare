import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-hostel-list',
  templateUrl: './hostel-list.component.html',
  styleUrls: ['./hostel-list.component.scss']
})
export class HostelListComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;

    
  isOpenByClick: boolean = true
  
    tbody: any;
    constructor(
      private HostelManagementService: HostelManagementService,
      private toastr: Toastr,
      private modalService: NgbModal,
      public CommonService: CommonService,
      public activatedRouteService: ActivatedRoute
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

      const that = this;
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 50,
        lengthMenu:[50,100,200],
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        stateSave: true,
        stateSaveCallback: function(settings,data) {
          localStorage.setItem('DataTables_' + URLConstants.HOSTEL_LIST, JSON.stringify(data))
        },
        stateLoadCallback: function(settings) {
          const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
          if(isModuleActive) {
            let state:any = localStorage.getItem('DataTables_' +  URLConstants.HOSTEL_LIST)
            let dataTableState = JSON.parse(state)
            return dataTableState
          } else {
            that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.state.clear();
            });
            return null;
          }
        },
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'name' },
          { data: 'warden' },
          { data: 'description'},
          { data: 'address' },
          { data: 'status' },
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }
  
    loadData(dataTablesParameters?: any, callback?: any) {
      this.HostelManagementService.getHostelList(dataTablesParameters).subscribe(
        (resp: any) => {
          this.tbody = resp.data.original.data;
          callback ? callback({
            recordsTotal: resp.data.original.recordsTotal,
            recordsFiltered: resp.data.original.recordsFiltered,
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

    deleteWarden(hostel_id:any){
      let confirm = window.confirm('Are you sure you want to delete this record?');
      if(confirm){
        this.HostelManagementService.deleteHostel(hostel_id).subscribe((resp:any)=>{
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
