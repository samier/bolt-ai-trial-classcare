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
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent {
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
    selectedItems: any = [];
    sectionList:any = []
    section_id = null;
    classList:any = []
    class_id = null
    batchList = []
    batch_id = null
    StudentList = []
    student_id = null

    roomDetail:any = null;

  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.selectedItems = [];
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
          localStorage.setItem('DataTables_' + URLConstants.ROOM_LIST, JSON.stringify(data))
        },
        stateLoadCallback: function(settings) {
          const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
          if(isModuleActive) {
            let state:any = localStorage.getItem('DataTables_' +  URLConstants.ROOM_LIST)
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
          { data: 'hostel' },
          { data: 'wing' },
          { data: 'floor' },
          { data: 'room_type' },
          { data: 'room_number' },
          { data: 'no_of_students_per_room' },
          { data: 'assign_student' },
          { data: 'total_fees' },
          { data: 'paid_amount' },
          { data: 'discount_amount' },
          { data: 'status' },
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }
    
    getFacility(value:any){
      console.log();
      if(typeof(value) == 'object'){
          let replacedArray = value.map(element => {
            switch(element) {
                case 0:
                    return 'AC';
                case 1:
                    return ' Bathroom';
                case 2:
                    return ' Gym';
                default:
                    return element;
            }
        });
        return replacedArray;
      } else{
        if(value == 0){
          return 'AC'
        } else if (value == 1){
          return 'Bathroom'
        }else if(value == 2){
          return 'Gym';
        }else{
          return '-'
        }
      }

    }
  
    loadData(dataTablesParameters?: any, callback?: any) {
      this.HostelManagementService.getRoomList(dataTablesParameters).subscribe(
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

    deleteRoom(warden_id:any){
      let confirm = window.confirm('Are you sure you want to delete this record?');
      if(confirm){
        this.HostelManagementService.deleteRoom(warden_id).subscribe((resp:any)=>{
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

    open(content:any, data:any) {
      this.roomDetail = data;
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result
    }

    handleSectionChange(){
      console.log(this.section_id);
      
      this.HostelManagementService.getSectionAndClass().subscribe(
        (resp: any) => {
          if (resp.status) {
            this.sectionList = resp.data.sections
            this.classList = resp.data.classes
            
          } else {
            this.toastr.showError(resp.message);
          }
        }
      );
    }
  
}
