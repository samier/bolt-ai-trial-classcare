import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assign-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent {
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
  showLoading = false;
  dropdownList: any = [];
  selectedItems: any = [];
  submitted: any = false;
  updated:any = false;
  formData:any = {
    name: null,
  };

  updateFormData = {
    room_id: null,
    name: null,
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
    this.selectedItems = [];
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.CREATE_ROOM, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.CREATE_ROOM)
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
        { data: 'name' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }


  loadData(dataTablesParameters?: any, callback?: any) {
    this.TimetableService.getAllRooms(dataTablesParameters).subscribe(
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
      this.formData.name != null
    ) {
      this.showLoading = true;
      this.TimetableService.storeRoom(this.formData).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.clearForm();
            this.reloadData();
          } else {
            this.toastr.showError(resp.message);
          }
          this.showLoading = false;
        },(error:any) => {
          console.log(error);
          this.showLoading = false;
        }
      );
    }
  }

  update(){
    this.updated = true;
    if (
      this.updateFormData.name != null
    ) {
      this.TimetableService.updateRoom(this.updateFormData, this.updateFormData.room_id).subscribe(
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
      this.TimetableService.deleteRoom(lecture_id).subscribe(
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
    this.TimetableService.getRoomById(room_id).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.updateFormData.room_id = resp.data.id;
          this.updateFormData.name = resp.data.name

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
    this.formData.name = null;
    this.updateFormData.room_id = null;
    this.updateFormData.name = null;
  }

}
