import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';
import { priorities } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-requisition-form',
  templateUrl: './requisition-form.component.html',
  styleUrls: ['./requisition-form.component.scss']
})
export class RequisitionFormComponent {
//#region Public | Private Variables

  itemTypeList:any;
  itemList:any=[];
  vendorTypeList:any;
  measurementTypeList:any;
  storeTypeList:any;
  record_id:any=0;
  userList:any;
  requisition_type:any=1;
  //todayDate=this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  todayDate:any;
  URLConstants = URLConstants;
  requisitionForm: FormGroup = new FormGroup({})
  priorities = priorities
  edit_view = false

  is_saving:boolean = false;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private inventorySerivce: InventoryService,
    private date:DatePipe,
    private router:Router,
    private route:ActivatedRoute,
    private fb:FormBuilder,
    private toastr: Toastr,
    public CommonService: CommonService
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
    this.todayDate=this.date.transform(new Date(),"yyyy-MM-dd");
  }

  

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit() {    
    this.initForm()
      this.getItemList();
      this.getStudentList(); 
      this.getMeasurementTypeList(); 
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.edit_view = true
        this.inventorySerivce.getRequisitionDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            //If its faculty
            if(res.data.requisition_for==1){
              this.getUserList(res.data.requisition_by);
            }      
            //If its Sttudent
            if(res.data.requisition_for==2){
              this.getStudentList(res.data.requisition_by);
            }
          
            this.requisitionForm.controls['requisition_title'].setValue(res.data.requisition_title);              
            this.requisitionForm.controls['remark'].setValue(res.data.remark);              
            this.requisitionForm.controls['priority'].setValue(res.data.priority);              
            this.requisitionForm.controls['expected_date'].setValue(res.data.expected_date);              
            this.requisitionForm.controls['requisition_date'].setValue(res.data.requisition_date);              
            this.requisitionForm.controls['record_id'].setValue(res.data.id);      
            this.requisitionForm.controls['requisition_for'].setValue(res.data.requisition_for ? res.data.requisition_for.toString() : '2');      
            this.requisitionForm.controls['requisition_by'].setValue(res.data.requisition_by ?? null);      
            
            let s = res.data.requisition_item.length;
            for(let i=0;i<s;i++){
              this.itemList[i] = res.data.requisition_item[i].itemList
              let h = this.fb.group({  
               inventory_item_type_id: res.data.requisition_item[i].item_name.inventory_item_type_id,          
               inventory_item_id: res.data.requisition_item[i].inventory_item_id,                         
               quantity: new FormControl(res.data.requisition_item[i].quantity),  
               measurement_type_id: res.data.requisition_item[i].item_name.measurement_type_id,          
              });      
              this.quantities.push(h); 
              // this.setItemTypeChange(res.data.requisition_item[i].item_name.inventory_item_type_id,res.data.requisition_item[i].inventory_item_id,i);
            }
            

          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }
      else{
        this.quantities.push(this.newQuantity());  
      } 
  }

  get fieldsAsFormArray(): any {
    return this.requisitionForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.requisitionForm.get("quantities") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      inventory_item_type_id: new FormControl(null,[Validators.required]),  
      inventory_item_id: new FormControl(null,[Validators.required]),  
      quantity:new FormControl(null,[Validators.required]),
      measurement_type_id:new FormControl(null,[Validators.required]),    
    })  
  }  
     
  addQuantity() {  
    this.quantities.push(this.newQuantity());  
  }  

  getQuantity(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.quantity;
  }  

  getMeasurmentType(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.measurement_type_id;
  } 

     
  removeQuantity(i:number) {  
    this.quantities.removeAt(i);  
  }  
  
  getItemList(){
    this.inventorySerivce.getItemTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }

  
getVendorTypeList(){  
  this.inventorySerivce.getVendorTypeList().subscribe((res:any) => {
    if(res.status==false){
      this.toastr.showError(res.message);
    }else{
      this.vendorTypeList = res.data;      
    }    
  },(err:any)=>{
    this.toastr.showError(err.error.message);
  });    
}

  getMeasurementTypeList(){
    this.inventorySerivce.getMeasurementTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.measurementTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  onSubmit() {       
    this.is_saving = true;
      const payload = this.requisitionForm.value;
      Object.assign(payload,{requisition_type:this.requisition_type})
      this.addRequisition(payload);    
      return 0;           
  }    

  addRequisition(payload:any)
  {
    let record_id = this.requisitionForm.controls['record_id'].value; 
    this.inventorySerivce.addRequisition(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.REQUISITION_LIST)]);
      }    
      this.is_saving = false;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.is_saving = false;
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }


  requisition_by_type_change(event:any){
    if(event.target.id=='type_student'){
      this.getStudentList();
      this.requisition_type=2;
    }
    if(event.target.id=='type_faculty'){
      this.getUserList();
      this.requisition_type=1;
    } 
    this.requisitionForm.controls['requisition_by'].reset(); 
  }

  getUserList(id:any=null){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
        if(id !=null){          
          this.requisitionForm.controls['requisition_by'].setValue(id);      
        }
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  getStudentList(id:any=null){
    this.inventorySerivce.getStudentList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
        if(id !=null){          
          this.requisitionForm.controls['requisition_by'].setValue(id);      
        }  
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }  
  

  itemTypeChange(event:any,i:any){    
    this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(null); 
    this.inventorySerivce.fetchItemList(event.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList[i] = res.data.map((el:any) => {
          return {...el, name: el.item_name}
        });      
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.reset(); 
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }

  setItemTypeChange(item_type_id:any,id:any,i:any){    
    this.inventorySerivce.fetchItemList(item_type_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList[i] = res.data.map((el:any) => {
          return {...el, name: el.item_name}
        });           
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(id); 
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }


  itemChange(event:any,j:any){    
    let id = event.id;
    let selected_products = this.itemList[j];
    for( var i = 0, len = selected_products.length; i < len; i++ ) {
        if(selected_products[i].id == id) {
            this.getMeasurmentType(j).setValue(selected_products[i]["measurement_type_id"]);
            break;
        }
    }
  }

  //#endregion Public methods
  
    // --------------------------------------------------------------------------------------------------------------
    // #region Private methods
    // --------------------------------------------------------------------------------------------------------------
    initForm(){
      this.requisitionForm = new FormGroup({
        requisition_title: new FormControl('',[Validators.required]),
        requisition_date:new FormControl('',[Validators.required]),
        requisition_for:new FormControl('2'),
        requisition_by: new FormControl(null),
        expected_date:new FormControl('',[Validators.required]),
        priority: new FormControl(null,[Validators.required]),
        remark: new FormControl(''),
        record_id:new FormControl(''),
        quantities: this.fb.array([]),
      });
    }
}
