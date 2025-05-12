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
  selector: 'app-purchase-order-invoice-form',
  templateUrl: './purchase-order-invoice-form.component.html',
  styleUrls: ['./purchase-order-invoice-form.component.scss']
})
export class PurchaseOrderInvoiceFormComponent {
//#region Public | Private Variables
  itemTypeList:any;
  itemList:any;
  inventoryItemList:any = [];
  vendorTypeList:any;
  measurementTypeList:any;
  paymentTypeList:any;
  record_id:any=0;
  edit_view:any=false;
  invoiceForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;

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
    this.getPurchaseOrderList()
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.edit_view = true;
        this.inventorySerivce.getInvoiceOrderDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            this.getItemTypeList(res.data.vendor_id)
            let data = res.data
            let invoice_items = res.data.invoice_items
            delete(data.invoice_items)
            delete(data.attachment)
            data.payment_status = parseInt(data.payment_status)
            data.other_charges =  data.other_charges ?? 0
            data.other_charges_type =  data.other_charges_type ?? 'amount'
            this.invoiceItems = invoice_items;
            
            this.invoiceForm.controls['record_id'].setValue(res.data.id);
            this.invoiceForm.controls['vendor_name'].setValue(res.data?.purchase_order?.vendor?.vendor_name)
            this.invoiceForm.controls['vendor_id'].setValue(res.data?.purchase_order?.vendor_id)
            this.getItemTypeList(res.data?.purchase_order?.vendor_id)
            this.invoiceForm.patchValue(data)

            

            this.igst = []
            this.gst = []
            
            for(let i=0; i<invoice_items.length; i++){
              this.requisition_disabled[i] = true
              this.inventoryItemList[i] = invoice_items[i].itemList.map((el:any) => {
                return {id: el.id, name: el.item_name}
              });
              let item = this.fb.group({  
                record_id:invoice_items[i].id,
                inventory_item_type_id: new FormControl(invoice_items[i].item_name.inventory_item_type_id),      
                inventory_item_id: new FormControl(invoice_items[i].inventory_item_id),
                unit_purchase_price : new FormControl(invoice_items[i].unit_price),
                quantity: new FormControl(invoice_items[i].quantity, [ClassCareValidatores.max(invoice_items[i].max_quantity, "Max quantity is "+invoice_items[i].max_quantity)]),
                amount:new FormControl(invoice_items[i].amount ,[ClassCareValidatores.min(1, "Please enter valid amount")]),          
                discount:new FormControl(invoice_items[i].discount),          
                discount_type:new FormControl(invoice_items[i].discount_type),                 
                cgst:new FormControl(invoice_items[i].cgst),          
                sgst:new FormControl(invoice_items[i].sgst),          
                igst:new FormControl(invoice_items[i].igst),          
                item_amount:new FormControl(invoice_items[i].grand_total),                            
                grand_total:new FormControl(invoice_items[i].grand_total),                                     
              });            
              this.quantities.push(item); 
              this.igst[i] = invoice_items[i].cgst > 0 || invoice_items[i].sgst > 0;
              this.gst[i] = invoice_items[i].igst > 0 ? true : false;
              this.updateAmount(i)
            }
            this.handleAdjAmountChange()
          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }else{
        this.getInvoiceNo()
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

  getInvoiceNo(){
    this.inventorySerivce.getInvoiceNo().subscribe((resp:any) => {
      this.invoiceForm.controls['invoice_no'].setValue(resp.data)
    })
  }

  getPurchaseOrderList(){
    this.inventorySerivce.getPurchaseOrderDropdownList().subscribe((resp:any) => {
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
    let data = {
      purchase_order_id: this.invoiceForm.value.purchase_order_id
    }

    this.inventorySerivce.getPurchaseOrderDetailDropdownList(data).subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
          this.clearFormArray(this.invoiceForm.get("quantities") as FormArray);       
          this.totalCalculation = [];
          this.calculationDetails = [];
        }else{  
          this.invoiceItems = res.data.purchase_orders;

          this.invoiceForm.controls['vendor_name'].setValue(res.data?.vendor?.vendor_name)
          this.invoiceForm.controls['vendor_id'].setValue(res.data?.vendor_id)
          this.invoiceForm.controls['adjustment_amount'].setValue(res.data?.adjustment_amount)
          this.invoiceForm.controls['adjustment_type'].setValue(res.data?.adjustment_type)
          this.getItemTypeList(res.data.vendor_id)
          this.igst = []
          this.gst = []
           // clear requisition item area         
          this.clearFormArray(this.invoiceForm.get("quantities") as FormArray);       
          this.totalCalculation = [];
          this.calculationDetails = [];
  
          // get requisition item information
          let s = res.data.purchase_orders.length;
          
          let status = true;
          for(let i=0;i<s;i++){
              this.inventoryItemList[i] = res.data.purchase_orders[i].itemList.map((el:any) => {
                return {id: el.id, name: el.item_name}
              });
              this.requisition_disabled[i] = true
              
              let h = this.fb.group({  
                record_id:res.data.purchase_orders[i].id,
                inventory_item_type_id: new FormControl(res.data.purchase_orders[i].item.inventory_item_type_id),      
                inventory_item_id: new FormControl(res.data.purchase_orders[i].inventory_item_id),
                unit_purchase_price : new FormControl(res.data.purchase_orders[i].item.unit_purchase_price),
                quantity: new FormControl(res.data.purchase_orders[i].quantity,[ClassCareValidatores.max(res.data.purchase_orders[i].quantity, "Max quantity is "+res.data.purchase_orders[i].quantity)]),
                amount:new FormControl((res.data.purchase_orders[i].item.unit_purchase_price * res.data.purchase_orders[i].quantity), [ClassCareValidatores.min(1, "Please enter valid amount")]),          
                discount:new FormControl(res.data.purchase_orders[i].discount),          
                discount_type:new FormControl(res.data.purchase_orders[i].discount_type),          
                discount_amount:new FormControl(res.data.purchase_orders[i].discount_type),          
                cgst:new FormControl(res.data.purchase_orders[i].cgst),          
                sgst:new FormControl(res.data.purchase_orders[i].sgst),          
                igst:new FormControl(res.data.purchase_orders[i].igst),          
                item_amount:new FormControl((res.data.purchase_orders[i].grand_total)),                            
                grand_total:new FormControl((res.data.purchase_orders[i].grand_total)),                            
              });                          
              this.quantities.push(h); 
              this.updateAmount(i)
          }
          this.handleAdjAmountChange()
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
      return this.toastr.showInfo('There is not items for invoice verification.', 'INFO');
    }    
    this.is_saving = true;   
      this.invoiceForm.value.attachment = {base64: this.file, file_name: this.file_name};
      const payload = this.invoiceForm.value;
      this.addInvoice(payload);   
      return 0;           
  }    

  addInvoice(payload:any)
  {
    let record_id = this.invoiceForm.controls['record_id'].value; 
    this.inventorySerivce.addInvoice(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.INVOICE_ORDER_LIST)]);
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
    return this.invoiceForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.invoiceForm.get("quantities") as FormArray  
  }  

  getAmount(i:any): any {
        return this.fieldsAsFormArray.controls?.[i]?.controls?.amount;
  }
  getDiscount(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.discount;
  }

  getTaxAmount(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.tax_amount;
  }

  getQuantity(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.quantity;
  }

  getItemAmount(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.item_amount;
  }

  getGrandTotal(i:any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.grand_total;
  }

  updateAmount(i:any)
  {
      let amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.unit_purchase_price.value);
      let item_amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.amount.value);
      let discount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.discount.value);
      let discount_type = this.fieldsAsFormArray.controls?.[i]?.controls.discount_type.value;
      let cgst = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.cgst.value);
      let sgst = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.sgst.value);
      let igst = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.igst.value);
      let quantity = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.quantity.value);
      
      

      if(isNaN(quantity)){
        quantity=0;
      }
      if(isNaN(cgst)){
        cgst=0;
      }
      if(isNaN(sgst)){
        sgst=0;
      }
      if(isNaN(igst)){
        igst=0;
      }
      if(isNaN(discount)){
        discount=0;
      }
      if(isNaN(amount)){
        amount=0;
      }

      this.igst[i] = cgst > 0 || sgst > 0;
      this.gst[i] = igst > 0 ? true : false;
      
      amount = (amount*quantity);
    
      this.fieldsAsFormArray.controls?.[i]?.controls.amount.setValue(amount);

      let discount_amount = 0
      if(discount_type == 'amount'){
        discount_amount = discount;
      }else{
        discount_amount= (amount * discount)/100;
      }
      if(discount_amount > amount){
        this.fieldsAsFormArray.controls?.[i]?.controls.grand_total.setValue(amount); 
        this.fieldsAsFormArray.controls?.[i]?.controls.discount.setValue(null); 
        return this.toastr.showError('Discont amount must be less then total amount');
      }
      amount = amount - discount_amount;
      
      let cgstTax = (amount * cgst)/100;
      let sgstTax = (amount * sgst)/100;
      let igstTax = (amount * igst)/100;
      amount = amount + cgstTax + sgstTax + igstTax;
      
      const calculation = {
        sub_total: item_amount,
        grand_total: amount,
        discount_total: discount_amount,
        cgst: cgstTax,
        sgst: sgstTax,
        igst: igstTax,
      };
      

      this.calculationDetails[i] = calculation;
      

      this.totalCalculation = this.calculationDetails.reduce((acc: any, element: any) => ({
        sub_total: acc.sub_total + (element.sub_total || 0),
        grand_total: acc.grand_total + (element.grand_total || 0),
        discount_total: acc.discount_total + (element.discount_total || 0),
        cgst: acc.cgst + (element.cgst || 0),
        sgst: acc.sgst + (element.sgst || 0),
        igst: acc.igst + (element.igst || 0),
      }), {
        sub_total: 0,
        grand_total: 0,
        discount_total: 0,
        cgst: 0,
        sgst: 0,
        igst: 0
      });
      

      this.invoiceForm.patchValue({
        sub_total: this.totalCalculation.sub_total,
        discount_total: this.totalCalculation.discount_total,
        taxable_amount: this.totalCalculation.sub_total - this.totalCalculation.discount_total,
        cgst_amount: this.totalCalculation.cgst,
        sgst_amount: this.totalCalculation.sgst,
        igst_amount: this.totalCalculation.igst,
        total_amount:this.totalCalculation.grand_total,
      });
  
      
      this.fieldsAsFormArray.controls?.[i]?.controls.grand_total.setValue(amount); 
      this.handleAdjAmountChange()
  }


  handleAdjAmountChange(){
    let taxable_amount = this.invoiceForm.controls['taxable_amount'].value
    let cgst_amount = this.invoiceForm.controls['cgst_amount'].value
    let sgst_amount = this.invoiceForm.controls['sgst_amount'].value
    let igst_amount = this.invoiceForm.controls['igst_amount'].value
    
    let amount_before_adjustment = (parseFloat(taxable_amount) + parseFloat(cgst_amount) + parseFloat(sgst_amount) + parseFloat(igst_amount))
    
    
    let adj_amount = this.invoiceForm.controls['adjustment_amount'].value
    let adj_type = this.invoiceForm.controls['adjustment_type'].value
    
    if(adj_amount == null || adj_amount == ""){
      adj_amount = 0
    }
   
    

    
      let amount = 0;
      if(adj_type == 'increment'){
        amount = amount + parseFloat(adj_amount)
      }else{
        amount = amount - parseFloat(adj_amount)
      }

      

      let other_charges_amount = this.invoiceForm.controls['other_charges'].value
      let other_charges_type = this.invoiceForm.controls['other_charges_type'].value

      if(other_charges_amount == null || other_charges_amount == ""){
        other_charges_amount = 0
      }

      if(other_charges_type  == 'amount'){
        amount = amount + parseFloat(other_charges_amount)
      }else{
        amount = amount + ((amount_before_adjustment * parseFloat(other_charges_amount))/ 100)
      }

      
      
      this.invoiceForm.controls['total_amount'].setValue(amount_before_adjustment + amount)
    
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
      this.invoiceForm = new FormGroup({
        purchase_order_id : new FormControl(null,[Validators.required]),
        vendor_name : new FormControl(''),
        vendor_id : new FormControl(''),
        invoice_date : new FormControl('',[Validators.required]),
        invoice_no : new FormControl('',[Validators.required]),
        payment_status : new FormControl(null,[Validators.required]), 
        attachment: new FormControl(''),
        quantities: this.fb.array([]),
        sub_total: new FormControl(''),
        discount_total: new FormControl(''),
        adjustment_amount: new FormControl('0'),
        adjustment_type: new FormControl('increment'),
        taxable_amount: new FormControl(''),
        cgst_amount: new FormControl(''),
        sgst_amount: new FormControl(''),
        igst_amount: new FormControl(''),
        other_charges: new FormControl('0'),
        other_charges_type: new FormControl('amount'),
        total_amount: new FormControl(''),
        record_id: new FormControl(''),
      });
    }
}
