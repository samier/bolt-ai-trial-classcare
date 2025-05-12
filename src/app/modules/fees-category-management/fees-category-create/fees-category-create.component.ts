import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FeesCategoryManagementService } from '../fees-category-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-fees-category-create',
  templateUrl: './fees-category-create.component.html',
  styleUrls: ['./fees-category-create.component.scss'],
})
export class FeesCategoryCreateComponent implements OnInit {
  URLConstants = URLConstants;
  public fees_id: any;
  //One time / Monthly / Quaterly / Half Yearly / Yearly
  category_list:any=[
  {name:"One Time",id:1},
  {name:"Monthly",id:2},
  {name:"Quaterly",id:3},
  {name:"Half Yearly",id:4},
  {name:"Yearly",id:5},
  ];
  constructor(
    private FeesService: FeesCategoryManagementService,
    private toastr: Toastr,
    private router: Router,
    private route: ActivatedRoute,
    public CommonService: CommonService
  ) {
    // this.fees_id = this.route.snapshot.paramMap.get('id');
  }
  isSchool:any;
  monthDropdownSettings: IDropdownSettings = {};
  months:any = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  selectedMonth:any = [];
  limit:any = null
  formData: any = {
    type_name: null,
    CGST: null,
    SGST: null,
    trust_associated: false,
    category_name_in_gujarati:null,
    category_type:null,
    trust_detail_id: null,
    is_optional: false,
    optional_fees: null,
    months: [],
    courses: [],
    course_fees: {},
    fees_type : null,
    head_id: [null]
  };

  submitted = false;
  validationError: any = [];
  trusts:any = [];
  courses:any = [];
  multiSelectDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  headList:any = [];
  is_editable:any = true;
  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    this.monthDropdownSettings = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true,
      limitSelection : this.limit
    };
    this.getTrustList();
    this.getIncomeHeadList();
    this.fees_id = this.route.snapshot.paramMap.get('id');
    if (this.fees_id) {
      setTimeout(() => {
        this.getTrustDetails();
      }, 10);
    }
    this.getCourseList();
  }

  getTrustList(){
    this.FeesService.getTrustList().subscribe((resp:any) => {
      if(resp.status){
        this.trusts = resp.data.trusts;
        this.isSchool = resp.data.isSchool;
      }
    })
  }

  getTrustDetails() {
    this.FeesService.getTrustDetail(this.fees_id).subscribe((resp: any) => {
      if (resp.status) {
        this.is_editable = resp.data.is_editable;
        for (const field in this.formData) {
          this.formData[field] = field == 'course_fees' ? (Object.keys(resp.data?.[field])?.length > 0 ? resp.data[field]  : {}) : resp.data[field]
        }
        
        this.handleTypeChange(1);
      }
    });
  }

  getCourseList() {
    this.FeesService.getCourseList().subscribe((resp: any) => {
      if (resp.status) {
        this.courses = resp.data; 
      }
    });
  }
  
  getIncomeHeadList(){
    this.FeesService.getIncomeHeadList().subscribe((resp:any) => {
      if(resp.status){
        this.headList = resp.data
      }
    })
  }

  handlePreviousFeesChange(){
    if(this.formData.is_optional == false){
      this.formData.optional_fees = null
    }
  }

  submit() {
    this.submitted = true;
    if (this.checkFormData()) {
      this.formData.trust_associated == false ? this.formData.trust_detail_id = null : this.formData.trust_detail_id
      this.formData['isSchool'] = this.isSchool;
      this.formData.fees_type = this.formData.fees_type ? 1 : null;
      this.FeesService.createTrustDetails(this.formData).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.submitted = false;
            this.toastr.showServerSuccess(resp.message);
            this.clear();
            this.router.navigate([this.setUrl(URLConstants.FEES_CATEGORY_LIST)]);  
          } else {
            this.toastr.showError(resp.message);
            this.validationError = resp.data;
          }
        }
      );
    }
  }

  update(){
    this.submitted = true;
    if (this.checkFormData()) {
      this.formData.trust_associated == false ? this.formData.trust_detail_id = null : this.formData.trust_detail_id
      this.formData['isSchool'] = this.isSchool;
      this.FeesService.updateTrustDetails(this.formData, this.fees_id).subscribe(
        (resp: any) => {
          if (resp.status == true) {
            this.submitted = false;
            this.toastr.showServerSuccess(resp.message);
            this.clear();
            this.router.navigate([this.setUrl(URLConstants.FEES_CATEGORY_LIST)]);  
          }else if(resp.status == 'warn'){
            this.toastr.showError(resp.message);
            this.ngOnInit()
          } else {
            this.toastr.showError(resp.message);
            this.validationError = resp.data;
          }
        }
      );
    }
  }

  checkFormData() {
    if(this.isSchool == 1 && this.formData.months.length != this.limit){
      return false;
    }
    if(this.formData['trust_associated'] == false){
      if(this.formData['type_name'] != null && this.formData['category_type'] != null){
        return true
      }
      else{
        return false
      }
    }else{      
        if (this.formData['type_name'] == null || this.formData['category_type'] == null || this.formData['trust_detail_id'] == null) {
          return false;
        }else{
          return true;
        }
    } 
  }

  handleMonthChange(){

  }

  handleTypeChange(flag?:any){
    if(!flag){
      this.formData.months = [];
    }

    if(this.formData.category_type == 1){
      this.limit = 0;
    }else if(this.formData.category_type == 2){
      this.formData.months = this.months
      this.limit = 12;
    }else if(this.formData.category_type == 3){
      this.limit = 4
    }else if(this.formData.category_type == 4){
      this.limit = 2
    }else if(this.formData.category_type == 5){
      this.limit = 1
    }
    this.monthDropdownSettings = {
      ...this.monthDropdownSettings, // You might want to keep other settings as-is
      limitSelection: this.limit
    };
  }
  clear() {
    this.formData.type_name = null;
    this.formData.CGST = null;
    this.formData.SGST = null;
    this.formData.trust_associated = false;
    this.formData.category_name_in_gujarati =null;
    this.formData.category_type =null;
    this.formData.trust_detail_id = null;
    this.formData.is_optional = false;
    this.formData.months = [];
  }

  cancel(){
    this.router.navigate([this.setUrl(URLConstants.FEES_CATEGORY_LIST)]);  
  }

  canUpdate(type:any){
    if(type == 'Transport Fees'){
      return false;
    }else if(type == 'Hostel Fees'){
      return false;
    }else if(type == 'RTE Fees'){
      return false;
    }else if(type == 'Meal Fees'){
      return false;
    }
    return true;
  }

  removeCourseFees(course:any){
    this.formData.courses = this.formData.courses?.filter(item => item.id != course.id);
    delete this.formData.course_fees[course.id];
  }
}
