import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-faculty-add-student-leave',
  templateUrl: './faculty-add-student-leave.component.html',
  styleUrls: ['./faculty-add-student-leave.component.scss'],
  providers:[DatePipe]
})
export class FacultyAddStudentLeaveComponent {

  STUDENT:number=1;
  FACULTY:number=2;
  public branch_id = window.localStorage?.getItem("branch");

  from_user_type:any=1;
  submitted:any=false;
  public invaineFrom:any=false;
  public invaineTo:any=false;
  public dates:any=false;
  public sd_sunday_alert = false;
  public ed_sunday_alert = false;  
  public valid = true;
  constructor(
    private leaveManagementSerivce: LeaveManagmentService,private router:Router, private datePipe: DatePipe,private fb:FormBuilder, private toastr: Toastr
  ) {
    let currentDateTime =this.datePipe.transform((new Date), 'yyyy-mm-dd')
    //this.leavecreateform.get('start_date').setValue(start_date);
    this.leavecreateform = new FormGroup({    
      start_date: new FormControl('',[Validators.required]),
      end_date: new FormControl('',[Validators.required]),      
      sender_id: new FormControl('',[Validators.required]),
      leave_type: new FormControl('',[Validators.required]),
      detail: new FormControl('',[Validators.required]),
    });
  }
  leavecreateform: FormGroup;
  ngOnInit() { 
      this.getLeaveTypeList();
      this.getAllStudent();
    
  // this.leavecreateform = this.fb.group({
  //   start_date: ['',[Validators.required]],
  // });

  // this.leavecreateform = this.fb.group({
  //   start_date: ['', [Validators.required]],
  //   end_date: ['', [Validators.required]]
  // });

  }
  URLConstants = URLConstants;
  



  student = [];
  selectedStudent = '';

Faculty = [];
cities = [];
selectedFaculty = '';
selectedCity    = '';

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
      this.selected_id =val;
    }
    onSubmit() {
      this.submitted=true;
      this.valid=true;
      let start_date=this.leavecreateform.value.start_date;
      let end_date=this.leavecreateform.value.end_date;

      let c= new Date();
      if(new Date(start_date)< c )
      {          
        this.invaineFrom=true;    this.valid=false;    
      }else{
        this.invaineFrom=false;
      }
      if(new Date(end_date) < c )
      {
        this.invaineTo=true;       this.valid=false; 
      }else{
        this.invaineTo=false;
      }
      if (start_date > end_date ) {          
            this.dates=true;           this.valid=false;        
      }else{
        this.dates=false;
      }      

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
      const payload = {
        "sender_id":this.selectedFaculty,
        "start_date": this.datePipe.transform(start_date, 'dd-MM-yyyy'),
        "end_date": this.datePipe.transform(end_date, 'dd-MM-yyyy'),
        "leave_type": this.leavecreateform.value.leave_type,
        "detail": this.leavecreateform.value.detail	,
        "branch_id":this.branch_id,
      } 
      console.log(payload);
    
      if(this.valid){      
        this.addStudentLeaveByAdmin(payload);
      }
           
    }

    getAllStudent(){
      this.leaveManagementSerivce.getAllStudentByClassTeacher().subscribe((res:any) => {
       //this.student=res.data;   
       this.Faculty=res.data;   
       this.selectedFaculty = res.data[0].id;
       this.selected_id== res.data[0].id;
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
          this.router.navigate([this.setUrl(URLConstants.FACULTY_STUDENT_LEAVEL_LIST)]);
        }    
      });    
    }
    getLeaveTypeList(){      
      this.leaveManagementSerivce.getLeaveTypeList(1).subscribe((res:any) => {
        if(res.status==true){          
         this.student = res.data;
         this.selectedStudent = res.data[0].name;
        }    
      });       
    } 
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }

}
