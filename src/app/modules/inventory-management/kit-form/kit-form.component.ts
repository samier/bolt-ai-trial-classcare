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
  selector: 'app-kit-form',
  templateUrl: './kit-form.component.html',
  styleUrls: ['./kit-form.component.scss']
})
export class KitFormComponent {

  submitted:any=false;
  public valid = true;
  public roleList:any;
  itemTypeList:any;
  itemList:any=[];
  vendorTypeList:any;
  discardItemTypeList:any;
  storeTypeList:any;
  item_code:any;
  item_name:any;
  record_id:any=0;
  userList:any;
  discard_date:any;
  measurementTypeList:any;
  required_by:any;
  is_disabled = false;
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  display_status_change = "none";
  status:any;
  added_item_list:any={};
  added_item_flag:any=[];
  is_saving:boolean=false
  // requisition_type:any=1;
  // requisition_by_type:any;
  x = Math.floor((Math.random() * 1000) + 1);
  constructor(
    private inventorySerivce: InventoryService,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr,  public CommonService: CommonService
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
    this.kitForm = new FormGroup({
      store_id: new FormControl('',[Validators.required]),
      name: new FormControl('',[Validators.required]),
      code:new FormControl('',[Validators.required]),
      record_id:new FormControl(''),
      quantities: this.fb.array([]),
    });
  }

  kitForm: FormGroup;
  ngOnInit() {    
    this.getStoreList.then(()=>{
      this.getItemList();
      this.getMeasurementTypeList();
    }).then(()=>{
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.inventorySerivce.getKit(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
         
            this.kitForm.controls['store_id'].setValue(res.data.store_id);   
            this.kitForm.controls['name'].setValue(res.data.name);              
            this.kitForm.controls['code'].setValue(res.data.code);              
            this.kitForm.controls['record_id'].setValue(res.data.id);      
            
            let s = res.data.inventory_kit_items.length;
            for(let i=0;i<s;i++){
              this.itemList[i] = res.data.inventory_kit_items[i].itemList.map((el:any) => {
                return {...el, name: el.item_name}
              });   
              let h = this.fb.group({  
                record_id:res.data.inventory_kit_items[i].id,
                inventory_item_type_id: res.data.inventory_kit_items[i].inventory_item_type_id,          
                inventory_item_id: res.data.inventory_kit_items[i].inventory_item_id,          
                quantity:new FormControl(res.data.inventory_kit_items[i].quantity,[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
                measurement_type_id:new FormControl({value: res.data.inventory_kit_items[i].measurement_type_id, disabled: true}),           
              });     
              this.quantities.push(h); 
              // this.setItemTypeChange(res.data.inventory_kit_items[i].inventory_item_type_id,res.data.inventory_kit_items[i].inventory_item_id,i);
            }

          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }
      else{
        this.addQuantity();
      } 
    });  
  }


  get fieldsAsFormArray(): any {
    return this.kitForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.kitForm.get("quantities") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      record_id:new FormControl(''),
      inventory_item_type_id: new FormControl(null,[Validators.required]),  
      inventory_item_id: new FormControl(null,[Validators.required]),  
      quantity:new FormControl('',[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
      measurement_type_id:new FormControl({value: '', disabled: true}),            
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

  onSubmit() {  
      this.is_saving = true;
      this.submitted=true;
      this.valid=true;          
      const payload = this.kitForm.value;
      if(this.valid){ //add role
       this.addKit(payload);
      }      
      return 0;           
  }    

  addKit(payload:any)
  {
    let record_id = this.kitForm.controls['record_id'].value; 
    this.inventorySerivce.addKit(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.KIT_LIST)]);
      }    
      this.is_saving = false;
    },(err:any)=>{
      this.is_saving = false;
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
