import { Component } from '@angular/core';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FeesService } from '../fees.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-fees-receipt-no',
  templateUrl: './fees-receipt-no.component.html',
  styleUrls: ['./fees-receipt-no.component.scss']
})
export class FeesReceiptNoComponent {
  
  constructor(
    private toastr: Toastr,
    private feesService: FeesService,
    public CommonService: CommonService,
    private router: Router,
    private activatedRouteService: ActivatedRoute,
  ) {
    this.form = new FormGroup({
      fees_receipt_type: new FormControl('1'),
      fees_setting_type: new FormControl('1'),
      branches: new FormControl([]),
      fees_category_id: new FormControl([]),
      section_id: new FormControl([]),
      prefix: new FormControl('',[Validators.pattern(/^[a-zA-Z0-9 ]*$/)]),
      no: new FormControl('',[Validators.pattern(/^[0-9]*$/)]),
      fees_receipt_reset: new FormControl('1'),
      trust_id: new FormControl(null),
    });

    this.trustForm = new FormGroup({
      prefix: new FormControl('',[Validators.pattern(/^[a-zA-Z0-9 ]*$/)]),
      no: new FormControl('',[Validators.pattern(/^[0-9]*$/)]),
      fees_receipt_reset: new FormControl('1'),
      trust_id: new FormControl(''),
    });
  }
  id:any = null;
  FeesReceiptTypes:any =  [{id: '1' , name: 'Fees'}, {id: '2' , name: 'Fees Refund'}, {id: '3' , name: 'Wallet'}];
  selectedFeesReceiptType:any = '1';
  FeesSettingTypes:any =  [{id: '1' , name: 'Default'}, {id: '2' , name: 'Branch Wise'}, {id: '3' , name: 'Section Wise'}, {id: '4' , name: 'Trust Wise'}];
  selectedFeesSettingType:any = '1';
  form: FormGroup;
  trustForm: FormGroup;
  trusts:any = [];
  is_trust = null;
  trustSelected = false;
  branches:any = [];
  feesCategories:any = [];
  sections:any = [];

  branchDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'branchName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  feesCategoryDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  sectionDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  URLConstants = URLConstants;

  ngOnInit(): void {    
    
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.getData();
    }
  }

  getData(){
    this.feesService.getFeesReceiptNo(this.id).subscribe((res:any) => {
      this.selectedFeesSettingType = res.data.fees_setting_type.toString()
      this.selectedFeesReceiptType = res.data.fees_receipt_type.toString()
      this.form.get('fees_setting_type')?.setValue(res.data ? res.data.fees_setting_type.toString() : '1');
      this.form.get('fees_receipt_type')?.setValue(res.data ? res.data.fees_receipt_type.toString() : '1');
      this.handleFeesSettingChange().then((resp:any) => {
      
      let branch = [];
      let fees_category = [];
      let section = [];
      if(res.data){
        branch = this.branches.filter((branch:any) => res.data?.branches.includes(branch.id));
        fees_category = this.feesCategories.filter((branch:any) => res.data?.fees_category_id.includes(branch.id));
        section = this.sections.filter((branch:any) => res.data?.section_id.includes(branch.id));
        
      }
      this.form.get('branches')?.setValue(res.data ? branch : []);
      this.form.get('fees_category_id')?.setValue(res.data ? fees_category : []);
      this.form.get('section_id')?.setValue(res.data ? section : []);
      
      this.form.get('trust_id')?.setValue(res.data ? res.data?.trust_id : '');
      this.form.get('prefix')?.setValue(res.data ? res.data.prefix : '');
      this.form.get('no')?.setValue(res.data ? res.data?.no : '');
      this.form.get('fees_receipt_reset')?.setValue(res.data ? res.data.fees_receipt_reset.toString() : '1');
      });
      
      
    });
  }

  getTrusts(){
    return new Promise((resolve) => {
      this.feesService.getTrustDetail().subscribe((resp:any) => {
        if(resp.status){
          this.is_trust = resp.data.isTrust
          this.trusts = resp.data.trusts
          resolve(true)
        }
      })
    })
  }


  FeesSettingType(){
    if(this.selectedFeesSettingType == 1){
      return 'Default';
    }else if(this.selectedFeesSettingType == 2){
      return 'Branch Wise';
    }else if(this.selectedFeesSettingType == 3){
      return 'Section Wise';
    }else{
      return 'Trust Wise';
    }
  }

  FeesReceiptType(){
    return this.FeesReceiptTypes.find((item:any)=>item.id == this.selectedFeesReceiptType)?.['name'];
  }

  handleFeesReceiptChange(){
    if(this.selectedFeesReceiptType == 3){
      this.FeesSettingTypes =  [{id: '1' , name: 'Default'}, {id: '2' , name: 'Branch Wise'}];
    }else{
      this.FeesSettingTypes =  [{id: '1' , name: 'Default'}, {id: '2' , name: 'Branch Wise'}, {id: '3' , name: 'Section Wise'}, {id: '4' , name: 'Trust Wise'}];
    }
    this.selectedFeesSettingType = '1';
    this.handleFeesSettingChange().then((resp:any) => {});
  }

  submit(): void{
    this.form.value.branches = [2,3,'2','3'].includes(this.selectedFeesSettingType) && this.form.value.branches.length > 0 ? this.form.value.branches.map((x:any) => x.id) : []
    this.form.value.fees_category_id = this.selectedFeesReceiptType != 3 && this.form.value.fees_category_id.length > 0 ? this.form.value.fees_category_id.map((x:any) => x.id) : []
    this.form.value.section_id = this.selectedFeesReceiptType != 3 && this.form.value.section_id.length > 0 ? this.form.value.section_id.map((x:any) => x.id) : []
    if(!this.id){
      this.feesService.saveFeesReceiptNo(this.form.value).subscribe((res:any) => {  
        if(res.status == true){
          this.toastr.showSuccess(res.message); 
          this.router.navigate([this.setUrl(URLConstants.FEES_RECEIPT_NO)]);  
        }else if(res.status == 'warn'){
          this.toastr.showWarning(res.message, 'INFO'); 
          this.clearData();
        }else{ 
          this.toastr.showError(res.message)
          this.clearData();
        }
        
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      }); 
    }else{
      this.form.value.id = this.id
      this.feesService.updateFeesReceiptNo(this.form.value, this.id).subscribe((res:any) => {  
        if(res.status == true){
          this.toastr.showSuccess(res.message); 
          this.router.navigate([this.setUrl(URLConstants.FEES_RECEIPT_NO)]);  
        }else if(res.status == 'warn'){
          this.toastr.showWarning(res.message, 'INFO'); 
          this.getData();
        }else{ 
          this.toastr.showError(res.message)
          this.getData();
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      }); 
    }
  }

  submitTrust(){
    this.feesService.saveFeesReceiptNo(this.trustForm.value).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message); 
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  async handleFeesSettingChange(){
    return new Promise(async(resolve) => {
      this.form.value.fees_category_id = []
      this.form.value.section_id = []
      this.form.value.branches = []
      if(this.selectedFeesSettingType == 2){
        this.getBranchList().then(() => {
          this.getFeesCategory().then(() => {
            resolve(true)
          });
        });
      }
      else if(this.selectedFeesSettingType == 3){
        this.getBranchList().then(() => {
          this.getSectionList().then(() => {
            this.getFeesCategory().then(() => {
              resolve(true)
            });
          });
        })
      }
      else if(this.selectedFeesSettingType == 4){
        this.getTrusts().then(() => {
          resolve(true);
        });
      }else if(this.selectedFeesSettingType == 1){
        resolve(true);
      }
    })
  }

  async getBranchList(){
    return new Promise((resolve) => {
      this.feesService.getBranchList().subscribe((resp:any)=>{
        if(resp.status){
          this.branches = resp.data;
          resolve(true)
        }
      })
    })
  }

  async getFeesCategory(){
    return new Promise((resolve) => {
      let data = {
        fees_receipt_type: this.form.value.fees_receipt_type,
        fees_setting_type: this.form.value.fees_setting_type
      }
      this.feesService.getFeesCategory(data).subscribe((resp:any) => {
        if(resp.status){
          this.feesCategories = resp.data; 
          resolve(true)
        }
      })
    });
  }

  async getSectionList(){
    return new Promise((resolve) => {
      let data = {
        branches : this.form.value.branches ?? []
      }
      this.feesService.sectionList(data).subscribe((resp:any)=>{
        if(resp.status){
          this.sections = resp.data;
          resolve(true)
        }
      })
    });
  }

  onBatchSelect(){
    this.getSectionList();
  }

  handleTrustChange(){
    if(this.trustForm.value.trust_id != null){
      this.trustSelected = true;
    }
    else{
      this.trustSelected = true;
    }

    this.feesService.getFeesReceiptNo(this.trustForm.value).subscribe((res:any) => {
      this.trustForm.get('prefix')?.setValue(res.data ? res.data.prefix : '');
      this.trustForm.get('no')?.setValue(res.data ? res.data?.no : '');
      this.trustForm.get('fees_receipt_reset')?.setValue(res.data ? res.data.fees_receipt_reset.toString() : '1');
    });
  }

  clearData(){
    this.form.get('branches')?.setValue([]);
        this.form.get('fees_category_id')?.setValue([]);
        this.form.get('section_id')?.setValue([]);
        
        this.form.get('trust_id')?.setValue('');
        this.form.get('prefix')?.setValue('');
        this.form.get('no')?.setValue('');
        this.form.get('fees_receipt_reset')?.setValue('1');
        this.form.get('fees_setting_type')?.setValue('1');
  }
  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}