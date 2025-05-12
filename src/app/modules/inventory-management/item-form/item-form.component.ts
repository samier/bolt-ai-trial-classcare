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
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent {
//#region Public | Private Variables
  edit_view= false
  itemTypeList:any;
  vendorTypeList:any;
  measurementTypeList:any;
  storeTypeList:any;
  record_id:any=0;
  addItemForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants;
  isSumiting:boolean=false;
  file:any = null
  file_name:any = null
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  

  constructor(
    private inventorySerivce: InventoryService,
    private router:Router,
    private route:ActivatedRoute,
    private fb:FormBuilder,
    private toastr: Toastr, 
    public CommonService: CommonService
  ) {
    this.record_id=this.route.snapshot.paramMap.get('id');
   
  }

  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit() {    
    this.initForm();
    if(this.record_id){
      this.edit_view = true;
    }
    this.getStoreList.then(()=>{
      this.getItemList();
      this.getMeasurementTypeList(); 
    }).then(()=>{
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.inventorySerivce.getInventoryItemDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            console.log(res);
            this.addItemForm.controls['inventory_item_type_id'].setValue(res.data.inventory_item_type_id);
            this.addItemForm.controls['item_name'].setValue(res.data.item_name);
            this.addItemForm.controls['description'].setValue(res.data.description);
            this.addItemForm.controls['unit_purchase_price'].setValue(res.data.unit_purchase_price);
            this.addItemForm.controls['unit_sale_price'].setValue(res.data.unit_sale_price);
            this.addItemForm.controls['measurement_type_id'].setValue(res.data.measurement_type_id);
            this.addItemForm.controls['item_expire_date'].setValue(res.data.item_expire_date);
            this.addItemForm.controls['item_stock'].setValue(res.data.item_stock);
            this.addItemForm.controls['minimum_stock'].setValue(res.data.minimum_stock);
            this.addItemForm.controls['reorder_qty'].setValue(res.data.reorder_qty);
            this.addItemForm.controls['reorder_qty'].setValue(res.data.reorder_qty);
            this.addItemForm.controls['inventory_store_id'].setValue(res.data.inventory_store_id);            
            this.addItemForm.controls['record_id'].setValue(res.data.id);              
          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }
    });  
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

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

  onSubmit() {
      this.addItemForm.value.attachment = {base64: this.file, file_name: this.file_name};
      const payload = this.addItemForm.value;
      this.addItem(payload);    
      return 0;           
  }    

  addItem(payload:any)
  {
    this.isSumiting=true;
    let record_id = this.addItemForm.controls['record_id'].value; 
    this.inventorySerivce.addItem(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.INVENTORY_LIST)]);
      }    
      this.isSumiting=false;
    },(err:any)=>{
      this.isSumiting=false;
      this.toastr.showError(err.error.message);
    });    
  }  

  
  onFileChange(event: any) {
    this.file = event.target.files[0];
    this.file_name  = this.file.name;
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const image64 = e.target?.result as string; // Base64 string
      this.file = image64;
    };

    reader.readAsDataURL(this.file);
  }

    //#endregion Public methods
  
    // --------------------------------------------------------------------------------------------------------------
    // #region Private methods
    // --------------------------------------------------------------------------------------------------------------
    initForm(){
      this.addItemForm = new FormGroup({
        inventory_item_type_id: new FormControl(null,[Validators.required]),
        item_name: new FormControl('',[Validators.required]),
        description: new FormControl('',[Validators.required]),
        unit_purchase_price: new FormControl('',[Validators.required]),
        unit_sale_price: new FormControl('',[Validators.required]),
        measurement_type_id: new FormControl(null,[Validators.required]),
        item_expire_date: new FormControl(null),
        item_stock: new FormControl('',[Validators.required]),
        minimum_stock: new FormControl('',[]),
        reorder_qty: new FormControl('',[]),
        inventory_store_id: new FormControl(null,[Validators.required]),
        attachment: new FormControl(''),
        record_id:new FormControl(''),
      });
    }
}
