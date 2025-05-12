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
  selector: 'app-discard-item-form',
  templateUrl: './discard-item-form.component.html',
  styleUrls: ['./discard-item-form.component.scss']
})
export class DiscardItemFormComponent {

  submitted:any=false;
  public valid = true;
  public roleList:any;
  itemTypeList:any;
  itemList:any=[];
  available_item:any = [];
  vendorTypeList:any;
  discardItemTypeList:any;
  measurementTypeList:any;
  storeTypeList:any;
  item_code:any;
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
  edit_view:any=false;
  is_saving:boolean = false;
  // requisition_type:any=1;
  // requisition_by_type:any;
  x = Math.floor((Math.random() * 1000) + 1);
  todayDate:any;

  constructor(
    private inventorySerivce: InventoryService,private date:DatePipe,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr,  public CommonService: CommonService
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
    this.todayDate=this.date.transform(new Date(),"yyyy-MM-dd");
    this.discardItemForm = new FormGroup({
      store_id: new FormControl(null,[Validators.required]),
      reason: new FormControl(''),
      date:new FormControl('',[Validators.required,Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      record_id:new FormControl(''),
      quantities: this.fb.array([]),
    });
  }

  discardItemForm: FormGroup;
  ngOnInit() {    
    this.getStoreList.then(()=>{
      this.getItemList();
      this.getDiscardItemTypeList(); 
      this.getMeasurementTypeList(); 
      // this.getInventoryList();
    }).then(()=>{
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.edit_view = true;
        this.inventorySerivce.getDescardItemDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            this.discardItemForm.controls['store_id'].setValue(res.data.store_id);   
            this.discardItemForm.controls['reason'].setValue(res.data.reason);              
            this.discardItemForm.controls['date'].setValue(res.data.date);              
            this.discardItemForm.controls['record_id'].setValue(res.data.id);      
            
            let s = res.data.discard_details_items.length;
            for(let i=0;i<s;i++){
              let h = this.fb.group({  
               inventory_item_type_id: res.data.discard_details_items[i].inventory_item_type_id,          
               inventory_item_id: res.data.discard_details_items[i].inventory_item_id,          
               quantity:new FormControl(res.data.discard_details_items[i].quantity,[Validators.required]),          
               discard_items_type_id: res.data.discard_details_items[i].discard_items_type_id,          
               record_id: res.data.discard_details_items[i].id,    
               measurement_type_id:new FormControl({value: '', disabled: true}),                    
              });            
              this.quantities.push(h); 
              this.setItemTypeChange(res.data.discard_details_items[i].inventory_item_type_id,res.data.discard_details_items[i].inventory_item_id,i);
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
    return this.discardItemForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.discardItemForm.get("quantities") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      record_id: new FormControl(''),  
      inventory_item_type_id: new FormControl(null,[Validators.required]),  
      inventory_item_id: new FormControl(null,[Validators.required]),  
      quantity:new FormControl(null,[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
      discard_items_type_id:new FormControl(null,[Validators.required]),    
      measurement_type_id:new FormControl({value: null, disabled: true}),    
    })  
  }  
    
  addQuantity() {  
    this.quantities.push(this.newQuantity());  
  }  
     
  removeQuantity(i:number) {  
    this.quantities.removeAt(i);  
  }  

  getMeasurmentType(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.measurement_type_id;
  }    

  getQuantity(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.quantity;
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

getDiscardItemTypeList(){
    this.inventorySerivce.getDiscardItemTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.discardItemTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }


  onSubmit() {  
    this.is_saving = true;
      this.submitted=true;
      this.valid=true;          
      const payload = this.discardItemForm.value;
      if(this.valid){ //add role
       this.addDiscardItems(payload);
      }      
      return 0;           
  }    

  addDiscardItems(payload:any)
  {
    let record_id = this.discardItemForm.controls['record_id'].value; 
    this.inventorySerivce.addDiscardItems(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);        
        this.router.navigate([this.setUrl(URLConstants.DISCARD_ITEM_LIST)]);
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
  change(event:any){  
    if(this.item_name.length > 2){
      this.item_code=this.item_name.substr(0,3)+"-"+this.x;
    }
  }
  
  
  itemTypeChange(event:any,i:any){    
    this.inventorySerivce.fetchItemListWithAvailableItem(event.id).subscribe((res:any) => {
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

  getName(i:any){
    return "quantities["+i+"][inventory_item_id]";
  }

  itemChange(event:any,j:any){    
    this.getMeasurmentType(j).setValue(event.measurement_type_id);
    this.available_item[j]=event.available_quantity;
    this.fieldsAsFormArray.controls?.[j]?.controls?.quantity.setValidators([Validators.max(this.available_item[j])]);
    this.fieldsAsFormArray.controls?.[j]?.controls?.quantity.updateValueAndValidity();
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
            this.available_item[j]=selected_products[i]["available_quantity"];
            this.fieldsAsFormArray.controls?.[j]?.controls?.quantity.setValidators([Validators.max(this.available_item[j])]);
            this.fieldsAsFormArray.controls?.[j]?.controls?.quantity.updateValueAndValidity();
            break;
        }
    }
  }    
}
