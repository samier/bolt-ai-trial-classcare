import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';

@Component({
  selector: 'app-student-leave-edit-form',
  templateUrl: './student-leave-edit-form.component.html',
  styleUrls: ['./student-leave-edit-form.component.scss']
})
export class StudentLeaveEditFormComponent {
  id:any;
  rejected=false;
  //user_type:any;
  leavecreateform:any;
  submitted:any=false;
  public invaineFrom:any=false;
  public invaineTo:any=false;
  public dates:any=false;
  public valid = true;
  public login_id:any=4;
  public reject_reason='';
  public sd_sunday_alert = false;
  public ed_sunday_alert = false;  
  public read_only=false;

  URLConstants = URLConstants;
  constructor(private leaveManagementSerivce: LeaveManagmentService,private route: ActivatedRoute,private datePipe: DatePipe,public fb: FormBuilder,private toastr:Toastr,private router:Router) {
    this.id = this.route.snapshot.paramMap.get('id');
      console.log(this.id);
      this.leavecreateform = new FormGroup({
        start_date: new FormControl('',[Validators.required]),
        end_date: new FormControl('',[Validators.required]),      
        leave_type: new FormControl('',[Validators.required]),
        detail: new FormControl('',[Validators.required]),
        reject_reason: new FormControl(''),
      });               
  }
  public selected_id:any;
  public user_type_edit:any;

  student = [];
  selectedStudent = '';

  Faculty = [];
  selectedFaculty ='';
  changeFn(val:any){
    this.selected_id =val;
  }
  ngOnInit() {   
    this.getLeaveTypeList();
    this.leaveManagementSerivce.getStudentLeaveDetail(this.id).subscribe((res:any) => {
      console.log(res);    
      let start_date = this.datePipe.transform(res.data.start_date,'yyyy-MM-dd');    
      let end_date = this.datePipe.transform(res.data.end_date,'yyyy-MM-dd');    
      this.leavecreateform.get('start_date').setValue(start_date);
      this.leavecreateform.get('end_date').setValue(end_date);
      this.leavecreateform.get('detail').setValue(res.data.detail);
      this.leavecreateform.get('leave_type').setValue(res.data.leave_type);
      // this.leavecreateform.get('user_type').select(1);
  
      if(res.data.status==1){
        this.read_only = true;
        this.leavecreateform.get('leave_type').disable();
      }
      if(res.data.status==2){
        this.rejected=true;
        this.leavecreateform.get('reject_reason').setValue(res.data.reject_reason);
        this.reject_reason = res.data.reject_reason;
      }
      this.user_type_edit=1;
      
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
    
    const payload = {
      "sender_id":this.login_id,
      "start_date": this.datePipe.transform(this.leavecreateform.value.start_date, 'dd-MM-yyyy'),
      "end_date": this.datePipe.transform(this.leavecreateform.value.end_date, 'dd-MM-yyyy'),
      "leave_type": this.leavecreateform.value.leave_type,
      "detail": this.leavecreateform.value.detail	
    } 
    console.log(payload);
    if(this.valid){
      //Student Leave Add
      this.updateStudentLeave(this.id,payload);     
    }else{
      //Faculty Leave Add
    }
    return 0; 
  }
  updateStudentLeave(id:any,payload:any){
    this.leaveManagementSerivce.updateStudentLeave(payload,id).subscribe((res:any) => {
      console.log(res); 
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([URLConstants.STUDENT_LEAVE_LIST]);
      }           
    });    
  }

  getLeaveTypeList(){      
    this.leaveManagementSerivce.getLeaveTypeListForStudent().subscribe((res:any) => {
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
