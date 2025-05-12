import { Component, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { PayrollService } from '../payroll.service';


@Component({
  selector: 'app-add-payroll-category',
  templateUrl: './add-payroll-category.component.html',
  styleUrls: ['./add-payroll-category.component.scss']
})
export class AddPayrollCategoryComponent {

  submitted:any=false;
  public valid = true;
  public roleList:any;
  payroll_type:any = 1; 
  category_code:any;
  radioForm:any;
  display_codes:any=1;
  display_round_off:any=0;
  code_list:any;
  code_list_earnings:any=[];
  code_list_deductions:any=[];
  formula:any=null;
  condition_array:any=[];
  display_formula_error:any=0;
  display_formula_error_for_condition:any = [];
  display_formula_error_for_secondary_condition:any = [];
  display_formula_error_for_final_condition:any = [];
  display_formula_error_for_default_condition:any=0;
  id:any=0;

  constructor(
    private payrollService: PayrollService,private router:Router,private fb:FormBuilder, private toastr: Toastr,private activeRouteService:ActivatedRoute
  ) {
    //let oneyear = this.formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    this.id = this.activeRouteService.snapshot.params['id'];
    this.payrollform = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z ]*$/)]),
      code: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9 ]*$/)]),
      payroll_type:new FormControl('1',[Validators.required]),
      calculation_type:new FormControl('',[Validators.required]),
      calculation_based_on_working_day: new FormControl(''),
      round_off_by: new FormControl(''),
      amount:new FormControl(''),
      formula:new FormControl(''),
      default_condition: new FormControl(''),
      automatic_or_manual:new FormControl('1',[Validators.required]),
      conditions: this.fb.array([]),
    });
  
  }

  payrollform: FormGroup;
  ngOnInit() {    
    this.getCodeList();

    if(this.id !=0){
      //call to ger category details

    this.payrollService.getPayrollCategory(this.id).subscribe((res:any) => {
      let payroll = res.data;
      this.payrollform.get('name')?.setValue(payroll.name);
      this.payrollform.get('code')?.setValue(payroll.code);
      this.payrollform.get('payroll_type')?.setValue(payroll.payroll_type.toString());
      this.payrollform.get('automatic_or_manual')?.setValue(payroll.automatic_or_manual.toString());
      if(payroll.calculation_based_on_working_day != null)
      this.payrollform.get('calculation_based_on_working_day')?.setValue(payroll.calculation_based_on_working_day.toString());
      
      if(payroll.round_off_by != "" && payroll.round_off_by != null ){
        this.payrollform.get('round_off_by')?.setValue(payroll.round_off_by.toString());
        this.display_round_off=1;
      }else{
        this.display_round_off=0;
      }

      // this.display_round_off=0;
      // if(payroll.round_off_by != null){
      //   this.display_round_off=1;
      //   this.payrollform.get('round_off_by')?.setValue(payroll.round_off_by);
      // }
      if(payroll.calculation_type==1){
        this.category_code = 1;
        this.payrollform.get('amount')?.setValue(payroll.amount);
        this.payrollform.get('calculation_type')?.setValue(payroll.calculation_type);
      } 
      if(payroll.calculation_type == 2){
        this.category_code = 2;
        this.payrollform.get('formula')?.setValue(payroll.formula);
        this.formula = payroll.formula;
        this.payrollform.get('calculation_type')?.setValue(payroll.calculation_type);
      } 

      if(payroll.calculation_type==3){
        this.category_code = 3;
        this.payrollform.get('default_condition')?.setValue(payroll.default_condition);
        this.payrollform.get('calculation_type')?.setValue(payroll.calculation_type);

        let l = payroll.category_condition_slabs.length;
        // adding conditions here 
        for(let i = 0; i<l;i++){
          let item = payroll.category_condition_slabs[i]
          let slab = this.fb.group({  
            primary_condition: new FormControl(item.primary_condition,[Validators.required]),  
            secondary_condition: new FormControl(item.secondary_condition,[Validators.required]),  
            operators:new FormControl(item.operators,[Validators.required]),
            final_condition:new FormControl(item.final_condition,[Validators.required]),    
          }); 
          this.quantities().push(slab);
        }        
      } 


    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });  
    }      
  }
  URLConstants = URLConstants;

  onSubmit() {


      this.submitted=true;
      this.valid=true;         
      if(this.display_round_off != 1){        
        this.payrollform.get('round_off_by')?.setValue("");
      } 
      const payload = this.payrollform.value;    
      console.log(payload);
      // const form = document.getElementById('payrollForm') as HTMLFormElement;
      // const formData:FormData = new FormData(form);
      // console.log(formData);
            

      if(this.valid){ //add role
       this.addPayrollCategory(payload);
      }      
      return 0;           
  }    

name(i:any){
  return "conditions["+i+"][primary_condition]";
}

  quantities() : FormArray {  
    return this.payrollform.get("conditions") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      primary_condition: new FormControl('',[Validators.required]),  
      secondary_condition: new FormControl('',[Validators.required]),  
      operators:new FormControl('',[Validators.required]),
      final_condition:new FormControl('',[Validators.required]),    
    })  
  }    


  addQuantity() {    
    this.quantities().push(this.newQuantity());  
  }  

  removeQuantity(i:number) {  
    this.quantities().removeAt(i);  
  }  


  addPayrollCategory(payload:any)
  {
    const invalid = [];
    this.payrollService.addPayrollCategory(payload,this.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.PAYROLL_CATEGORY_LIST)]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  valueChange(event:any){
    this.category_code = event.target.value;
    this.display_codes=1;

    if(this.category_code == 1){
      this.payrollform.controls["amount"].setValidators(Validators.required);  
    }else{
      this.payrollform.controls["amount"].clearValidators();
    }
    this.payrollform.controls["amount"].updateValueAndValidity();

    if(this.category_code == 2){
      this.payrollform.controls["formula"].setValidators(Validators.required);
      this.payrollform.get('automatic_or_manual')?.setValue('1');
    }else{
      this.payrollform.controls["formula"].clearValidators();
    }
    this.payrollform.controls["formula"].updateValueAndValidity();

    if(this.category_code == 3){
      this.payrollform.get('automatic_or_manual')?.setValue('1');
      this.payrollform.controls["default_condition"].setValidators(Validators.required);
      this.addQuantity();
    }else{
      this.payrollform.controls["default_condition"].clearValidators();
      this.quantities().clear();
    }
    this.payrollform.controls["default_condition"].updateValueAndValidity();

  } 
  displayCodes(type:any){
    this.display_codes=type;
  }

  validate(){
    console.log("validate");
  }
  doSomething(event:any){  
    if(event.target.checked==true){
      this.display_round_off=1;
    }
    else{
      this.display_round_off=0;
    }
  }

getCodeList(){
  this.payrollService.getCodeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        console.log('test');
        console.log(res);
        this.code_list = res.data.payroll_type.standard_code;
        this.code_list_earnings = res.data.payroll_type.earnings_code;
        this.code_list_deductions =res.data.payroll_type.deductions_code;
        console.log(this.code_list);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  validateFormula(){
    this.payrollService.validateFormula(this.formula).subscribe((res:any) => {
      if(res.status==false){
        this.display_formula_error=1;
        this.toastr.showError(res.message);
      }else{
        this.display_formula_error=2;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  get fieldsAsFormArray():any {
    return this.payrollform.controls["conditions"] as FormArray;
  }

  validateFormulaForConditions(i:any){
    let primary_condition = this.fieldsAsFormArray.controls?.[i]?.controls?.primary_condition.value; 
    console.log(primary_condition);
    this.payrollService.validateFormula(primary_condition).subscribe((res:any) => {
      if(res.status==false){
        this.display_formula_error_for_condition[i]=1;
        this.toastr.showError(res.message);
      }else{
        this.display_formula_error_for_condition[i]=2;      
      }    
    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err.error.message);
    }); 
  }
  
  validateFormulaForSecondaryConditions(i:any){
    let secondary_condition = this.fieldsAsFormArray.controls?.[i]?.controls?.secondary_condition.value; 
    console.log(secondary_condition);
    this.payrollService.validateFormula(secondary_condition).subscribe((res:any) => {
      if(res.status==false){
        this.display_formula_error_for_secondary_condition[i]=1;
        this.toastr.showError(res.message);
      }else{
        this.display_formula_error_for_secondary_condition[i]=2;      
      }    
    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err.error.message);
    }); 
  }
  
  validateFormulaForFinalConditions(i:any){
    let final_condition = this.fieldsAsFormArray.controls?.[i]?.controls?.final_condition.value; 
    console.log(final_condition);
    this.payrollService.validateFormula(final_condition).subscribe((res:any) => {
      if(res.status==false){
        this.display_formula_error_for_final_condition[i]=1;
        this.toastr.showError(res.message);
      }else{
        this.display_formula_error_for_final_condition[i]=2;      
      }    
    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err.error.message);
    }); 
  }

  validateFormulaForDefaultConditions(){
    let default_condition = this.payrollform.controls['default_condition'].value;    
    console.log(default_condition);
    this.payrollService.validateFormula(default_condition).subscribe((res:any) => {
      if(res.status==false){
        this.display_formula_error_for_default_condition=1;
        this.toastr.showError(res.message);
      }else{
        this.display_formula_error_for_default_condition=2;      
      }    
    },(err:any)=>{
      console.log(err);
      this.toastr.showError(err.error.message);
    }); 
  }

  automaticOrManual(event){
    let automatic = event.target.value;
    if(automatic == '2'){
      this.category_code = 1;
      this.payrollform.get('amount')?.setValue(0);
      this.payrollform.get('calculation_type')?.setValue('1');
    }  
    else{      
      this.payrollform.get('calculation_type')?.reset();
    }
  }

  payrollType(payrollType:any){
    this.payroll_type = payrollType;
  }
}

