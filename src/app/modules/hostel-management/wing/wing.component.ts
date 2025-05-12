import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HostelManagementService } from '../hostel-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-wing',
  templateUrl: './wing.component.html',
  styleUrls: ['./wing.component.scss']
})
export class WingComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('createMdl') createMdl: ElementRef | undefined;
  @ViewChild('createFloorMdl') createFloorMdl: ElementRef | undefined;

  constructor(
    private HostelManagementService: HostelManagementService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) { }
  URLConstants = URLConstants;

  
  isOpenByClick: boolean = true

  tbody: any;
  wings: any = [];
  wing: any = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 4,
    allowSearchFilter: true,
  };
  validationError: any = [];

  ngOnInit(): void {
    const that = this
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
        localStorage.setItem('DataTables_' + URLConstants.WING_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.WING_LIST)
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
        this.getlist(dataTablesParameters, callback)
      },
      columns: [
        { data: 'id' },
        { data: 'hostel_name' },
        { data: 'name' },
        { data: 'floors' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getlist(dataTablesParameters?: any, callback?: any) {
    this.HostelManagementService.getWingList(dataTablesParameters).subscribe((resp: any) => {
      this.wings = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }
  openCreateMdl(createMdl, wing = {}) {
    this.modalService.open(createMdl);
    this.wing = wing
  }

  openCreateFloorMdl(createMdl, wing = {}) {
    this.modalService.open(createMdl);
    this.wing = wing
  }


  deleteWing(wing_id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?');
    if(confirm){
      this.HostelManagementService.deleteWing(wing_id).subscribe((resp:any)=>{
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

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
