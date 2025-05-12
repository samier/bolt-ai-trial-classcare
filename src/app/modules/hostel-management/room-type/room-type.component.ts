import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HostelManagementService } from '../hostel-management.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-room-type',
  templateUrl: './room-type.component.html',
  styleUrls: ['./room-type.component.scss']
})
export class RoomTypeComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  @ViewChild('createMdl') createMdl: ElementRef | undefined;

  
  isOpenByClick: boolean = true

  constructor(
    private HostelManagementService: HostelManagementService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) { }
  URLConstants = URLConstants;

  tbody: any;
  wings: any = [];
  roomType: any = [];
  FeesMonths = [];
  type:any = null;

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
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.ROOM_TYPE_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.ROOM_TYPE_LIST)
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
        { data: 'type' },
        { data: 'total_new_fees' },
        { data: 'total_old_fees' },
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
    this.HostelManagementService.getRoomTypeList(dataTablesParameters).subscribe((resp: any) => {
      this.wings = resp.data;
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }
  openCreateMdl(createMdl:any, wing = null, type:any) {
    this.HostelManagementService.getCategoryMonths().subscribe((resp:any) => {
      if(resp.status){
        this.FeesMonths = resp.data
        this.modalService.open(createMdl,  { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
        this.roomType = wing
        this.type = type
      }
    })
  }

  deleteRoomType(wing_id: any) {
    let confirm = window.confirm('Are you sure you want to delete this record?');
    if (confirm) {
      this.HostelManagementService.deleteRoomType(wing_id).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message)
          this.reloadData()
        }
        else {
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
