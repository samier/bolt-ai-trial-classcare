import { Component, OnInit, ViewChild } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { HostelManagementService } from '../hostel-management.service';

@Component({
  selector: 'app-hostel-student-transfer',
  templateUrl: './hostel-student-transfer.component.html',
  styleUrls: ['./hostel-student-transfer.component.scss']
})
export class hostelStudentTransferComponent {
  URLConstants = URLConstants;
  
    constructor(
      private HostelManagementService: HostelManagementService,
      private toastr: Toastr,
    ) {}
    
    dropdownSettings: IDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'room_number',
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };

    studentDropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'full_name',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };

    yearDropdownSettings: IDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'year',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };

    from_year:any = '';
    rooms:any = [];
    selectedRoom:any = [];

    students:any = [];
    selectedStudent:any = [];

    years:any = [];
    selectedYear:any = null;

    applicable_fees = 'new'
    allotment_date:string | null= null
    left_date :string | null = null

    transferLoading = false;

  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.getRooms();
    }

    transfer(){
      this.transferLoading = true;
      if(this.selectedStudent.length == 0){
        this.transferLoading = false;
        return this.toastr.showInfo('Please select students', 'INFO');
      }

      if(this.selectedYear == null){
        this.transferLoading = false;
        return this.toastr.showInfo('Please select year', 'INFO');
      }
      let data = {
        room_id: this.selectedRoom,
        student_id: this.selectedStudent,
        transfer_academic_year : this.selectedYear,
        applicable_fees: this.applicable_fees,
        allotment_date: this.allotment_date,
        left_date : this.left_date
      }
      this.HostelManagementService.transferStudent(data).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
        this.clear();
        this.transferLoading = false;
      }, (error:any ) => {
        console.log(error);
        this.toastr.showError('Something went wong.')
        this.clear();
        this.transferLoading = false;
      })
      
    }

    getRooms(){
      this.HostelManagementService.getRooms().subscribe((resp:any) => {
        if(resp.status){
          this.rooms = resp.data.rooms
          this.from_year = resp.data.academic_year.year
          this.years = resp.data.years
        }
      })
    }

    getRoomStudent(){
      let data = {
        room_id : this.selectedRoom,
        year: this.selectedYear,
      }

      this.HostelManagementService.getRoomStudent(data).subscribe((resp:any) => {
        if(resp.status){
          this.students = resp.data
        }
      })
    }
  
    handleRoomChange(){
      this.selectedStudent = [];
      // this.students = [];
      this.getRoomStudent();
    }

    handleFees(value:any){
      this.applicable_fees = value
    }

    handleYearChange(){
        let year = this.years.find((x:any) => x.id == this.selectedYear);
        this.allotment_date = year.start_time
        this.left_date = year.end_time
        this.getRoomStudent();
    }

    clear(){
      this.selectedRoom = null
      this.selectedStudent = [];
      this.students = [];
      this.selectedYear = null;
      this.applicable_fees = 'new';
      this.allotment_date = null;
      this.left_date = null;
    }
} 
