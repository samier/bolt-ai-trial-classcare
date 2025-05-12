import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../../hra/hra.service';
import { PayrollService } from '../payroll.service';

@Component({
  selector: 'app-assign-payrollgroup-to-role',
  templateUrl: './assign-payrollgroup-to-role.component.html',
  styleUrls: ['./assign-payrollgroup-to-role.component.scss']
})
export class AssignPayrollgroupToRoleComponent {

  submitted:any=false;
  public branch_id = window.localStorage?.getItem("branch");
  public valid = true;
  public role_id:any;
  public roleList:any;
  public role:any;
  public PayrollGroupNames=[];
  public selectedPayrollGroup=[];
  public RoleNames = [];
  public id = 0;
  constructor(
    private hraServices:HraService ,private payrollService:PayrollService ,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.role_id = this.route.snapshot.paramMap.get('id');
    this.payrollGroupform = new FormGroup({
      payroll_group: new FormControl('',[Validators.required]),      
    });
  }
  payrollGroupform: FormGroup;
  ngOnInit() { 
    this.getRoleList.then(()=>{      
      this.getPayrollGroupList();
    }).then(()=>{
      this.getAssignedPayroll(this.role_id);
    });
  }
  URLConstants = URLConstants;

    onSubmit() {
      this.submitted=true;
      this.valid=true;      
          
      const payload = {
        "role_id": this.role_id,
        "payroll_group_id": this.payrollGroupform.value.payroll_group,
      } 
  
      this.payrollService.assignPayrollGroup(payload,this.id).subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{          
          this.toastr.showSuccess(res.message);
        }    
      }); 
      return 0;
    }




    getRoleList = new Promise<string>((resolve,reject)=>{
      this.hraServices.getRoleList().subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
          reject('rejected');
        }else{
          this.RoleNames = res.data;
          let name:any = this.RoleNames.filter((product:any) => { if(product.id == this.role_id) return product;});
          this.role=name[0].name;  
          resolve('correct');
        }    
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        reject('rejected');
      });
    });

    
    getAssignedPayroll(id:any)
    {      
      this.payrollService.getAssignPayrollGroup(id).subscribe((res:any) => {
        console.log(res);
        if(res.status==true){
          this.selectedPayrollGroup=res.data.payroll_group_id;
          this.id = res.data.id;
        }        
      });    
    }

    getPayrollGroupList()
    {      
      this.payrollService.getPayrollDropDownList().subscribe((res:any) => {
        console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{
          this.PayrollGroupNames =res.data;
        }    
      });    
    }    

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
