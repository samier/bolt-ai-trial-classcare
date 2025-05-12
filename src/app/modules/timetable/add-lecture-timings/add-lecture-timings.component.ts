import { CommonService } from 'src/app/core/services/common.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-lecture-timings',
  templateUrl: './add-lecture-timings.component.html',
  styleUrls: ['./add-lecture-timings.component.scss'],
})
export class AddLectureTimingsComponent implements OnInit {
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
  sections:any = [];
  time_slots:any = [];
  dropdownList: any = [];
  selectedItems: any = [];
  submitted: any = false;
  updated:any = false;
  formData:any = {
    section_id: null,
    class_id: [],
    time_slot_id:  null,
  };
  showLoading = false

  
  isOpenByClick: boolean = true

  weeks = [
    {day : 'monday', status : true},
    {day : 'tuesday', status : true},
    {day : 'wednesday', status : true},
    {day : 'thursday', status : true},
    {day : 'friday', status : true},
    {day : 'saturday', status : true},
    {day : 'sunday', status : false},
  ]

  updateFormData:any = {
    section_id: null,
    section_name: null,
    class_id: [],
    time_slot_id:  null,
    assigned_time_slot_id: null,
  };

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  ngOnInit() {
    this.sectionList();
    this.getTimeSlots();
    this.getClassList();
    this.selectedItems = [];
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.ADD_LECTURE_TIMINGS, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.ADD_LECTURE_TIMINGS)
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
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'section_name', name:'section.name' },
        { data: 'classes' },
        { data: 'time_slot_name', name: 'time_slot.name' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }

  getTimeSlots(){
    this.TimetableService.getTimeSlots().subscribe((res: any) => {
      if (res.status) {
        this.time_slots = res.data;
      }
    });
  }

  sectionList(){
    this.TimetableService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
      }
    });
  }

  sectionChange(){
    this.formData.class_id = [];
    this.getClassList()
  }

  getClassList() {
    this.TimetableService.getTimeSlotClasses(this.formData.section_id).subscribe((resp: any) => {
      this.dropdownList = resp.data
    });
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.TimetableService.getAssignedSlotList(dataTablesParameters).subscribe(
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


  submit() {
    this.submitted = true;
    if (
      this.formData.class_id.length > 0 &&
      this.formData.section_id != null &&
      this.formData.time_slot_id != null
    ) {
      this.showLoading = true;
      this.formData.classes = this.formData.class_id.map((x:any) => x.id)
      this.TimetableService.assignTimeSlot(this.formData).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.clearForm();
            this.reloadData();
          } else {
            this.toastr.showError(resp.message);
            this.clearForm();
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
      this.updateFormData.class_id.length != 0
    ) {
      this.TimetableService.updateAssignTimeSlot(this.updateFormData, this.updateFormData.assigned_time_slot_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.modalService.dismissAll();
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

  deleteLecture(assigned_time_slot_id: any) {
    var result = confirm('Are you sure you want delete this record?');
    if (result == true) {
      this.TimetableService.deleteTimeSlot(assigned_time_slot_id).subscribe(
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

  open(content:any, assigned_time_slot_id:any) {
    this.TimetableService.getAssignedTimeSlot(assigned_time_slot_id).subscribe(
      (resp: any) => {
        if (resp.status) {
          this.dropdownList = resp.data?.classes
          this.updateFormData.section_id = resp.data?.assign_time_slot?.section_id ?? '-'
          this.updateFormData.section_name = resp.data?.assign_time_slot?.section?.name ?? '-'
          this.updateFormData.time_slot_id = resp.data?.assign_time_slot.time_slot_id
          this.updateFormData.assigned_time_slot_id = resp.data?.assign_time_slot.id
          this.updateFormData.class_id = resp.data?.assign_time_slot.assigned_classes.map((el:any) => {
            return {id: el.class.id, name: el.class.name, time_slot_id: el.id}
          });

          

          this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size:'lg', windowClass: 'lecture-timings', centered: true }).result.then(
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
    this.formData.class_id = [];
    this.dropdownList = [];
    this.formData.section_id = null;
    this.formData.time_slot_id = null;
    this.updated = false;
    this.updateFormData.class_id = [];
    this.updateFormData.section_id = null;
    this.updateFormData.section_name = null;
    this.updateFormData.time_slot_id = null;
    this.updateFormData.assigned_time_slot_id = null;
  }
}
