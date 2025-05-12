import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { FormBuilder, FormGroup, FormControl,Validators }  from '@angular/forms';
import { LeaveManagmentService } from '../leave-managment.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-admin-leave-edit-form',
  templateUrl: './admin-leave-edit-form.component.html',
  styleUrls: ['./admin-leave-edit-form.component.scss'],
  providers:[DatePipe]
})
export class AdminLeaveEditFormComponent implements OnInit{
  id:any;
  //user_type:any;
  isSuperAdmin:any = window.localStorage.getItem("role")?.includes('ROLE_ADMIN');
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

  
 student = [];
 selectedStudent = '';

  public read_only = false;
  URLConstants=URLConstants;
  public leave_status_val:any ='';
  constructor(private leaveManagementSerivce: LeaveManagmentService,private route: ActivatedRoute,private datePipe: DatePipe,public fb: FormBuilder,private router:Router,private toastr:Toastr, public CommonService: CommonService,private cdr: ChangeDetectorRef) {
    this.id = this.route.snapshot.paramMap.get('id');
      //console.log(this.id);
      this.leavecreateform = new FormGroup({
        user_type: new FormControl(null),
        start_date: new FormControl('',[Validators.required]),
        end_date: new FormControl('',[Validators.required]),      
        sender_id: new FormControl(''),
        leave_type: new FormControl('',[Validators.required]),
        leave_status: new FormControl('',[Validators.required]),
        detail: new FormControl('',[Validators.required]),
        reject_reason: new FormControl(''),       
        attachment: new FormControl(''),                  
        duration: new FormControl('1'),                  
      });               
  }
  public selected_id:any;
  public user_type_edit:any;
  public leave_status:any;
  attachment:any = null

  changeLeaveStatus(val:any){
    this.leave_status = val;
    if(val == 2){
      this.rejected = true;
      //console.log(this.rejected);
    }else{
      this.rejected = false;
    }
  }

  Faculty = [];
  selectedFaculty ='';
  changeFn(val:any){
    this.searchText = '';
    this.cdr.detectChanges();
    this.searchFilter();
    this.selected_id =val;
  }
  ngOnInit() {   
    
    this.leaveManagementSerivce.getLeaveDetail(this.id).subscribe((res:any) => {
      //console.log(res);  
      if(res?.data?.student_leave[0]){
        this.getAllStudent(res.data.student_leave[0]?.id);
      }else{
        this.getAllFaculty(res.data.user_leave[0]?.id);
      }  
      this.selectedFaculty = res.data?.student_leave?.[0]?.id??res.data?.user_leave?.[0]?.id;
      this.cdr.detectChanges();
      let start_date = this.datePipe.transform(res.data.start_date,'yyyy-MM-dd');    
      let end_date = this.datePipe.transform(res.data.end_date,'yyyy-MM-dd');    
      this.leavecreateform.get('start_date').setValue(start_date);
      this.leavecreateform.get('end_date').setValue(end_date);
      this.leavecreateform.get('detail').setValue(res.data.detail);
      this.leavecreateform.get('leave_type').setValue(res.data.leave_type);
      this.leavecreateform.get('leave_status').setValue(res.data.status);
      // this.leavecreateform.get('duration').setValue(res.data.duration.toString());
      this.leave_status_val = res.data.status;
      
      this.read_only = res.data[0];
      // this.attachment = res.data.attachment
      //console.log(this.read_only);
      //console.log('test');

      if(res.data.status == 2){
        this.rejected = true;
        this.leavecreateform.get('reject_reason').setValue(res.data.reject_reason);
        this.reject_reason = res.data.reject_reason;
      }
      this.user_type_edit=1;
      //console.log(res.data.student_leave[0]);
      if(res.data.student_leave[0]){        
           this.user_type_edit=1;
        }else{
            this.user_type_edit=2;
          } 
          this.getLeaveTypeList();
        
        const userId = localStorage.getItem('user_id');
        const selectedUserId = res.data.student_leave.length > 0 ? res?.data?.student_leave[0]?.id : res?.data?.user_leave[0]?.id 
        this.user_type_edit = userId == selectedUserId ? 3 : this.user_type_edit

      if (this.user_type_edit !== 3) {
        this.leavecreateform.controls['sender_id'].setValidators([Validators.required]);
      } else {
        this.leavecreateform.controls['sender_id'].clearValidators();
      }
      this.leavecreateform.controls['sender_id'].updateValueAndValidity();
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

    let startDate:any = this.datePipe.transform(this.leavecreateform.value.start_date, 'dd-MM-yyyy');
      let endDate:any = this.datePipe.transform(this.leavecreateform.value.end_date, 'dd-MM-yyyy');
      const formData = new FormData();
      const userId:any = localStorage.getItem('user_id');
      formData.append('sender_id', this.user_type_edit == 3 ? userId : this.selectedFaculty)
      formData.append('start_date', startDate)
      formData.append('end_date', endDate)
      formData.append('leave_type', this.leavecreateform.value.leave_type)
      formData.append('detail', this.leavecreateform.value.detail)
      formData.append('status', this.leavecreateform.value.leave_status)
      formData.append('duration', this.leavecreateform.value.duration??"1")
      formData.append('reject_reason', re_resoan??"")
      if(this.attachment){
        formData.append('attachment', this.attachment)
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
    //console.log(payload);
    if(this.user_type_edit == 1 && this.valid){
      //Student Leave Add
      this.updateStudentLeaveByAdmin(this.id,formData);

    }else if(this.valid){
      //Faculty Leave Add
      //console.log("here");
      this.updateFacultyLeave(this.id,formData);
    }
    return 0; 
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.attachment = file;
    }
    
  }

  moveObjectToStart(arr: any[], targetId: number) {
    const fromIndex = arr?.findIndex(item => item.id === targetId);
    if (fromIndex === -1) {
      return arr; 
    }
    const [movedItem] = arr?.splice(fromIndex, 1);
    this.cdr.detectChanges();  
    arr.splice(0, 0, movedItem);
    return arr;
  }

  getAllStudent(id:any){
    this.leaveManagementSerivce.getAllStudent().subscribe((res:any) => {
     //this.student=res.data;   
     this.Faculty=res.data; 
     this.moveObjectToStart(this.Faculty,id);
     this.loadItems(); 
    //  if(id)
    //  this.selectedFaculty = id;
    //  else
    //  this.selectedFaculty = res.data[0].id;
    }); 
  }

  getAllFaculty(id:any){
    this.leaveManagementSerivce.getAllEmployee().subscribe((res:any) => {
     //this.student=res.data;   
     this.Faculty=res.data;   // res.data[0].id;
     this.moveObjectToStart(this.Faculty,id); 
     this.loadItems();
    //   if(id)
    //   this.selectedFaculty = id;
    //   else
    //   this.selectedFaculty = res.data[0].id;
    }); 
  } 

  updateStudentLeaveByAdmin(id:any,payload:any){
    this.leaveManagementSerivce.updateStudentLeaveByAdmin(payload,id).subscribe((res:any) => {     
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.LEAVES_LIST)]);
      }        
    });    
  }

  updateFacultyLeave(id:any,payload:any){
    this.leaveManagementSerivce.updateFacultyLeave(payload,id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message); 
        this.router.navigate([this.setUrl(URLConstants.LEAVES_LIST)]);
      }           
    });    
  }  

  updateDropdown(type:number){    
    if(type==1){
      this.getAllStudent(null);
    }
    else if(type==2){
      this.getAllFaculty(null);
    }  
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getLeaveTypeList(){      
    this.leaveManagementSerivce.getLeaveTypeList(this.user_type_edit).subscribe((res:any) => {    
      if(res.status==true){          
       this.student = res.data;
      //  this.selectedStudent = res.data[0].name;
      }    
    });       
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
