import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-faculty-edit-student-leave',
  templateUrl: './faculty-edit-student-leave.component.html',
  styleUrls: ['./faculty-edit-student-leave.component.scss']
})
export class FacultyEditStudentLeaveComponent {
  id:any;
  //user_type:any;
  leavecreateform:any;
  submitted:any=false;
  public invaineFrom:any=false;
  public invaineTo:any=false;
  public dates:any=false;
  public valid = true;
  public sd_sunday_alert = false;
  public ed_sunday_alert = false;  
  public rejected = false;
  public reject_reason = '';
  public read_only = false;
  URLConstants=URLConstants;
  
public leave_status_val='';

  constructor(private leaveManagementSerivce: LeaveManagmentService,private route: ActivatedRoute,private datePipe: DatePipe,public fb: FormBuilder,private toastr:Toastr,private router:Router, public CommonService: CommonService) {
    this.id = this.route.snapshot.paramMap.get('id');
      console.log(this.id);
      this.leavecreateform = new FormGroup({
        user_type: new FormControl(''),
        start_date: new FormControl('',[Validators.required]),
        end_date: new FormControl('',[Validators.required]),      
        sender_id: new FormControl('',[Validators.required]),
        leave_type: new FormControl('',[Validators.required]),
        leave_status: new FormControl('',[Validators.required]),
        detail: new FormControl('',[Validators.required]),        
        reject_reason: new FormControl(''),        
      });               
  }
  public selected_id:any;
  public user_type_edit:any;
  public leave_status:any;
  Faculty = [];
  selectedFaculty ='';

  student = [];
  selectedStudent = '';

  changeLeaveStatus(val:any){
    this.leave_status = val;
    if(val == 2){
      this.rejected = true;
      console.log(this.rejected);
    }else{
      this.rejected = false;
    }
  }

  changeFn(val:any){
    this.selected_id =val;
  }  
  ngOnInit() {   

    this.leaveManagementSerivce.getLeaveDetail(this.id).subscribe((res:any) => {
      console.log(res);  
      console.log('here');
      if(res?.data?.student_leave[0]){
        this.getAllStudent(res.data.student_leave[0].id);
        console.log(res.data.student_leave[0].id);        
        this.selectedFaculty = res.data.student_leave[0].id;
      }
      let start_date = this.datePipe.transform(res.data.start_date,'yyyy-MM-dd');    
      let end_date = this.datePipe.transform(res.data.end_date,'yyyy-MM-dd');    
      this.leavecreateform.get('start_date').setValue(start_date);
      this.leavecreateform.get('end_date').setValue(end_date);
      this.leavecreateform.get('detail').setValue(res.data.detail);
      this.leavecreateform.get('leave_type').setValue(res.data.leave_type);
      this.leavecreateform.get('leave_status').setValue(res.data.status);
      this.leave_status_val = res.data.status;
      // this.leavecreateform.get('user_type').select(1);

      this.read_only = res.data[0];

      if(res.data.status == 2){
        this.reject_reason = res.data.reject_reason;
        this.leavecreateform.get('reject_reason').setValue(res.data.reject_reason);
        this.rejected = true;
      }

      this.user_type_edit=1;
      //console.log(res.data.student_leave[0]);
      if(res.data.student_leave[0]){        
           this.user_type_edit=1;
      }

      if(res.data.status == 2){
        this.rejected = true;
      }
      this.getLeaveTypeList();
      //this.leavecreateform.get('sender_id').setValue(res.data.student_leave[0].id);     
      //let item = this.leavecreateform.get('sender_id').itemsList.findByLabel('id of the item');
    }); 
  }


  onSubmit() {

    this.submitted=true;
    this.valid=true;
    let start_date=this.leavecreateform.value.start_date;
    let end_date=this.leavecreateform.value.end_date;

    let c= new Date();
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


    let re_resoan=''    
    if(this.leavecreateform.value.leave_status==2){
      re_resoan=this.leavecreateform.value.reject_reason;
    }

    const payload = {
      "sender_id":this.leavecreateform.value.sender_id,
      "start_date": this.datePipe.transform(this.leavecreateform.value.start_date, 'dd-MM-yyyy'),
      "end_date": this.datePipe.transform(this.leavecreateform.value.end_date, 'dd-MM-yyyy'),
      "leave_type": this.leavecreateform.value.leave_type,
      "status": this.leavecreateform.value.leave_status,
      "detail": this.leavecreateform.value.detail,	
      "reject_reason": re_resoan,	
    } 
    console.log(payload);
    if(this.valid){
      //Student Leave Addss
      this.updateStudentLeaveByFaculty(this.id,payload);
    }

    return 0; 
  }

  getAllStudent(id:any){
    this.leaveManagementSerivce.getAllStudentByClassTeacher().subscribe((res:any) => {
     console.log(res.data);   
     this.Faculty=res.data;   
     if(id)
     this.selectedFaculty = id;
     else
     this.selectedFaculty = res.data[0].id;
    }); 
  }

  updateStudentLeaveByFaculty(id:any,payload:any){
    this.leaveManagementSerivce.updateStudentLeaveByFaculty(payload,id).subscribe((res:any) => {
      console.log(res);    
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.FACULTY_STUDENT_LEAVEL_LIST)]);
      }        
    });    
  }

  getLeaveTypeList(){      
    this.leaveManagementSerivce.getLeaveTypeList(this.user_type_edit).subscribe((res:any) => {
      console.log(res);
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
