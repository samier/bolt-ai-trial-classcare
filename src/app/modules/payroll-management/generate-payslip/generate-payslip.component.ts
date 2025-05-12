import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';

@Component({
  selector: 'app-generate-payslip',
  templateUrl: './generate-payslip.component.html',
  styleUrls: ['./generate-payslip.component.scss']
})
export class GeneratePayslipComponent {

  submitted:any=false;
  public valid = true;
  public user_name:any;
  public salary:any;
  user_id:any;
  public role_id:any = 0;
  public has_payroll_group:any=false;
  public payroll_group_id:any=false;
  public selectedDate:any = null;
  public date_selected:any = false;
  public tbody_earning:any = null;
  public tbody_deduction:any = null;
  public total_earning:any = 0;
  public total_deduction:any = 0;
  public user_has_role:any = 1;
  public max_date = new Date().toISOString().split("T")[0];
  constructor(
    private payrollService: PayrollService,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.user_id= this.route.snapshot.paramMap.get('id');
    this.payrollform = new FormGroup({
      salary:new FormControl(),
      earn_categories:this.fb.array([]),
      deduction_categories:this.fb.array([]),
    });
  }
  payrollform: FormGroup;

  earnlist() : FormArray {  
    return this.payrollform.get("earn_categories") as FormArray  
  }  
     
  newEarn(): FormGroup {  
    return this.fb.group({  
      name: '',  
      value: '',  
    })  
  }  
     
  addEarn() {  
    this.earnlist().push(this.newEarn());  
  }  
     
  removeEarn(i:number) {  
    this.earnlist().removeAt(i);  
  }  

  deductionlist() : FormArray {  
    return this.payrollform.get("deduction_categories") as FormArray  
  }  
     
  newDeduction(): FormGroup {  
    return this.fb.group({  
      name: '',  
      value: '',  
    })  
  }  
     
  addDeduction() {  
    this.deductionlist().push(this.newDeduction());  
  }  
     
  removeDeduction(i:number) {  
    this.deductionlist().removeAt(i);  
  }    

  ngOnInit() {
    console.log("user_id :: "+this.user_id);
    this.salaryDetails();
  }
  URLConstants = URLConstants;

  onSubmit() {    
      this.submitted=true;
      this.valid=true;          
      const payload = {
        "salary":this.payrollform.value.salary,      
        "user_id":this.user_id,    
        "role_id":this.role_id,
        "payroll_group_id":this.payroll_group_id,
      } 
      if(this.valid){ //add role
        this.generatePayslip(payload);
      }      
      return 0;           
  }
  
  formSubmit() {    
    this.submitted=true;
    this.valid=true;          
    let object = this.payrollform.value;
    Object.assign(object,{
      user_id:this.user_id,    
      role_id:this.role_id,
      payroll_group_id:this.payroll_group_id,
      payslip_date:this.selectedDate,
    });
    console.log(object);
    
    // call function to store and generate pdf
    this.payrollService.storePayslip(object).subscribe((res:any) => {

      let blob:Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)      
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfSrc;
        document.body.appendChild(iframe);
        setTimeout(() => {
          iframe.contentWindow?.print();
        },200);  
        //iframe.contentWindow?.print();
      
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
    return 0;           
  }

  // salaryDetails(){    
  //   let payload = {};
  //   Object.assign(payload,{user_id:this.user_id});
  //   this.payrollService.getSalaryDetails(payload).subscribe((res:any) => {
  //     if(res.status==false){
  //       this.toastr.showError(res.message);
  //     }else{
  //       this.user_name = res.data.full_name;

  //       this.salary = res.data?.salary?.salary;
  //       this.payrollform.controls['salary'].setValue(this.salary);
  //       console.log(this.salary);
  //     } 
  //   },(err:any)=>{
  //     this.toastr.showError(err.error.message);
  //   });        
  // }

  
  salaryDetails = () => { 
    
    let payload = {};
    Object.assign(payload,{user_id:this.user_id});

    new Promise<string>((resolve,reject)=>{    
    console.log("user_id : "+payload);

    this.payrollService.getSalaryDetails(payload).subscribe((res:any) => {
      if(res.status==false){
        //this.toastr.showError(res.message);
        reject('rejected');
      }else{
        this.user_name = res.data.full_name;
        this.salary = res.data?.salary?.salary;
        this.payrollform.controls['salary'].setValue(this.salary);
        console.log(this.salary);
        resolve('correct');
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      reject('rejected');
    });
  }).then(()=>{
    this.checkPayrollGroupAssigned();
  });
};

  checkPayrollGroupAssigned(){
    let payload = {user_id:this.user_id};
    this.payrollService.checkPayrollGroupAssigned(payload).subscribe((res:any) => {
      if(res.status==false){
        if(res.data.type == 2){
          this.has_payroll_group=false;
          this.role_id = res.data.role_id;
        }else if(res.data.type == 1){
          this.user_has_role=0;
        }
      }else{
        this.has_payroll_group=true;        
        this.payroll_group_id = res.data.payroll_group_id;
        this.role_id = res.data.role_id;
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  clearFormArray = () => {
    while (this.deductionlist().length !== 0) {
      this.deductionlist().reset();
    }
    while (this.earnlist().length !== 0) {
      this.earnlist().removeAt(0)
    }
  }

  generatePayslip(payload:any)
  {
    this.payrollService.generatePayslip(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
        this.date_selected=false;
      }else{     
        this.deductionlist().clear();
        this.earnlist().clear();
        this.tbody_earning=res.data.earning;
        this.tbody_deduction = res.data.deduction;
        let i = 0;
        for(i=0;i<this.tbody_earning.length;i++){
          let name = this.tbody_earning[i].name;
          let value = this.tbody_earning[i].value;
          this.total_earning = parseFloat(this.total_earning) + parseFloat(value);
          let item = this.fb.group({  
            name: name,  
            value: value,  
          });
          this.earnlist().push(item);  
        }
        let j=0;
        for(j=0;j<this.tbody_deduction.length;j++){
          let name = this.tbody_deduction[j].name;
          let value = this.tbody_deduction[j].value;
          this.total_deduction = parseFloat(this.total_deduction) + parseFloat(value);
          let item = this.fb.group({  
            name: name,  
            value: value,  
          });
          this.deductionlist().push(item);  
        }

        //this.tbody_deduction = res.data.deduction;
        //this.toastr.showSuccess(res.message);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  checkPayslipAvailable(event:any){
    let date = event.target.value;
    const payload = {
      "salary":this.payrollform.value.salary,      
      "user_id":this.user_id,    
      "role_id":this.role_id,
      "payroll_group_id":this.payroll_group_id,
      "payslip_date":date,
    }   
    this.selectedDate=date;
    this.date_selected = true;
    if(this.valid){ //add role
      this.generatePayslip(payload);
    }  
  }

  deduction(){
    // recalculate total_deduction variable
    this.total_deduction = 0;
    this.deductionlist().controls.forEach((i:any,j:any) => {
      this.total_deduction = parseFloat(this.total_deduction) + parseFloat(i.value.value);
    });
  }

  earning(){
    // recalculate total_earning variable
    this.total_earning = 0;
    this.earnlist().controls.forEach((i:any,j:any) => {
      this.total_earning = parseFloat(this.total_earning) + parseFloat(i.value.value);
    });
  }
  
}
