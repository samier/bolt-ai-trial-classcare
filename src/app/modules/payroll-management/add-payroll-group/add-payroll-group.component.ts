import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PayrollService } from '../payroll.service';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-add-payroll-group',
  templateUrl: './add-payroll-group.component.html',
  styleUrls: ['./add-payroll-group.component.scss'],
})
export class AddPayrollGroupComponent {
  submitted:any=false;
  public valid = true;
  payslip_generation_date_visible:any = 2;
  is_category_selected:any = false;
  id:any=0;
  category_list:any;

  constructor(
    private payrollService: PayrollService,private router:Router,private fb:FormBuilder, private toastr: Toastr,private activeRouteService:ActivatedRoute
  ) {
    this.id = this.activeRouteService.snapshot.params['id'];
    this.payrollform = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\. ]*$/)]),
      payment_frequency:new FormControl('',[Validators.required]),
      payslip_generation_date: new FormControl(''),      
    });
  }

  payrollform: FormGroup;
  
  ngOnInit() {
    
    this.getEarningList.then(()=>{
      this.getDeductionList();
    }).then(()=>{

      if(this.id !=0)
      {
        this.DeductionList=[];
        this.payrollService.getPayrollGroup(this.id).subscribe((res:any) => {        
          console.log(res.data);
          this.payrollform.get('name')?.setValue(res.data.name);
          this.payrollform.get('payment_frequency')?.setValue(res.data.payment_frequency);        
          if(res.data.payment_frequency == 2){
            this.payslip_generation_date_visible = 2;         
            this.payrollform.get('payslip_generation_date')?.setValue(res.data.payslip_generation_date);
            this.payrollform.controls["payslip_generation_date"].setValidators(Validators.required);          
          }
          else{
            this.payslip_generation_date_visible = 1; 
          }
           
          this.DeductionList=res.data.list;          
          this.selectedDeductionList=res.data.list_selected;  

          this.EarningList=res.data.list_earning;          
          this.selectedEarningList=res.data.list_selected_earning;                               
        });
  
      }
    });
  

  }

  URLConstants = URLConstants;
  onSubmit() {
      this.submitted=true;
      this.valid=true;    

      if(this.selectedEarningList.length == 0 && this.selectedDeductionList.length == 0){
        this.is_category_selected=true;
      }
      else{
        this.is_category_selected=false;
      }

    if(this.payrollform.valid && !this.is_category_selected){  
      let formData = this.payrollform.value;
      Object.assign(formData,{payroll_group_category:[...this.selectedEarningList,...this.selectedDeductionList]});
      if(this.valid){ //add role
        console.log(formData);
        this.addRecord(formData);
      }      
    }
    
    return 0;           
  }    



  getEarningList = new Promise<string>((resolve,reject)=>{
    this.payrollService.getEarningList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
        reject('rejected');
      }else{
        this.EarningList=res.data;      
        resolve('correct');
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      reject('rejected');
    });
  });


  // getEarningList(){
  //   this.payrollService.getEarningList().subscribe((res:any) => {
  //     if(res.status==false){
  //       this.toastr.showError(res.message);
  //     }else{
  //       this.EarningList=res.data;
  //     }    
  //   },(err:any)=>{
  //     this.toastr.showError(err.error.message);
  //   }); 
  // }

  getDeductionList(){
    this.payrollService.getDeductionList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.DeductionList=res.data;
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
  addRecord(payload:any)
  {
    this.payrollService.addUpdatePayrollGroup(payload,this.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.PAYROLL_GROUP)]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  selectedEarningList:any = [];
  // {
  //   name:'House Rent Allowance | CAT2 | 3%(CAT1)',
  //   id:1,
  // }];
  EarningList:any=[];// ["Basic Pay | CAT1 | 0.00",'test',"tset", 'Take a shower', 'Check e-mail', 'Walk dog'];
  selectedDeductionList:any= [];
  DeductionList:any = [];//['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event:any) {
    console.log(event.previousContainer);
    console.log(event.container);
    if (event.previousContainer === event.container) {      
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      if(event.previousContainer.id == "cdk-drop-list-1")
      {     
      let ids:any = event.container.data[event.currentIndex].ids;
      ids.forEach((currentValue:any, index:any) => {
        console.log(currentValue,index);
        let i =0;
        event.previousContainer.data.filter(function(elm:any){
          if(elm.id==currentValue){
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              i,
              event.currentIndex,
            );
          }
          i++;
          console.log(event.previousContainer.data);
          console.log(event.container.data);
        });
      });
    }
  }
  } 
  
  drop2(event:any) {
    console.log(event.previousContainer);
    console.log(event.container);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      if(event.previousContainer.id == "cdk-drop-list-3")
      {     
      let ids:any = event.container.data[event.currentIndex].ids;
      ids.forEach((currentValue:any, index:any) => {
        console.log(currentValue,index);
        let i =0;
        event.previousContainer.data.filter(function(elm:any){
          if(elm.id==currentValue){
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              i,
              event.currentIndex,
            );
          }
          i++;
          console.log(event.previousContainer.data);
          console.log(event.container.data);
        });
      });
    }

    }

    // to fetch connected category 
    if(event.previousContainer.id == "cdk-drop-list-3")
    {     
      let ids:any = event.container.data[event.currentIndex].ids;
      ids.forEach((currentValue:any, index:any) => {
        console.log(currentValue,index);
        let i =0;
        event.previousContainer.data.filter(function(elm:any){
          if(elm.id==currentValue){
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              i,
              event.currentIndex,
            );
          }
          i++;
          console.log(event.previousContainer.data);
          console.log(event.container.data);
        });
      });
    }    
  }
  
  UpdatePaymentGenerationDate(event:any){
    this.payslip_generation_date_visible = event.target.value;

    if(event.target.value){
      this.payrollform.controls["payslip_generation_date"].setValidators(Validators.required);
    }else{
      this.payrollform.controls["payslip_generation_date"].clearValidators();
    }
  }
}
