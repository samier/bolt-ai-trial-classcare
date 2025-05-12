import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { TimetableService } from '../timetable.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-add-time-slot',
  templateUrl: './add-time-slot.component.html',
  styleUrls: ['./add-time-slot.component.scss']
})
export class AddTimeSlotComponent implements OnInit, OnDestroy {
  //#region Public | Private Variables
  private $destroy: Subject<void> = new Subject<void>();
  //#endregion Public | Private Variables

  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;

  // #region constructor
  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private TimetableService: TimetableService,
    private toastr: Toastr,
    private modalService: NgbModal,
  ) {
  }
  //#endregion constructor
  showLoading= false
  updateShowLoading= false
  formData:any = {
    name: null,
    week_days: [],
    time_slot: [{id:null, from_time: null, to_time: null, is_break: false}],
  }

  updateFormData:any = {
    id: null,
    name: null,
    week_days: [],
    day: null,
    time_slot: [{id:null, from_time: null, to_time: null, is_break: false}],
  }

  errors:any = [];
  updateErrors:any = [];

  weeks:any = [
    {day : 'monday', status : false},
    {day : 'tuesday', status : false},
    {day : 'wednesday', status : false},
    {day : 'thursday', status : false},
    {day : 'friday', status : false},
    {day : 'saturday', status : false},
    {day : 'sunday', status : false},
  ]

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  
  // #region Lifecycle hooks
  ngOnInit(): void {
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
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'name' },
        { data: 'monday', orderable: false, searchable: false },
        { data: 'tuesday', orderable: false, searchable: false },
        { data: 'wednesday', orderable: false, searchable: false },
        { data: 'thursday', orderable: false, searchable: false },
        { data: 'friday', orderable: false, searchable: false },
        { data: 'saturday', orderable: false, searchable: false },
        { data: 'sunday', orderable: false, searchable: false },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks
  
  // #region Public methods
  // Add public methods if needed

  loadData(dataTablesParameters?: any, callback?: any) {
    this.TimetableService.timeTableSlotList(dataTablesParameters).subscribe(
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

  updateSlot(modal:any, day:any, rec:any){
    this.updateFormData.id = rec.id
    this.updateFormData.name = rec.name
    this.updateFormData.day = day
    this.updateFormData.week_days = day
    if(rec.time_slot_timings[day]){
      this.updateFormData.time_slot = rec.time_slot_timings[day].map((el:any) => {
        return {id: el.id, from_time: el.from_time.substring(0,5), to_time: el.to_time.substring(0,5), is_break: el.is_break}
      })
    }

    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title', size:'xl', windowClass: 'lecture-timings', centered: true }).result.then(
      (result) => {
        if(result == 'cancel'){
          this.clearForm();
        }
      },
    );
  }

  deleteSlot(day:any,slot_id:any){
    let confirm = window.confirm('Are you sure you want to delete this slot?')
    if(confirm){
      this.TimetableService.deleteSlot(day, slot_id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
        this.reloadData();
      })
    }
  }

  delete(id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(confirm){
      this.TimetableService.destroyTimeSlot(id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.reloadData();
        }else{
          this.toastr.showError(resp.message)
        }
      }, (error:any) => {
        console.log(error);
      })
    }
  }

  submit(){
    this.showLoading = true;
    let days = this.weeks.filter((el:any) => el.status == true).map((x:any) => x.day)
    this.formData.week_days = days
    this.TimetableService.createTimeSlot(this.formData).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        this.clearForm();
      }else{
        this.toastr.showError(resp.message)
      }
      this.reloadData();
      this.showLoading = false;
    }, ((error:any) => {
      this.errors = error.error.errors
      this.showLoading = false;
    })) 
  }

  update(){
    this.updateShowLoading = true;
    let days = this.weeks.filter((el:any) => el.status == true).map((x:any) => x.day)
    this.formData.week_days = days
    this.TimetableService.updateTimeSlot(this.updateFormData, this.updateFormData.id).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        this.clearForm();
      }else{
        this.toastr.showError(resp.message)
      }
      this.reloadData();
      this.modalService.dismissAll();
      this.updateShowLoading = false;
    }, ((error:any) => {
      this.updateErrors = error.error.errors
      this.updateShowLoading = false;
    })) 
  }

  timeFormat(time:any){
    return moment(time, "HH:mm:ss").format("hh:mm A");
  }

  add(){
    this.formData.time_slot.push({id:null, from_time: null, to_time: null, is_break: false})
  }

  modalAdd(){
    this.updateFormData.time_slot.push({id:null, from_time: null, to_time: null, is_break: false})
  }

  remove(index:any){
    this.formData.time_slot.splice(index, 1);
  }
  
  modalRemove(index:any){
    this.updateFormData.time_slot.splice(index, 1);
  }

  clearForm(){
    this.errors = [];
    this.updateErrors = [];
    this.formData.name = null,
    this.formData.week_days = [],
    this.formData.time_slot = [{from_time: null, to_time: null, is_break: false}],

    this.weeks = [
      {day : 'monday', status : false},
      {day : 'tuesday', status : false},
      {day : 'wednesday', status : false},
      {day : 'thursday', status : false},
      {day : 'friday', status : false},
      {day : 'saturday', status : false},
      {day : 'sunday', status : false},
    ]

    this.updateFormData.id = null;
    this.updateFormData.name = null;
    this.updateFormData.week_days = [];
    this.updateFormData.day = null;
    this.updateFormData.time_slot = [{id:null, from_time: null, to_time: null, is_break: false}];
  }
  //#endregion Public methods
  
  // #region Private methods
  // Add private methods if needed
  //#endregion Private methods
}
