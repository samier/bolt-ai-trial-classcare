import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';

@Component({
  selector: 'app-add-salary',
  templateUrl: './add-salary.component.html',
  styleUrls: ['./add-salary.component.scss']
})
export class AddSalaryComponent {

  submitted:any=false;
  public valid = true;
  public user_name:any;
  public salary:any;
  user_id:any;
  constructor(
    private payrollService: PayrollService,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.user_id= this.route.snapshot.paramMap.get('id');
    this.payrollform = new FormGroup({
      salary: new FormControl('',[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
    });
  }

  payrollform: FormGroup;
  ngOnInit() {
    this.salaryDetails();
  }
  URLConstants = URLConstants;

  onSubmit() {
    
      this.submitted=true;
      this.valid=true;          
      const payload = {
        "salary":this.payrollform.value.salary,      
        "user_id":this.user_id,    
      } 
      if(this.valid){ //add role
        this.addRecord(payload);
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
        this.user_name = res.data.full_name;
        this.salary = res.data.salary.salary;
        this.payrollform.controls['salary'].setValue(this.salary);
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
        this.router.navigate([this.setUrl(URLConstants.PAYROLL)]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
