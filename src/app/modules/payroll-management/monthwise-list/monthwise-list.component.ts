import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';

@Component({
  selector: 'app-monthwise-list',
  templateUrl: './monthwise-list.component.html',
  styleUrls: ['./monthwise-list.component.scss']
})
export class MonthwiseListComponent implements OnInit {


  submitted:any=false;
  public valid = true;
  public user_name:any;
  public salary:any;
  user_id:any;
  public monthwise_list:any = [];
  constructor(
    private payrollService: PayrollService,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    //this.user_id= this.route.snapshot.paramMap.get('id');
    this.payrollform = new FormGroup({
      salary: new FormControl('',[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
    });
  }

  payrollform: FormGroup;
  ngOnInit() {
    this.getMonthwiseList();
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

  getMonthwiseList(){    
    let payload = {};
    this.payrollService.getMonthwiseList(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.monthwise_list = res.data;
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
  printPayslips(date){
    this.payrollService.viewAllPayslip(date).subscribe((res:any) => {
      let blob:Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)      
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfSrc;
        document.body.appendChild(iframe);
        setTimeout(() => {
          iframe.contentWindow?.print();
        },200);                
    },(err:any)=>{
      //this.toastr.showError(err.error.message);
    });    
  }
}
