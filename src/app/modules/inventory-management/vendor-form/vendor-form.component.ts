import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss']
})
export class VendorFormComponent {
//#region Public | Private Variables
  id:any;
  URLConstants = URLConstants;
  addvendorform: FormGroup = new FormGroup({})
  states:any = [];
  allCities:any = [];
  cities:any = [];
  itemList:any = [];
  edit_view = false
  headList:any = [];

  is_saving:boolean = false;

    //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private router:Router,
    private fb:FormBuilder,
    private toastr: Toastr,
    public CommonService: CommonService,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit() {   
    this.initForm()
    this.getStatesAndCities()
    this.getInventoryItems()
    this.getExpenseHeadList();
    if(this.id != null && this.id !='' && this.id !=0){
      this.edit_view = true;
      this.inventoryService.getVendorDetail(this.id).subscribe((res:any) => {
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          res.data.whatsapp_same_as_mobile = res.data.whatsapp_same_as_mobile.toString()
          res.data.state = parseInt(res.data.state)
          this.handleStateChange({id:res.data.state })
          res.data.city = parseInt(res.data.city)
          res.data.vendor_selling_items = res.data.items.map((item:any) => {
            return {id:item.id,name:item.item_name};      
          });
          this.addvendorform.patchValue(res.data);     
        }        
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });        
    }
  }
  

  onSubmit() {        
    this.is_saving = true;
      const payload = this.addvendorform.value;
      this.addVendor(payload);   
      return 0;           
  }    

  addVendor(payload:any)
  {
    this.inventoryService.addVendor(payload,this.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.VENDOR_LIST)]);
      }    
      this.is_saving = false;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.is_saving = false;
    });    
  }  

  getInventoryItems(){
    this.inventoryService.getInventoryList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.itemList = res.data.map((item:any) => {
          return {id:item.id,name:item.item_name};      
        });
      }     
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  getStatesAndCities(){
    this.inventoryService.getStatesAndCities().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.states = res.data.states;      
        this.allCities = res.data.cities;      
        this.cities = res.data.cities;      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  getExpenseHeadList(){
    this.inventoryService.getExpenseHeadList().subscribe((resp:any) => {
      if(resp.status){
        this.headList = resp.data
      }
    })
  }

  handleStateChange(value:any){
    this.addvendorform.controls['city'].setValue(null);      
    let countryId = value.id;
    this.cities = this.allCities.filter((city:any) => city.state_id == countryId);
    
  }

  handleNumberSelect(event:any){
    if(event.target.value == '1'){
      this.addvendorform.controls['contact_person_whatsapp_no'].clearValidators();
    }else{
      this.addvendorform.controls['contact_person_whatsapp_no'].setValidators([Validators.required,Validators.pattern(/^[0-9]{10}$/)]);
    }
    this.addvendorform.controls['contact_person_whatsapp_no'].updateValueAndValidity();
    
  }


  //#endregion Public methods
  
    // --------------------------------------------------------------------------------------------------------------
    // #region Private methods
    // --------------------------------------------------------------------------------------------------------------

    initForm(){
      this.addvendorform = new FormGroup({
        vendor_name: new FormControl('',[Validators.required]),
        vendor_office_no: new FormControl('',[Validators.required, Validators.minLength(10),Validators.maxLength(10)]),
        vendor_office_email: new FormControl('',[Validators.required, Validators.email]),
        contact_person_name: new FormControl('',[Validators.required]),
        contact_person_no: new FormControl('',[Validators.required,Validators.minLength(10),Validators.maxLength(10)]),
        whatsapp_same_as_mobile: new FormControl('0'),
        contact_person_whatsapp_no: new FormControl('',[Validators.required,Validators.minLength(10),Validators.maxLength(10)]),
        contact_person_email: new FormControl('',[Validators.required,Validators.email]),
        address: new FormControl('',[Validators.required]),
        state: new FormControl(null,[Validators.required]),
        city: new FormControl(null,[Validators.required]),
        pincode:new FormControl('',[Validators.required]),
        gst_no:new FormControl(''),
        pan_no:new FormControl(''),
        tan_no:new FormControl(''),
        vendor_selling_items:new FormControl('',[Validators.required]),
        head_id: new FormControl(null),
      });
    }
}
