import { Component } from '@angular/core';
import { FormBuilder,FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../hra.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-assign-leave-role',
  templateUrl: './assign-leave-role.component.html',
  styleUrls: ['./assign-leave-role.component.scss']
})
export class AssignLeaveRoleComponent {

  submitted:any=false;
  public role_id:any=0;
  public role:any = 'Admin';
  public valid = true;  
  public tbody:any=[];
  public leave_type_list:any=[];
  // rolecreateform: FormGroup;
  productForm: FormGroup;  
  addedLeaveType:any=[];
  constructor(
    private HraService: HraService,private router:Router,private route: ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.role_id = this.route.snapshot.paramMap.get('id');
    // this.rolecreateform = new FormGroup({
    //   name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z ]*$/)]),
    // });       
    
    this.productForm = this.fb.group({           
      oldRecords: this.fb.array([]),  
      newRecords: this.fb.array([]),  
    });  
  }

  ngOnInit() {
    this.setLeaveType();
    this.HraService.getRoleHasLeaveType(this.role_id).subscribe((res:any) => {
      let s = res.data.related_leave_type.length;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      this.tbody=res.data;
      //let add = [];
      //this.add(this.tbody.related_leave_type);
      for(let i=0;i<s;i++){
        let h = this.fb.group({  
          leave_type2: this.tbody.related_leave_type[i].leave_type.id,  
          leave_number2: this.tbody.related_leave_type[i].total_leave,       
          per_month_allowed_leave2:this.tbody.related_leave_type[i].per_month_allowed_leave,          
        });  
       this.addedLeaveType.push(this.tbody.related_leave_type[i].leave_type.id);
        this.oldRecords().push(h);
      }

      this.role = res?.data?.name;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });      
  }
  URLConstants = URLConstants;
  
  // add(one:any){
  //   let h = this.fb.group({  
  //     leave_type2: one,  
  //     leave_number2: '',  
  //   })  
  //   this.quantitiesTwo().push(h);

  //   one.forEach(function (this:any,value:any) {        
      
  //    });
  // }
  changeFun(i:any){
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  setLeaveType(){
    this.HraService.getLeaveTypeList2().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      this.leave_type_list = res.data;      
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });      
  }
    
    
  newRecords() : FormArray {  
    return this.productForm.get("newRecords") as FormArray  
  } 
  oldRecords() : FormArray {  
    return this.productForm.get("oldRecords") as FormArray  
  }  
     
  newRecod(): FormGroup {  
    return this.fb.group({  
      leave_type: '',  
      leave_number: '',  
      per_month_allowed_leave:'',
    })  
  }  
     
  addNew() {  
    this.newRecords().push(this.newRecod());  
  }  
     
  removeNewRecord(i:number) {  
    this.newRecords().removeAt(i);  
  }  

  removeOldRecord(i:number) {  
    this.oldRecords().removeAt(i);  
  } 

  onSubmit() {  
    this.HraService.storeRoleLeaveType(this.role_id,this.productForm.value).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      if(res.status==true){
        this.toastr.showSuccess(res.message);
      }            
    });    
  }  

}
