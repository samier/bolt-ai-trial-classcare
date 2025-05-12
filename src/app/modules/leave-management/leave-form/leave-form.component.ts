import { DatePipe } from '@angular/common';
import { Component,OnInit, ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormGroup, FormControl,Validators }  from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';
import { LeaveManagmentService } from '../leave-managment.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-leave-form',
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.scss'],
  providers:[DatePipe]
})



export class LeaveFormComponent implements OnInit{

  STUDENT:number=1;
  FACULTY:number=2;
  public branch_id = window.localStorage?.getItem("branch");

  from_user_type:any=0;
  submitted:any=false;
  public invaineFrom:any=false;
  public invaineTo:any=false;
  public dates:any=false;
  public valid = true;
  public sd_sunday_alert = false;
  public ed_sunday_alert = false;
  constructor(
    private leaveManagementSerivce: LeaveManagmentService,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr,
    public CommonService : CommonService,
    private cdr: ChangeDetectorRef,
  ) {
    let currentDateTime =this.datePipe.transform((new Date), 'yyyy-mm-dd')
    //this.leavecreateform.get('start_date').setValue(start_date);
    this.leavecreateform = new FormGroup({
      user_type: new FormControl(''),
      start_date: new FormControl('',[Validators.required]),
      end_date: new FormControl('',[Validators.required]),      
      sender_id: new FormControl(''),
      leave_type: new FormControl('',[Validators.required]),
      detail: new FormControl('',[Validators.required]),
      attachment: new FormControl(''),
      duration: new FormControl('1'),
    });
  }
  leavecreateform: FormGroup;
  ngOnInit() {
      // this.getAllStudent();
      // this.getLeaveTypeList(1);
  }
  URLConstants = URLConstants;
  attachment:any = null
  


  student = [];

selectedStudent = '';

Faculty = [];

cities = [
    {
        id: 1,
        name: 'Vilnius'
    },
    { id: 2, name: 'Kaunas' },
    {
        id: 3,
        name: 'Pavilnys'
    },
    {
        id: 4,
        name: 'Siauliai'
    },
];

selectedFaculty = '';
selectedCity    = this.cities[0].name;

  public paraUpdateLeave:any = {
    "sender_id":1,
    "start_date": "02-03-2023",
    "end_date": "02-03-2023",
    "leave_type": "seekLeave",
    "detail": "testing purpose update api"    
  }  

  public deleted_id=1;
  public sender_id=1;
  public selected_id=4;
  public id=4;
    changeFn(val:any){
      this.searchText = '';
      this.cdr.detectChanges();
      this.searchFilter();
      this.selected_id =val;
    }
    onSubmit() {
      this.submitted=true;
      this.valid=true;
      let start_date=this.leavecreateform.value.start_date;
      let end_date=this.leavecreateform.value.end_date;

      if(end_date < start_date){
        this.dates = true;
        this.valid=false;
      }
      // let c= new Date();
      // if(new Date(start_date)< c )
      // {          
      //   this.invaineFrom=true;    this.valid=false;    
      // }else{
      //   this.invaineFrom=false;
      // }
      // if(new Date(end_date) < c )
      // {
      //   this.invaineTo=true;       this.valid=false; 
      // }else{
      //   this.invaineTo=false;
      // }
      // if (start_date > end_date ) {          
      //       this.dates=true;           this.valid=false;        
      // }else{
      //   this.dates=false;
      // }      

      var day1 = new Date(start_date).getUTCDay();
      var day2 = new Date(end_date).getUTCDay();

      this.sd_sunday_alert=false;
      if([0].includes(day1)){
        this.sd_sunday_alert=true;
        this.valid=false;  
      }

      this.ed_sunday_alert=false;
      if([0].includes(day2)){
        this.ed_sunday_alert=true;
        this.valid=false;  
      }      

      console.log(this.leavecreateform.value);
      //console.log(this.Faculty);

      let startDate:any = this.datePipe.transform(start_date, 'dd-MM-yyyy');
      let endDate:any = this.datePipe.transform(end_date, 'dd-MM-yyyy');
      let branch_id:any = this.branch_id;
      const userId:any = localStorage.getItem('user_id');
      const formData = new FormData();
      formData.append('sender_id', this.from_user_type == 3 ? userId : this.selectedFaculty)
      formData.append('start_date', startDate)
      formData.append('end_date', endDate)
      formData.append('leave_type', this.leavecreateform.value.leave_type)
      formData.append('detail', this.leavecreateform.value.detail)
      formData.append('branch_id', branch_id)
      formData.append('attachment', this.attachment)
      formData.append('duration', this.leavecreateform?.value?.duration)

      const payload = {
        "sender_id":this.selectedFaculty,
        "start_date": this.datePipe.transform(start_date, 'dd-MM-yyyy'),
        "end_date": this.datePipe.transform(end_date, 'dd-MM-yyyy'),
        "leave_type": this.leavecreateform.value.leave_type,
        "detail": this.leavecreateform.value.detail	,
        "branch_id":this.branch_id,
      } 
    
      if(this.leavecreateform.value.user_type == 1 && this.valid){
        //Student Leave Add
        this.addStudentLeaveByAdmin(formData);
      }else if(this.valid){
        //Faculty Leave Add
        this.addFacultyLeave(formData);
      }
      return 0;          
    }

    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.attachment = file;
      }
      
    }

    getAllStudent(){
      this.resetScroll();  
      this.searchText = '';
      this.leaveManagementSerivce.getAllStudent().subscribe((res:any) => {
       //this.student=res.data;   
       this.Faculty=res.data; 
       this.loadItems();
       if(res.data != undefined){
        this.selectedFaculty = res.data[0]?.id;
        this.selected_id== res.data[0]?.id;
       }
      }); 
    }

    getAllFaculty(){
      this.resetScroll();
      this.searchText = ''; 
      this.leaveManagementSerivce.getAllEmployee().subscribe((res:any) => {
       //this.student=res.data;
       this.Faculty=res.data;  
       this.loadItems();
       if(res.data != undefined){
        this.selectedFaculty = res.data[0]?.id;
        this.selected_id== res.data[0]?.id;
       }

      }); 
    }    
    

    getStudentList(){
      this.leaveManagementSerivce.getStudentList(this.sender_id).subscribe((res) => {
        console.log(res);    
      }); 
    }
    addStudentLeaveByAdmin(payload:any)
    {
      this.leaveManagementSerivce.addStudentLeaveByAdmin(payload).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.toastr.showSuccess(res.message);
          this.router.navigate([this.setUrl(URLConstants.LEAVES_LIST)]);
        }    
      });    
    }

    addFacultyLeave(payload:any)
    {
      this.leaveManagementSerivce.addFacultyLeave(payload).subscribe((res:any) => {
        if(res.status==false){          
          this.toastr.showError(res.message);
        }else{
          this.toastr.showSuccess(res.message);
          this.router.navigate([this.setUrl(URLConstants.LEAVES_LIST)]);
        }        
      });    
    }

    getLeaveTypeList(type:any){      
      this.leaveManagementSerivce.getLeaveTypeList(type).subscribe((res:any) => {
        if(res.status==true){          
         this.student = res.data;
         if(res.data[0] != undefined){
          this.selectedStudent = res.data[0]?.name;
          this.leavecreateform.controls['leave_type'].patchValue(res.data[0]?.name)
         }else{
          this.selectedStudent = '';
         }
        }    
      });       
    }
    updateDropdown(type:number){
      if(type==1){
        this.getAllStudent();
      }
      else if(type==2){
        this.getAllFaculty();
      }
      this.getLeaveTypeList(type == 3 ? 2 : type);
      
      if (type !== 3) {
        this.leavecreateform.controls['sender_id'].setValidators([Validators.required]);
      } else {
        this.leavecreateform.controls['sender_id'].clearValidators();
      }
      this.leavecreateform.controls['sender_id'].updateValueAndValidity();   
    }
    // updateStudentLeave()
    // {
    //   this.leaveManagementSerivce.updateStudentLeave(this.paraUpdateLeave,this.id).subscribe((res) => {
    //     console.log(res);    
    //   });    
    // }
   
    // deleteStudentLeave(){
    //   this.leaveManagementSerivce.deleteStudentLeave(this.deleted_id).subscribe((res) => {
    //     console.log(res);    
    //   }); 
    // }    
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }

    pageSize = 50; 
    currentPage = 0;
    users:any = [];
    searchText:any;

    resetScroll(){
      this.pageSize = 50; 
      this.currentPage = 0;
      this.users = [];
    }
    
    loadItems() {
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      var newItems;
      if(this.searchText){
        newItems = this.Faculty.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) );
        newItems = newItems?.slice(startIndex, endIndex);
      }else{
        newItems = this.Faculty.slice(startIndex, endIndex);
      }      
      this.users = [...this.users, ...newItems];
      this.currentPage++;
    }

    onScroll(event:any) {
      var Faculty_length = 0;
      if(this.searchText){
        Faculty_length = this.Faculty.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) ).length; 
      }else{
        Faculty_length = this.Faculty?.length;
      }
      if(Faculty_length > 0 && this.users?.length > 0 && this.users?.length < Faculty_length && event.end == this.users?.length){
        this.loadItems();
      }
    }

    searchFilter(){
      this.resetScroll();
      this.loadItems();
    }
}

