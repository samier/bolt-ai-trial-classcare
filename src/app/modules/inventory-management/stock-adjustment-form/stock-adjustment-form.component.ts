import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-stock-adjustment-form',
  templateUrl: './stock-adjustment-form.component.html',
  styleUrls: ['./stock-adjustment-form.component.scss']
})
export class StockAdjustmentFormComponent {

  submitted:any=false;
  public valid = true;
  public roleList:any;
  itemTypeList:any;
  itemList:any=[];
  vendorTypeList:any;
  discardItemTypeList:any;
  storeTypeList:any;
  item_code:any;
  measurementTypeList:any;
  item_name:any;
  record_id:any=0;
  userList:any;
  discard_date:any;
  required_by:any;
  is_disabled = false;
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  display_status_change = "none";
  status:any;
  added_item_list:any={};
  added_item_flag:any=[];
  // requisition_type:any=1;
  // requisition_by_type:any;
  x = Math.floor((Math.random() * 1000) + 1);
  todayDate:any;
  
  constructor(
    private inventorySerivce: InventoryService,private date:DatePipe,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr,  public CommonService: CommonService
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
    this.todayDate=this.date.transform(new Date(),"yyyy-MM-dd");
    this.stockAdjustmentForm = new FormGroup({
      store_id: new FormControl('',[Validators.required]),
      reason: new FormControl(''),
      date:new FormControl('',[Validators.required,Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      record_id:new FormControl(''),
      quantities: this.fb.array([]),
    });
  }

  stockAdjustmentForm: FormGroup;
  ngOnInit() {    
    this.getStoreList.then(()=>{
      this.getItemList();
      this.getMeasurementTypeList();
    }).then(()=>{
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.inventorySerivce.getStockAdjustmentDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            console.log(res);
         
            this.stockAdjustmentForm.controls['store_id'].setValue(res.data.store_id);   
            this.stockAdjustmentForm.controls['reason'].setValue(res.data.reason);              
            this.stockAdjustmentForm.controls['date'].setValue(res.data.date);              
            this.stockAdjustmentForm.controls['record_id'].setValue(res.data.id);      
            
            let s = res.data.stock_adjustment_items.length;
            for(let i=0;i<s;i++){
              let h = this.fb.group({  
                record_id:res.data.stock_adjustment_items[i].id,
                inventory_item_type_id: res.data.stock_adjustment_items[i].inventory_item_type_id,          
                inventory_item_id: res.data.stock_adjustment_items[i].inventory_item_id,          
                adjust_quantity: new FormControl(res.data.stock_adjustment_items[i].adjust_quantity,[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),          
                available_quantity: res.data.stock_adjustment_items[i].available_quantity,          
                measurement_type_id:new FormControl({value: '', disabled: true}),                    
              });            
              this.quantities().push(h); 
              this.setItemTypeChange(res.data.stock_adjustment_items[i].inventory_item_type_id,res.data.stock_adjustment_items[i].inventory_item_id,i);
            }

          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }else{
        this.addQuantity();
      } 
    });  
  }


  get fieldsAsFormArray(): any {
    return this.stockAdjustmentForm.get('quantities') as FormArray;
  }

  quantities() : FormArray {  
    return this.stockAdjustmentForm.get("quantities") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      record_id:new FormControl(''),
      inventory_item_type_id: new FormControl('',[Validators.required]),  
      inventory_item_id: new FormControl('',[Validators.required]),  
      adjust_quantity:new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
      available_quantity:new FormControl('',[Validators.required]),    
      measurement_type_id:new FormControl({value: '', disabled: true}), 
    })  
  }  
     
  addQuantity() {  
    this.quantities().push(this.newQuantity());  
  }  
     
  removeQuantity(i:number) {  
    this.quantities().removeAt(i);  
  }  

  getMeasurmentType(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.measurement_type_id;
  }    

  getAdjustedQuantity(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.adjust_quantity;
  }  

  URLConstants = URLConstants;

  getStoreList = new Promise<string>((resolve,reject)=>{
    this.inventorySerivce.getStoreTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
        reject('rejected');
      }else{
        this.storeTypeList = res.data;      
        resolve('correct');
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      reject('rejected');
    });
  });

  
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

  // getInventoryList(){
  //   this.inventorySerivce.getInventoryList().subscribe((res:any) => {
  //     if(res.status==false){
  //       this.toastr.showError(res.message);
  //     }else{
  //       this.itemList = res.data;      
  //     }    
  //   },(err:any)=>{
  //     this.toastr.showError(err.error.message);
  //   });        
  // }

  
// getVendorTypeList(){  
//   this.inventorySerivce.getVendorTypeList().subscribe((res:any) => {
//     if(res.status==false){
//       this.toastr.showError(res.message);
//     }else{
//       this.vendorTypeList = res.data;      
//     }    
//   },(err:any)=>{
//     this.toastr.showError(err.error.message);
//   });    
// }

// getDiscardItemTypeList(){
//     this.inventorySerivce.getDiscardItemTypeList().subscribe((res:any) => {
//       if(res.status==false){
//         this.toastr.showError(res.message);
//       }else{
//         this.discardItemTypeList = res.data;      
//       }    
//     },(err:any)=>{
//       this.toastr.showError(err.error.message);
//     });
//   }


  onSubmit() {  
      this.submitted=true;
      this.valid=true;          
      const payload = this.stockAdjustmentForm.value;
      if(this.valid){ //add role
       this.addStockAdjustment(payload);
      }      
      return 0;           
  }    

  addStockAdjustment(payload:any)
  {
    let record_id = this.stockAdjustmentForm.controls['record_id'].value; 
    this.inventorySerivce.addStockAdjustment(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.ADJUST_STOCK_ITEM_LIST)]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  change(event:any){  
    if(this.item_name.length > 2){
      this.item_code=this.item_name.substr(0,3)+"-"+this.x;
    }
  }

  // requiredBy(event:any){  
  //   let required_by = new Date(event.target.value);
  //   let discard_date = new Date(this.discard_date);
  //   if(discard_date != undefined){
  //     if(discard_date > required_by){
  //       alert("Required By date cannot be less then requisition date");
  //       event.target.value = "";
  //     }
  //   }
  // }
  


  itemChange(event:any,i:any){
    console.log(event.target.value);
    this.inventorySerivce.getAvailableItem(event.target.value).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.fieldsAsFormArray.controls?.[i]?.controls?.available_quantity.setValue(res.data.available_quantity);      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
    
    let id = event.target.value;
    let selected_products = this.itemList[i];
    for( var m = 0, len = selected_products.length; m < len; m++ ) {
        if( selected_products[m].id == id) {
            this.getMeasurmentType(i).setValue(selected_products[m]["measurement_type_id"]);
            break;
        }
    }   

  }

  itemTypeChange(event:any,i:any){    
    this.inventorySerivce.fetchItemList(event.target.value).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList[i] = res.data;      
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
        this.itemList[i] = res.data;      
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(id); 
        this.setMeasurementType(id,i);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }

  setMeasurementType(id:any,j:any){      
    let selected_products = this.itemList[j];
    for( var i = 0, len = selected_products.length; i < len; i++ ) {
        if( selected_products[i].id == id) {
            this.getMeasurmentType(j).setValue(selected_products[i]["measurement_type_id"]);
            break;
        }
    }
  }    
}
