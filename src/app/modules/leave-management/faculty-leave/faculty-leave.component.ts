import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl }  from '@angular/forms';
import { LeaveManagmentService } from '../leave-managment.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faculty-leave',
  templateUrl: './faculty-leave.component.html',
  styleUrls: ['./faculty-leave.component.scss']
})
export class FacultyLeaveComponent {

  submitted:any=false;
  public invaineFrom:any=false;
  public invaineTo:any=false;
  public dates:any=false;
  public valid = true;
  public sd_sunday_alert = false;
  public ed_sunday_alert = false;  
  public login_id:any=1;
    constructor(
      private leaveManagementSerivce: LeaveManagmentService,private datePipe: DatePipe, private toastr:Toastr,private router:Router
    ) {
      this.leavecreateform = new FormGroup({
        start_date: new FormControl(''),
        end_date: new FormControl(''),      
        leave_type: new FormControl(''),
        detail: new FormControl(''),
      });
    }
  
    URLConstants = URLConstants;
      
    leavecreateform: FormGroup;
    student = [];
    selectedStudent = '';

    ngOnInit() {       
      this.getLeaveTypeList();
    }

    public paraUpdateLeave:any = {}  ;
  
    public deleted_id=1;
    public sender_id=1;
    public id=4;
  
  
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
          //Faculty Leave Add
          this.addFacultyLeave(payload);  
        }               
      }
  
      addFacultyLeave(payload:any)
      {
        this.leaveManagementSerivce.addFacultyLeave(payload).subscribe((res:any) => {
          console.log(res);  
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            this.router.navigate([this.setUrl(URLConstants.FACULTY_LEAVE_LIST)]);
          }              
        });    
      }

      getLeaveTypeList(){      
        this.leaveManagementSerivce.getLeaveTypeList(2).subscribe((res:any) => {
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
