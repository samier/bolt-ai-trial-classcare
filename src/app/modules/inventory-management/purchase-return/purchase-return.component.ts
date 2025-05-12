import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';
import { discountType, incrementDecrement, requisitionStatus } from 'src/app/common-config/static-value';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.scss']
})
export class PurchaseReturnComponent {
//#region Public | Private Variables
  submitted:any=false;
  public valid = true;
  public roleList:any;
  itemTypeList:any;
  itemList:any;
  inventoryItemList:any = [];
  vendorTypeList:any;
  measurementTypeList:any;
  paymentTypeList:any;
  item_code:any;
  item_name:any;
  record_id:any=0;
  purchase_date:any;
  delivery_date:any;
  is_disabled = false;
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  display_status_change = "none";
  status:any;
  edit_view:any=false;
  selectedRequsition:any=[];
  selectedVendor:any=[];
  x = Math.floor((Math.random() * 1000) + 1);
  purchaseReturnForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  userList:any = [];
  invoiceList:any = []
  paymentStatus = [{id: 1, name: 'Paid'}]

  file:any = null
  file_name:any = null

  discount_type= discountType
  requisition_disabled:any = [];
  gst:any = [];
  igst:any = [];

  calculationDetails:any = []
  totalCalculation:any = []
  disable_requisition:boolean = false;
  incrementDecrement:any = incrementDecrement

  purchaseOrderList:any = []

  invoiceItems:any = []
  invoice_date:any = null;
  return_quantity:any = []

  is_saving:boolean = false;



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
    this.getUserList()
    this.getPurchaseOrderList()
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.edit_view = true;
        this.inventorySerivce.getPurchaseReturnDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            
            this.getInvoiceListByPo(res.data.purchase_order_id)
            let data = res.data
            let purchase_items = res.data.purchase_items
            delete(data.purchase_items)
            delete(data.attachment)
            data.other_charges =  data.other_charges ?? 0
            data.other_charges_type =  data.other_charges_type ?? 'amount'
            this.invoiceItems = purchase_items;
            
            this.purchaseReturnForm.controls['record_id'].setValue(res.data.id);
            this.purchaseReturnForm.controls['vendor_name'].setValue(res.data?.purchase_order?.vendor?.vendor_name)
            this.purchaseReturnForm.controls['vendor_id'].setValue(res.data?.purchase_order?.vendor_id)
            
            this.purchaseReturnForm.patchValue(data)

            

            this.igst = []
            this.gst = []
            
            for(let i=0; i<purchase_items.length; i++){
              this.return_quantity[i] = (parseInt(purchase_items[i].quantity)) - parseInt(purchase_items[i].total_returned_quantity)
              let item = this.fb.group({  
                record_id:purchase_items[i].id,
                inventory_item_type: new FormControl(purchase_items[i].item_name.inventory_item_type.name), 
                inventory_item_type_id: new FormControl(purchase_items[i].item_name.inventory_item_type_id),      
                inventory_item: new FormControl(purchase_items[i].item_name.item_name),
                inventory_item_id: new FormControl(purchase_items[i].item_name.id),
                unit_purchase_price : new FormControl(purchase_items[i].unit_price),
                quantity: new FormControl(purchase_items[i].quantity),
                total_returned_quantity: new FormControl(purchase_items[i].total_returned_quantity),
                amount:new FormControl(purchase_items[i].amount),  
                return_quantity: new FormControl(purchase_items[i].return_quantity,[ClassCareValidatores.max((this.return_quantity[i]), "Max quantity is "+(this.return_quantity[i]))]),                            
                total_amount:new FormControl(purchase_items[i].return_total_amount),                                            
              });            
              this.quantities.push(item); 
              this.updateAmount(i)
            }
          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }else{

      }
  }


     
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  removeQuantity(i:number) {  
    this.quantities.removeAt(i);  
    this.updateAmount(i)
    
    for(let j = 0; j<this.quantities.controls.length; j++){
      
      this.updateAmount(j)
    }
    if(this.quantities.controls.length == 0){
      this.disable_requisition = false
    }
  }  

  getUserList(){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
   }

  getPurchaseOrderList(){
    this.inventorySerivce.getPurchaseOrderListForReturn().subscribe((resp:any) => {
      if(resp.status==false){
        this.toastr.showError(resp.message);
      }else{
       this.purchaseOrderList = resp.data
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }

  handlePoChange(){
    this.purchaseReturnForm.controls['invoice_id'].setValue(null)
    this.clearFormArray(this.purchaseReturnForm.get("quantities") as FormArray);      

    this.getInvoiceListByPo(this.purchaseReturnForm.value.purchase_order_id)

  }

  getInvoiceListByPo(id:any){
    let data = {
      purchase_order_id: id
    }
    this.inventorySerivce.getInvoiceListByPo(data).subscribe((resp:any)=>{
      if(resp.status){
          this.invoiceList = resp.data.invoice_list
          this.purchaseReturnForm.controls['vendor_name'].setValue(resp.data?.purchase_order?.vendor?.vendor_name)
          this.purchaseReturnForm.controls['vendor_id'].setValue(resp.data?.purchase_order?.vendor_id)
      }
    })
  }

  handleInvoiceChange(){
    let data = {
      invoice_id: this.purchaseReturnForm.value.invoice_id
    }

    this.inventorySerivce.getInvoiceDetails(data).subscribe((res:any) => {
      this.clearFormArray(this.purchaseReturnForm.get("quantities") as FormArray);       
      this.totalCalculation = [];
      this.calculationDetails = [];
      this.igst = []
      this.gst = []

        if(res.status==false){
          this.toastr.showError(res.message);
        }else{  
          this.invoice_date = res.data.invoice_date
          this.invoiceItems = res.data.purchase_items;
          // get requisition item information
          let s = res.data.purchase_items.length;
          if(s == 0){
            return this.toastr.showInfo('There is no item left for this invoice no.', 'INFO')
          }
          let status = true;
          for(let i=0;i<s;i++){
            this.return_quantity[i] = parseInt(res.data.purchase_items[i].quantity) - parseInt(res.data.purchase_items[i].total_returned_quantity);
              let h = this.fb.group({  
                record_id:res.data.purchase_items[i].id,
                inventory_item_type: new FormControl(res.data.purchase_items[i].item_name.inventory_item_type.name), 
                inventory_item_type_id: new FormControl(res.data.purchase_items[i].item_name.inventory_item_type_id),      
                inventory_item: new FormControl(res.data.purchase_items[i].item_name.item_name),
                inventory_item_id: new FormControl(res.data.purchase_items[i].item_name.id),
                unit_purchase_price : new FormControl(res.data.purchase_items[i].unit_price),
                quantity: new FormControl(res.data.purchase_items[i].quantity,[ClassCareValidatores.max(res.data.purchase_items[i].quantity, "Max quantity is "+res.data.purchase_items[i].quantity)]),
                total_returned_quantity: new FormControl(res.data.purchase_items[i].total_returned_quantity),
                amount:new FormControl((res.data.purchase_items[i].amount)),   
                return_quantity: new FormControl(0,[ClassCareValidatores.max(( this.return_quantity[i]), "Max quantity is "+( this.return_quantity[i]))]),                            
                total_amount:new FormControl(0),                            
              });            
              this.quantities.push(h); 
              this.updateAmount(i)
          }
        }        
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });   
  }
  
  getItemTypeList(id){
    let data = {
      vendor_id: id
    }
    this.inventorySerivce.getItemTypeListByVendor(data).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemTypeList = res.data.inventory_item_types;      
        this.itemList = res.data.inventory_items
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }


  getInventoryList(){
    this.inventorySerivce.getInventoryList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });        
  }


  onSubmit() {
    if(this.quantities.controls.length == 0){
      return this.toastr.showInfo('There is no item left for this invoice no.', 'INFO')
    }
      this.submitted=true;
      this.valid=true;      
      this.is_saving = true;    
      this.purchaseReturnForm.value.attachment = {base64: this.file, file_name: this.file_name};
      const payload = this.purchaseReturnForm.value;
      if(this.valid){ //add role
       this.addPurchaseReturn(payload);
      }      
      return 0;           
  }    

  addPurchaseReturn(payload:any)
  {
    let record_id = this.purchaseReturnForm.controls['record_id'].value; 
    this.inventorySerivce.addPurchaseReturn(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.PURCHASE_RETURN_LIST)]);
      }    
      this.is_saving = false;    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.is_saving = false;    
    });    
  }  

  itemTypeChange(event:any,i:any){    
    this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(null); 
    this.inventorySerivce.fetchItemList(event.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.inventoryItemList[i] = res.data.map((el:any) => {
          return {...el, name: el.item_name}
        });      
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.reset(); 
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });     
  }

  itemChange(event:any, i:any){
    let unit_purchase_price = event.unit_purchase_price;
    this.fieldsAsFormArray.controls?.[i]?.controls?.unit_purchase_price.setValue(unit_purchase_price);
    
  }

  get fieldsAsFormArray(): any {
    return this.purchaseReturnForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.purchaseReturnForm.get("quantities") as FormArray  
  }  

  getItemTypeName(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_type;
  }

  getItemName(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item;
  }

  getAmount(i:any): any {
        return this.fieldsAsFormArray.controls?.[i]?.controls?.amount;
  }

  getQuantity(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.quantity;
  }

  getItemAmount(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.item_amount;
  }

  getGrandTotal(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.total_amount;
  }

  updateAmount(i:any)
  {
      let amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.unit_purchase_price.value);
      let return_quantity = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.return_quantity.value);
      

      if(isNaN(return_quantity)){
        return_quantity=0;
      }
      
      amount = (amount*return_quantity);
    
      const calculation = {
        total_amount: amount,
      };

      this.calculationDetails[i] = calculation;   

      this.totalCalculation = this.calculationDetails.reduce((acc: any, element: any) => ({
        total_amount: acc.total_amount + (element.total_amount || 0),
      }), {
        total_amount: 0,
      });

      this.purchaseReturnForm.patchValue({
        total_amount: this.totalCalculation.total_amount,
      });
         
      this.fieldsAsFormArray.controls?.[i]?.controls.total_amount.setValue(amount); 
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
      this.purchaseReturnForm = new FormGroup({
        purchase_order_id : new FormControl(null,[Validators.required]),
        vendor_name : new FormControl(''),
        vendor_id : new FormControl(''),
        invoice_id : new FormControl(null,[Validators.required]),
        return_reason : new FormControl('',[Validators.required]),
        return_date : new FormControl('',[Validators.required]),
        return_by : new FormControl(null,[Validators.required]),
        attachment : new FormControl(''),
        quantities: this.fb.array([]),
        total_amount : new FormControl(''),
        record_id: new FormControl(''),
      });
    }
}
