import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-assign-room',
  templateUrl: './assign-room.component.html',
  styleUrls: ['./assign-room.component.scss']
})
export class AssignRoomComponent {
URLConstants = URLConstants;
dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  constructor(
    private TimetableService: TimetableService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
  ) {}
  batchList: any = [];
  roomList:any = [];
  selectedItems: any = [];
  submitted: any = false;
  updated:any = false;
  formData:any = {
    batch_id: null,
    room_id: [],
  };

  showLoading = false;

  
  isOpenByClick: boolean = true

  updateFormData = {
    assign_room_id: null,
    batch_id: null,
    batch_name : null,
    room_id: null,
    room_name: null,
  };
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
    this.getBatchList();
    this.getRoomList();
    this.selectedItems = [];
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.ASSIGN_ROOM, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.ASSIGN_ROOM)
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
        { data: 'no' },
        { data: 'batch_name'},
        { data: 'room_name' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }

  getBatchList() {
    this.TimetableService.getBatchList().subscribe((resp: any) => {
      this.batchList = resp.data;
    });
  }

  getRoomList() {
    this.TimetableService.getRoomList().subscribe((resp: any) => {
      this.roomList = resp.data.map((x: any) => {
        return { item_id: x.id, item_text: x.name };
      });
    });
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.TimetableService.getAllAssignRooms(dataTablesParameters).subscribe(
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


  submit() {
    this.submitted = true;
    if (
      this.formData.room_id.length > 0 &&
      this.formData.batch_id != null
    ) {
      this.showLoading = true;
      this.TimetableService.storeAssignRoom(this.formData).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.clearForm();
            this.reloadData();
          } else {
            this.toastr.showError(resp.message);
          }
          this.showLoading = false;
        },(error:any) =>{
          this.showLoading = false;
          console.log(error);
        }
      );
    }
  }

  update(){
    this.updated = true;
    if (
      this.updateFormData.batch_id != null &&
      this.updateFormData.room_id != null
    ) {
      this.TimetableService.updateAssignRoom(this.updateFormData, this.updateFormData.assign_room_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.reloadData();
            this.clearForm();
          } else {
            this.toastr.showError(resp.message);
          }
        }
      );
    }
  }

  deleteLecture(lecture_id: any) {
    var result = confirm('Are you sure you want delete this record?');
    if (result == true) {
      this.TimetableService.deleteAssignRoom(lecture_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.reloadData();
          } else {
            this.toastr.showError(resp.message);
          }
        }
      );
    }
  }

  open(content:any, room_id:any) {
    this.TimetableService.getAssignRoomById(room_id).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.updateFormData.assign_room_id = resp.data.id;
          this.updateFormData.batch_id = resp.data.batch_id;
          this.updateFormData.batch_name = resp.data.batch.name;
          this.updateFormData.room_id = resp.data.room_id;

          this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true }).result.then(
            (result) => {
              if(result == 'update'){
                this.update()
              }
            },
          );
        } else {
          this.toastr.showError(resp.message);
        }
      }
    );


	}

  clearForm() {
    this.submitted = false;
    this.updated = false;
    this.formData.batch_id = null;
    this.formData.room_id = [];
    this.updateFormData.assign_room_id = null;
    this.updateFormData.batch_id = null;
    this.updateFormData.batch_name = null;
    this.updateFormData.room_id = null;
    this.updateFormData.room_name = null;
  }

}
