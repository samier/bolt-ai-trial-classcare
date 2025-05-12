import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';

@Component({
  selector: 'app-payroll-category-view',
  templateUrl: './payroll-category-view.component.html',
  styleUrls: ['./payroll-category-view.component.scss']
})
export class PayrollCategoryViewComponent {

  submitted:any=false;
  public valid = true;
  user_id:any;
  constructor(
    private payrollService: PayrollService,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.user_id= this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.salaryDetails();
  }
  URLConstants = URLConstants;

  onSubmit() {
    
      this.submitted=true;
      this.valid=true;          

      if(this.valid){ //add role
       // this.addRecord(payload);
      }      
      return 0;           
  }    

  salaryDetails(){    
    let payload = {};
    Object.assign(payload,{user_id:this.user_id});
    this.payrollService.getSalaryDetails(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        // this.user_name = res.data.full_name;
        // this.salary = res.data.salary.salary;
        // this.payrollform.controls['salary'].setValue(this.salary);
      } 
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }

  addRecord(payload:any)
  {
    this.payrollService.addUpdateSalary(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
