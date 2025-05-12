import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FeeCollectionCenterService } from '../fee-collection-center.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FeesService } from 'src/app/modules/fees/fees.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-fees-collection-detail',
  templateUrl: './fees-collection-detail.component.html',
  styleUrls: ['./fees-collection-detail.component.scss']
})
export class FeesCollectionDetailComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  URLConstants = URLConstants;
  collectionDetailsForm: FormGroup | any;
  formSubmitted: boolean = false;
  collectionsUsers = []

  constructor(
    private feeCollectionCenterService: FeeCollectionCenterService,
    private feeService: FeesService,
    private formBuilder: FormBuilder,
    private toaster:Toastr,
    public router: Router,
    private route: ActivatedRoute,
    public commonService : CommonService
  ) { }

  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  collectionId
  paymentTypeList:any;
  reportModes:any;
  receiptModes:any;
  zero_fee_receipt_mode:any;
  submitLoading = false;
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.collectionId = params.get('id');
      if(this.collectionId) {
        this.getCollectionCenterById(this.collectionId)
      }
    });
   
    this.selectedItems = [
    ];

    this.getAcademicYearId()
    this.initForm()
    this.getPermissionsList()
    
  }

  getPermissionsList(){
    this.feeService.getPermissionsList().subscribe((response:any) => {
      this.paymentTypeList = response.data?.payment_modes;
      this.reportModes = response.data?.fee_report_mode;
      this.receiptModes = response.data?.receipt_mode;
      this.zero_fee_receipt_mode = response.data?.zero_fee_receipt_mode;
    });
  }

  getPaymentModes(){
    this.feeService.getPaymentModes().subscribe((response:any) => {
      this.paymentTypeList = response.data;
    });
  }

  getReportPermissionModes(){
    this.feeService.getReportPermissionModes().subscribe((response:any) => {
      this.reportModes = response.data;
    });
  }

  getReceiptPermissionModes(){
    this.feeService.getReceiptPermissionModes().subscribe((response:any) => {
      this.receiptModes = response.data;
    });
  }

  getAcademicYearId() {
    this.feeCollectionCenterService.getAcademicYear( ).then((responseData) => {
    }).catch((error) => {
    });
  }

  initForm () {
    this.collectionDetailsForm = this.formBuilder.group({
      users: this.formBuilder.array([]),
    })
  }

  get fUsersArr() {
    return this.collectionDetailsForm.get("users") as FormArray;
  }

  fpermission(inx: number): FormArray {
    return (this.collectionDetailsForm.get("users") as FormArray)
      .at(inx)
      .get('user_permissions') as FormArray;
  }

  createUserFormGroup(val?) {
    return this.formBuilder.group({
      user_id: [val ? val.user_id : ''], 
      user_permissions:  this.formBuilder.array([this.loadPermission(val)]),
      user_name: [val ? val.user_name : ''],
    });
  }

  loadPermission(val?): FormGroup {
    return this.formBuilder.group({
      payment_mode: [val ? val?.user_permissions[0].payment_mode : []],
      fee_report_mode: [val ? val?.user_permissions[0].fee_report_mode : []],
      receipt_mode: [val ? val?.user_permissions[0].receipt_mode : []],
      zero_fee_receipt_mode: [val ? val?.user_permissions[0].zero_fee_receipt_mode : []],
      back_date: val ? val?.user_permissions[0].back_date : false,
      back_date_payment_mode : [val ? val?.user_permissions[0].back_date_payment_mode : []],
    });
  }

  getCollectionCenterById(collectionId) {
    this.feeCollectionCenterService.getCollectionCenterById(collectionId).then((responseData: any) => {
      if(responseData.status) {
        this.collectionsUsers = responseData.data.fees_collection_user || []
        this.collectionsUsers.forEach((row:any) => {
            const data = {
              user_id: row.user_id,
              user_permissions: [
                { 
                  payment_mode: [...new Set(row.fees_collection_user_permission.filter(v => v.permission_type == "payment_mode").map(vm => vm.permission))],
                  fee_report_mode: [...new Set(row.fees_collection_user_permission.filter(v => v.permission_type == "fee_report_mode").map(vm => vm.permission))],
                  receipt_mode: [...new Set(row.fees_collection_user_permission.filter(v => v.permission_type == "receipt_mode").map(vm => vm.permission))],
                  zero_fee_receipt_mode: [...new Set(row.fees_collection_user_permission.filter(v => v.permission_type == "zero_fee_receipt_mode").map(vm => vm.permission))],
                  back_date: [...new Set(row.fees_collection_user_permission.filter(v => v.permission_type == "back_date").map(vm => vm.permission))],
                  back_date_payment_mode: [...new Set(row.fees_collection_user_permission.filter(v => v.permission_type == "back_date_payment_mode").map(vm => vm.permission))],
                }
              ],
              user_name: row.user.full_name
            } 
            this.fUsersArr.push(this.createUserFormGroup(data));
        })
      }
    }).catch((error) => {
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  onSubmit() {
    this.submitLoading = true;
    this.formSubmitted = true
    if(this.collectionDetailsForm.invalid) {
      return
    }
    const requestPayload = {
      fees_collection_id: this.collectionId,
      ...this.collectionDetailsForm.value
    }
    
    this.feeCollectionCenterService.addPermissions(requestPayload).then((responseData: any) => {
      if(responseData.status) {
        this.toaster.showSuccess(responseData.message);
        this.router.navigate([this.setUrl(`${URLConstants.FEES_CENTER}`)]);
      }
      this.submitLoading = false;
    }).catch((error) => {
      this.toaster.showSuccess(error?.message || 'Something went wrong');
      this.submitLoading = false;
    });
  }

  onBackDateChange(index){
    const userPermissions = this.fpermission(index); // Get the user_permissions FormArray
    const permissionGroup = userPermissions.at(0) as FormGroup; // Assuming only one permission group per user

    if (permissionGroup) {
      const backDateControl = permissionGroup.get('back_date');
      if (backDateControl?.value === false) {
        permissionGroup.get('back_date_payment_mode')?.setValue([]);
      }
    }
  }
}
