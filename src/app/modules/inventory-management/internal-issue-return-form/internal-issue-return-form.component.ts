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
  selector: 'app-internal-issue-return-form',
  templateUrl: './internal-issue-return-form.component.html',
  styleUrls: ['./internal-issue-return-form.component.scss']
})
export class InternalIssueReturnFormComponent {
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
  issueItemReturnForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  userList:any = [];
  invoiceList:any = []
  paymentStatus = [{id: 1, name: 'Paid'}]

  file:any = null
  file_name:any = null

  calculationDetails:any = []
  totalCalculation:any = []

  issueList:any = []

  issueItems:any = []
  invoice_date:any = null;
  return_quantity:any = []
  today:any = null

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
    this.today = new Date()
  }


  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit() {    
    this.initForm();
    this.getUserList()
    this.getInternalIssueDropdownList()
      if(this.record_id != null && this.record_id !='' && this.record_id !=0){
        this.edit_view = true;
        this.inventorySerivce.showInternalIssueReturn(this.record_id).subscribe((res:any) => {
          if(res.status==false){
            this.toastr.showError(res.message);
          }else{
            let data = res.data
            let internal_issue_items = res.data.issue_return_items
            delete(data.issue_return_items)
            delete(data.attachment)
            data.received_by = parseInt(data.received_by)
            if(data.item_issue_for == 1){
              data.name = data.issued_for_student.full_name
            }else{
              data.name = data.issued_for_user.full_name
            }

            this.issueItemReturnForm.controls['record_id'].setValue(res.data.id);
            this.issueItemReturnForm.patchValue(data)
            this.issueItems = internal_issue_items;
            // get requisition item information
            let s = internal_issue_items.length;
            for(let i=0;i<s;i++){
              this.return_quantity[i] =  (parseInt(internal_issue_items[i].issue_quantity)) - parseInt(internal_issue_items[i].total_returned_quantity)
                let h = this.fb.group({  
                  record_id:internal_issue_items[i].id,
                  inventory_item_type: new FormControl(internal_issue_items[i].item_name.inventory_item_type.name), 
                  inventory_item_type_id: new FormControl(internal_issue_items[i].item_name.inventory_item_type_id),      
                  inventory_item: new FormControl(internal_issue_items[i].item_name.item_name),
                  inventory_item_id: new FormControl(internal_issue_items[i].item_name.id),
                  unit_sale_price : new FormControl(internal_issue_items[i].unit_price),
                  issue_quantity: new FormControl(internal_issue_items[i].issue_quantity),
                  total_returned_issue_quantity: new FormControl(internal_issue_items[i].total_returned_quantity),
                  amount:new FormControl((internal_issue_items[i].amount)),   
                  return_issue_quantity: new FormControl(internal_issue_items[i].return_issue_quantity,[ClassCareValidatores.max(( this.return_quantity[i]), "Max quantity is "+( this.return_quantity[i]))]),                            
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

      }
  }


     
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
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

  handleIssueChange(){
    let internal_issue_id = this.issueItemReturnForm.value.internal_issue_id

    let internal_issue = this.issueList.find((el:any) => el.id == internal_issue_id);
    this.issueItemReturnForm.controls['name'].setValue(internal_issue.issue_for_name);
    this.issueItemReturnForm.controls['item_issue_for'].setValue(internal_issue.item_issue_for);
    this.issueItemReturnForm.controls['issue_for'].setValue(internal_issue.issue_for);
    

    this.inventorySerivce.getInternalIssueDetail(internal_issue_id).subscribe((res:any) => {
      this.clearFormArray(this.issueItemReturnForm.get("quantities") as FormArray);       
      this.totalCalculation = [];
      this.calculationDetails = [];

        if(res.status==false){
          this.toastr.showError(res.message);
        }else{  
          this.issueItems = res.data.internal_issue_items;
          // get requisition item information
          let s = res.data.internal_issue_items.length;
          for(let i=0;i<s;i++){
            this.return_quantity[i] = parseInt(res.data.internal_issue_items[i].quantity) - parseInt(res.data.internal_issue_items[i].total_returned_quantity);
              let h = this.fb.group({  
                record_id:res.data.internal_issue_items[i].id,
                inventory_item_type: new FormControl(res.data.internal_issue_items[i].item_name.inventory_item_type.name), 
                inventory_item_type_id: new FormControl(res.data.internal_issue_items[i].item_name.inventory_item_type_id),      
                inventory_item: new FormControl(res.data.internal_issue_items[i].item_name.item_name),
                inventory_item_id: new FormControl(res.data.internal_issue_items[i].item_name.id),
                unit_sale_price : new FormControl(res.data.internal_issue_items[i].unit_price),
                issue_quantity: new FormControl(res.data.internal_issue_items[i].quantity),
                total_returned_issue_quantity: new FormControl(res.data.internal_issue_items[i].total_returned_quantity),
                amount:new FormControl((res.data.internal_issue_items[i].amount)),   
                return_issue_quantity: new FormControl(0,[ClassCareValidatores.max(( this.return_quantity[i]), "Max quantity is "+( this.return_quantity[i]))]),                            
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

  getInternalIssueDropdownList(){
    this.inventorySerivce.getInternalIssueDropdownList().subscribe((resp:any) => {
      if(resp.status){
        this.issueList = resp.data
      }
    })
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
      this.issueItemReturnForm.value.attachment = {base64: this.file, file_name: this.file_name};
      const payload = this.issueItemReturnForm.value;
      if(this.valid){ //add role
       this.addInternalIssueReturn(payload);
      }      
      return 0;           
  }    

  addInternalIssueReturn(payload:any)
  {
    let record_id = this.issueItemReturnForm.controls['record_id'].value; 
    this.inventorySerivce.addInternalIssueReturn(payload,record_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.INTERNAL_ISSUE_RETURN_LIST)]);
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
    return this.issueItemReturnForm.get('quantities') as FormArray;
  }

  get quantities() : FormArray {  
    return this.issueItemReturnForm.get("quantities") as FormArray  
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
      let return_quantity = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.return_issue_quantity.value);
      

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

      this.issueItemReturnForm.patchValue({
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
      this.issueItemReturnForm = new FormGroup({
        internal_issue_id : new FormControl(null,[Validators.required]),
        item_issue_for:new FormControl(''),
        issue_for : new FormControl(''),
        name : new FormControl(''),
        return_date : new FormControl('',[Validators.required]),
        remark : new FormControl('',[Validators.required]),
        received_by : new FormControl(null,[Validators.required]),
        attachment : new FormControl(''),
        total_amount : new FormControl(''),
        quantities: this.fb.array([]),
        record_id: new FormControl(''),
      });
    }
}
