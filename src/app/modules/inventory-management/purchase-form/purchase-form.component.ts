import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss']
})
export class PurchaseFormComponent {

  submitted:any=false;
  public valid = true;
  public roleList:any;
  itemTypeList:any;
  vendorTypeList:any;
  measurementTypeList:any;
  storeTypeList:any;
  record_id:any=0;
  constructor(
    private inventorySerivce: InventoryService,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
    this.purchaseForm = new FormGroup({
      inventory_item_id: new FormControl(''),
      vendor_id: new FormControl(''),
      measurement_type_id: new FormControl(''),
      quantity: new FormControl('',[Validators.required,Validators.pattern(/^[0-9\.]*$/)]),
      purchased_order_no: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z0-9\- ]*$/)]),
      total_amount: new FormControl(''),
      tax_amount: new FormControl(''),
      invoice_no: new FormControl(''),
      invoice_date: new FormControl('',[Validators.required,Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      purchased_date:new FormControl('',[Validators.required,Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      record_id:new FormControl(''),
    });
  }

  purchaseForm: FormGroup;
  ngOnInit() {      
    this.getStoreList.then(()=>{
      this.getItemList();
      this.getVendorTypeList(); 
      this.getMeasurementTypeList(); 
    }).then(()=>{
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.inventorySerivce.getPurchaseDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            console.log(res);
            this.purchaseForm.controls['purchased_order_no'].setValue(res.data.purchased_order_no);      
            this.purchaseForm.controls['inventory_item_id'].setValue(res.data.inventory_item_id);   
            this.purchaseForm.controls['vendor_id'].setValue(res.data.vendor_id);              
            this.purchaseForm.controls['measurement_type_id'].setValue(res.data.measurement_type_id);              
            this.purchaseForm.controls['quantity'].setValue(res.data.quantity);              
            this.purchaseForm.controls['total_amount'].setValue(res.data.total_amount);              
            this.purchaseForm.controls['tax_amount'].setValue(res.data.tax_amount);              
            this.purchaseForm.controls['invoice_no'].setValue(res.data.invoice_no);              
            this.purchaseForm.controls['invoice_date'].setValue(res.data.invoice_date);              
            this.purchaseForm.controls['purchased_date'].setValue(res.data.purchased_date);              
            this.purchaseForm.controls['record_id'].setValue(res.data.id);              
          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      } 
    });  

    
  }
  URLConstants = URLConstants;

  getItemList(){
    this.inventorySerivce.getInventoryList().subscribe((res:any) => {
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


  onSubmit() {
      this.submitted=true;
      this.valid=true;          
      const payload = this.purchaseForm.value;
      if(this.valid){ //add role
       this.addPurchaseOrder(payload);
      }      
      return 0;           
  }    

  addPurchaseOrder(payload:any)
  {
    let record_id = this.purchaseForm.controls['record_id'].value; 
    console.log(payload);
    this.inventorySerivce.addPurchaseOrder(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.PURCHASE_LIST),0]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  itemChange(event:any){        
    this.purchaseForm.controls['measurement_type_id'].setValue(event.measurement_type_id);         
  }
 
}
