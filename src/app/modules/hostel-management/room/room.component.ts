import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, CdkDropList, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  URLConstants = URLConstants;
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private HostelManagementService: HostelManagementService,
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      public CommonService: CommonService,
    ) {}
    errors:any = [];
    room_id:any = '';
    button = 'Submit';
    Hostels = [];
    selectedHostel:any = null;
    wings = [];
    wing_id = null;
    floor_id = null;
    roomTypes = [];
    floors:any = [];
    facilities = [
      {id: 0, name: 'AC'},
      {id: 1, name: 'Bathroom'},
      {id: 2, name: 'Gym'},
    ]

    months = [{month:'January', disable:false}, {month:'February', disable:false}, {month:'March', disable:false}, {month:'April', disable:false}, {month:'May', disable:false}, {month:'June', disable:false}, {month:'July', disable:false}, {month:'August', disable:false}, {month:'September', disable:false}, {month:'October', disable:false}, {month:'November', disable:false}, {month:'December', disable:false}]

    form:any = this.fb.group({
      hostel_id: [null,[Validators.required]],
      wing_id: [null,[Validators.required]],
      floor_id: [null,[Validators.required]],
      room_type_id: [null,[Validators.required]],
      room_number: ['',[Validators.required]],
      // no_of_room: ['',[Validators.required, Validators.pattern('[0-9]*$')]],
      no_of_students_per_room: ['',[Validators.required, Validators.pattern('[0-9]*$')]],
      // facility: [0,[Validators.required]],
      status: [1,[Validators.required]],
    });

    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.getHostelList();
      this.roomTypeList();
      this.room_id = this.activatedRouteService.snapshot.params['id'];
      if(this.room_id){
        this.button = 'Update'

        this.HostelManagementService.getRoom(this.room_id).subscribe((resp:any) => {
          if(resp.status){
            this.selectedHostel = resp.data.hostel_id;
            this.wing_id = resp.data.wing_id
            this.getWingList()
            this.handleWingChange()
            this.form.patchValue({
              hostel_id: resp.data.hostel_id,
              wing_id: resp.data.wing_id,
              floor_id: resp.data.floor_id,
              room_type_id: resp.data.room_type_id,
              room_number: resp.data.room_number,
              no_of_students_per_room: resp.data.no_of_students_per_room,
              status: resp.data.status,
            }); 
            }
          },
        (error:any) => {
          this.toastr.showError('Record not found.')
          this.router.navigate([this.setUrl(URLConstants.ROOM_LIST)]);  
        })
      }
    }

    getHostelList(){
      this.HostelManagementService.getHostelDropdownList().subscribe((resp:any) => {
        if(resp.status){
          this.Hostels = resp.data
        }
      })
    }

    roomTypeList(){
      this.HostelManagementService.roomTypeList().subscribe((resp:any) => {
        if(resp.status){
          this.roomTypes = resp.data;
        }
      })
    }

    handleWingChange(){
      this.floor_id = null;
      this.HostelManagementService.floorList(this.wing_id).subscribe((resp:any) => {
        if(resp.status){
          this.floors = resp.data;
        }
      })
    }

    get gradeDetailFieldAsFormArray(): any {
      return this.form.get('month_wise_rent') as FormArray;
    }
  
    get_month(i:number): any {
      return this.gradeDetailFieldAsFormArray.controls?.[i]?.controls?.month;
    }
  
    get_amount(i:number): any {
      return this.gradeDetailFieldAsFormArray.controls?.[i]?.controls?.amount;
    }

  
    getGradeDetail(): any {
      return this.fb.group({
        month: this.fb.control('',[Validators.required]),
        amount: this.fb.control('',[Validators.required, Validators.pattern('[0-9]*$')]),
      });
    }
  
    addRowControl(): void {
      this.gradeDetailFieldAsFormArray.push(this.getGradeDetail());
    }
  
    remove(i: number): void {    
      let month = this.gradeDetailFieldAsFormArray.at(i).value.month
      this.months.forEach(monthObj => {
        if (monthObj.month == month) {
            monthObj.disable = false;
        }
    });
      this.gradeDetailFieldAsFormArray.removeAt(i);
    }
    

    handleMonth(){
      this.months.forEach(monthObj => {
        const foundMonth = this.form.value.month_wise_rent?.find(targetMonth => targetMonth.month === monthObj.month);
        monthObj.disable = foundMonth ? true : false;
    });
    }
    submit(){
      const transformedObject = this.form.value.month_wise_rent?.reduce((acc:any, item:any) => {
        acc[item.month] = parseInt(item.amount, 10);
        return acc;
    }, {});
      this.form.value.month_wise_rent = transformedObject
      this.form.value.id = this.room_id
      if(this.room_id){
        this.HostelManagementService.updateRoomDetail(this.form.value, this.room_id).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.router.navigate([this.setUrl(URLConstants.ROOM_LIST)]);  
          }else{
            this.errors = resp.message
            this.toastr.showError(resp.message)
          }   
        })
      }else{
        this.HostelManagementService.createRoomDetail(this.form.value).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.router.navigate([this.setUrl(URLConstants.ROOM_LIST)]);  
          }else{
            this.errors = resp.message
            this.toastr.showError(resp.message)
          }   
        })
      }
    }

    getWingList(){
      let data = {
        hostel_id : this.selectedHostel
      };
      this.HostelManagementService.wingList(data).subscribe((resp:any) => {
        if(resp.status){
          this.wings = resp.data
        }
      })
    }

    handleHostelChange(){
      this.wing_id = null;
      this.floor_id = null;
      this.floors = [];
      this.getWingList()
    }
}
