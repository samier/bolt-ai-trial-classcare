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
  selector: 'app-internal-issue-form',
  templateUrl: './internal-issue-form.component.html',
  styleUrls: ['./internal-issue-form.component.scss']
})
export class InternalIssueFormComponent {
//#region Public | Private Variables
  edit_view = false
  itemTypeList:any;
  itemList:any = [];
  inventoryItemList:any = [];
  paymentTypeList:any;
  record_id:any=0;
  itemIssueForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  userList:any = [];
  issuedByUserList:any = [];
  studentList:any = [];
  invoiceList:any = []

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
  kitList:any = [];
  item_disabled:any = [];
  max_availability:any = [];

  is_saving:boolean =  false;



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
    this.getStudentList();
    this.getUserList()
    this.getItemList()
    this.getPaymentTypeList()
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.edit_view = true;
        this.inventorySerivce.getInternalIssueDetail(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            if(res.data.item_issue_for==1){
              this.userList = this.studentList;
            }      
            if(res.data.item_issue_for==2){
              this.userList = this.issuedByUserList
            }

            let data = res.data
            let internal_issue_items = res.data.internal_issue_items
            delete(data.internal_issue_items)
            delete(data.attachment)
            if(data.issue_type == 2){
              this.getKitListDropdown()
            }
            this.validatePaymentRequired(data.payment_required)
            data.item_issue_for = data.item_issue_for.toString()
            data.issue_type = data.issue_type.toString()
            data.payment_required = data.payment_required.toString()
            data.issue_for = parseInt(data.issue_for)
            data.kit_id = parseInt(data.kit_id)
            data.payment_mode_id = data.payment_mode_id != null ? parseInt(data.payment_mode_id) : null
            data.issued_by = parseInt(data.issued_by)
            this.itemIssueForm.controls['record_id'].setValue(data.id);
            this.itemIssueForm.patchValue(data)

            for(let i=0;i<internal_issue_items.length;i++){
              this.itemList[i] = internal_issue_items[i].itemList.map((el:any) => {
                return {...el, name: el.item_name}
              });      
              if(data.issue_type == 2){
                this.item_disabled[i] = true;
              }
                let h = this.fb.group({  
                  record_id:internal_issue_items[i].id,
                  inventory_item_type_id: new FormControl(internal_issue_items[i].item_name.inventory_item_type_id),      
                  inventory_item_id: new FormControl(internal_issue_items[i].inventory_item_id),
                  unit_sale_price : new FormControl(internal_issue_items[i].unit_price),
                  quantity: new FormControl(internal_issue_items[i].quantity),        
                  available_quantity: new FormControl(internal_issue_items[i].item_name.available_quantity),        
                  amount:new FormControl((internal_issue_items[i].amount)),        
                  discount:new FormControl(internal_issue_items[i].discount), 
                  discount_type:new FormControl(internal_issue_items[i].discount_type),
                  remark:new FormControl(internal_issue_items[i].remark),
                  total_amount:new FormControl(internal_issue_items[i].total_amount),                        
                });   
                this.quantities.push(h);          
                this.updateAmount(i)
            }
            
          }        
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });        
      }else{
        this.getInternalIssueNo();
        this.addQuantity()
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

  newQuantity(): FormGroup {  
    return this.fb.group({  
      record_id: new FormControl(''),  
      inventory_item_type_id: new FormControl(null, [Validators.required]),  
      inventory_item_id: new FormControl(null,[Validators.required]),  
      unit_sale_price: new FormControl(''),  
      quantity:new FormControl('', [Validators.required,Validators.min(1) ]),        
      available_quantity: new FormControl(''),     
      amount:new FormControl('0',),        
      discount:new FormControl(''), 
      discount_type:new FormControl('amount'),
      remark:new FormControl(''),
      total_amount:new FormControl('0'),
    })  
  }  
     
  addQuantity() {  
    this.quantities.push(this.newQuantity());  
  }  

  issueForChange(event:any){
    if(event.target.id=='type_student'){
     this.userList = this.studentList;
    }
    if(event.target.id=='type_faculty'){
     this.userList = this.issuedByUserList;
    } 
    this.itemIssueForm.controls['issue_for'].reset(); 
  }

  getInternalIssueNo(){
    this.inventorySerivce.getInternalIssueNo().subscribe((resp:any) => {
      if(resp.status){
        this.itemIssueForm.controls['issue_no'].setValue(resp.data)
      }
    })
  }

  issueTypeChange(event:any){
     if(event.target.value == 2){
      this.itemIssueForm.controls['kit_id'].setValidators([Validators.required]);
      this.getKitListDropdown();
     }else{
      this.itemIssueForm.controls['kit_id'].clearValidators();
     }
     this.itemIssueForm.controls['kit_id'].updateValueAndValidity();
  }

  handlePaymentRequired(event:any){
    this.validatePaymentRequired(event.target.value)
  }

  validatePaymentRequired(id:any){
    if(id == 1){
      this.itemIssueForm.controls['payment_mode_id'].setValidators([Validators.required]);
      this.itemIssueForm.controls['payment_status'].setValidators([Validators.required]);
      this.itemIssueForm.controls['payment_status'].setValue("1");
     }else{
      this.itemIssueForm.controls['payment_mode_id'].clearValidators();
      this.itemIssueForm.controls['payment_status'].clearValidators();
      this.itemIssueForm.controls['payment_status'].setValue(null);
      this.itemIssueForm.controls['payment_mode_id'].setValue(null);
     }
     this.itemIssueForm.controls['payment_mode_id'].updateValueAndValidity();
     this.itemIssueForm.controls['payment_status'].updateValueAndValidity();
  }

  getKitListDropdown(){
    this.inventorySerivce.getKitListDropdown().subscribe((resp:any) => {
      if(resp.data){
        this.kitList = resp.data
      }
    })
  }

  handleKitChange(){
    this.clearFormArray(this.itemIssueForm.get("quantities") as FormArray);   
    let data  = {
      kit_id : this.itemIssueForm.value.kit_id
    }
    this.inventorySerivce.getKitItems(data).subscribe((res:any)=>{
      let kitItems = res.data;
      
      for(let i=0;i<kitItems.length;i++){
        this.itemList[i] = kitItems[i].itemList.map((el:any) => {
          return {...el, name: el.item_name}
        });      
       
        this.item_disabled[i] = true;
          let h = this.fb.group({  
            record_id:kitItems[i].id,
            inventory_item_type_id: new FormControl(kitItems[i].inventory_item_type_id),      
            inventory_item_id: new FormControl(kitItems[i].inventory_item_id),
            unit_sale_price : new FormControl(kitItems[i].item_name.unit_sale_price),
            quantity: new FormControl(kitItems[i].quantity),        
            available_quantity: new FormControl(0),        
            amount:new FormControl((kitItems[i].item_name.unit_sale_price * kitItems[i].quantity)),        
            discount:new FormControl(''), 
            discount_type:new FormControl('amount'),
            remark:new FormControl(''),
            total_amount:new FormControl('0'),                        
          });   
          this.quantities.push(h); 
          this.itemChange(kitItems[i].item_name, i);         
          this.updateAmount(i)
      }
    })
  }

  getPaymentTypeList(){
    this.inventorySerivce.getPaymentTypeList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.paymentTypeList = res.data;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }
  
  getUserList(){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.issuedByUserList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
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
        this.studentList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
        this.userList =  this.studentList;
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

  
  itemTypeChange(event:any,i:any){    
    this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(null); 
    this.fieldsAsFormArray.controls?.[i]?.controls?.unit_sale_price.setValue(null); 
    this.fieldsAsFormArray.controls?.[i]?.controls?.available_quantity.setValue(null); 
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


  onSubmit() {
    if(this.quantities.controls.length == 0){
      return this.toastr.showInfo('There is no item left for this invoice no.', 'INFO')
    }        
      this.is_saving = true;

      this.itemIssueForm.value.attachment = {base64: this.file, file_name: this.file_name};
      const payload = this.itemIssueForm.value;
      this.addInternalIssue(payload);   
      return 0;           
  }    

  addInternalIssue(payload:any)
  {
    let record_id = this.itemIssueForm.controls['record_id'].value; 
    this.inventorySerivce.addInternalIssue(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.INTERNAL_ISSUE_LIST)]);
      }    
      this.is_saving = false;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.is_saving = false;
    });    
  } 

  itemChange(event:any, i:any){
    let unit_sale_price = event.unit_sale_price;
    this.fieldsAsFormArray.controls?.[i]?.controls?.unit_sale_price.setValue(unit_sale_price);
    this.fieldsAsFormArray.controls?.[i]?.controls?.available_quantity.setValue(event.available_quantity);
    this.fieldsAsFormArray.controls?.[i]?.controls?.quantity.setValidators([Validators.max(event.available_quantity)]);
    this.fieldsAsFormArray.controls?.[i]?.controls?.quantity.updateValueAndValidity();

    this.max_availability[i] = event.available_quantity
    
  }

  get fieldsAsFormArray(): any {
    return this.itemIssueForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.itemIssueForm.get("quantities") as FormArray  
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
      let amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.unit_sale_price.value);
      let quantity = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.quantity.value);
      let discount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.discount.value);
      let discount_type = this.fieldsAsFormArray.controls?.[i]?.controls.discount_type.value;
      let item_amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.amount.value);
      

      if(isNaN(quantity)){
        quantity=0;
      }
      if(isNaN(discount)){
        discount=0;
      }
      if(isNaN(amount)){
        amount=0;
      }
      
      amount = (amount*quantity);
    
      this.fieldsAsFormArray.controls?.[i]?.controls.amount.setValue(amount);

      let discount_amount = 0
      if(discount_type == 'amount'){
        discount_amount = discount;
      }else{
        discount_amount= (amount * discount)/100;
      }
      if(discount_amount > amount){
        this.fieldsAsFormArray.controls?.[i]?.controls.total_amount.setValue(amount); 
        this.fieldsAsFormArray.controls?.[i]?.controls.discount.setValue(null); 
        return this.toastr.showError('Discont amount must be less then total amount');
      }
      amount = amount - discount_amount;
      
      const calculation = {
        sub_total: item_amount,
        total_amount: amount,
        discount_total: discount_amount,
      };

      this.calculationDetails[i] = calculation;

      this.totalCalculation = this.calculationDetails.reduce((acc: any, element: any) => ({
        sub_total: acc.sub_total + (element.sub_total || 0),
        total_amount: acc.total_amount + (element.total_amount || 0),
        discount_total: acc.discount_total + (element.discount_total || 0),
      }), {
        sub_total: 0,
        total_amount: 0,
        discount_total: 0,
      });

      this.itemIssueForm.patchValue({
        sub_total: this.totalCalculation.sub_total,
        discount_amount: this.totalCalculation.discount_total,
        total:this.totalCalculation.total_amount,
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
      this.itemIssueForm = new FormGroup({
        item_issue_for : new FormControl("1",[Validators.required]),
        issue_for : new FormControl(null,[Validators.required]),
        issue_no : new FormControl('',[Validators.required]),
        item_issue_date : new FormControl('',[Validators.required]),
        issue_type : new FormControl("1",[Validators.required]),
        kit_id : new FormControl(null),
        payment_required : new FormControl("1",[Validators.required]),
        quantities: this.fb.array([]),
        payment_status: new FormControl("1",[Validators.required]),
        payment_mode_id: new FormControl(null,[Validators.required]),
        issued_by: new FormControl(null,[Validators.required]),
        attachment: new FormControl(null),
        sub_total: new FormControl(null),
        discount_amount: new FormControl(null),
        total: new FormControl(null),
        record_id: new FormControl(''),
      });
    }
}
