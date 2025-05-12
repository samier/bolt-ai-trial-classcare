import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';

@Component({
  selector: 'app-set-monthly-working-days',
  templateUrl: './set-monthly-working-days.component.html',
  styleUrls: ['./set-monthly-working-days.component.scss']
})
export class SetMonthlyWorkingDaysComponent implements OnInit {


  submitted:any=false;
  public valid = true;
  public user_name:any;
  public salary:any;
  user_id:any;
  public monthwise_list:any = [];
  public edit_fields_list:any=[];
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
    this.getMonthlyWorkinDays();
  }
  URLConstants = URLConstants;

  onSubmit() { 
    let newlist = this.edit_fields_list;
    console.log("start");
    let isValid=true;
    let obj={};
    let j=0;
    for (var key in newlist) {
      let o = {};
      o["id"]=key;
      console.log(newlist[key]);
      if(newlist[key] == "" || isNaN(newlist[key]) || newlist[key] == null || newlist[key]==undefined){
        isValid=false;
        break;
      }
      o["value"]=newlist[key];      
      obj[j]=JSON.stringify(o);
      j++;
    }
  console.log(newlist);
  if(isValid)
  this.updateMonthlyWorkinDays({data:JSON.stringify(obj)});
  else
  this.toastr.showInfo("Please fill all the textbox properly.","INFO");
  }    

  getMonthlyWorkinDays(){    
    let payload = {};
    this.payrollService.getMonthlyWorkinDays(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        try {
          let j = 0;
          res.data.forEach(element => {
            //this.edit_fields_list[element.id]=[];
            let intval = element.id;
            console.log(element.id,intval);
            this.edit_fields_list[intval]=element.working_days;
            //this.edit_fields_list[element.id]['month']=element.month;
            j++;
          });        
        } finally {
          console.log(this.edit_fields_list);
          this.monthwise_list = res.data;
        }
      } 
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }

  updateMonthlyWorkinDays(payload:any)
  {
    this.payrollService.updateMonthlyWorkinDays(payload).subscribe((res:any) => {
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
  update(event:any,id,max_day:any){    
    let val:any = parseInt(event.target.value);
    if(val > max_day || val == null || val == undefined || val == ''){
      val = max_day;
    }
    this.edit_fields_list[id]=val;
  }
}
