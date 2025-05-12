import { Component, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import {  FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Toastr } from 'src/app/core/services/toastr';
import { FeeCollectionCenterService } from '../fee-collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { P } from '@angular/cdk/keycodes';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-add-center',
  templateUrl: './add-center.component.html',
  styleUrls: ['./add-center.component.scss']
})
export class AddCenterComponent implements OnInit {
  URLConstants = URLConstants;
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
  addCenterForm: FormGroup | any;
  formSubmitted: boolean = false;
  branchId: any = window.localStorage.getItem('branch');
  userList: any = []
  centerId: any = null
  submitLoading = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private toaster:Toastr,
    private feeCollectionCenterService: FeeCollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    public commonService : CommonService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.centerId = params.get('id');
      if(this.centerId) {
        this.getCollectionCenterById(this.centerId)
      }
    });
    this.initForm()
    this.fetchUser()
  }

  setUrl(url:string) {
    return '/'+this.branchId+'/'+url;
  }

  initForm () {
    this.addCenterForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      users: new FormControl('', [Validators.required]),
    })
  }

  get f() {
    return this.addCenterForm.controls;
  }

  fetchUser() {
    this.feeCollectionCenterService.fetchUserList(this.branchId).then((responseData: any) => {
      if(responseData.status) {
        this.userList = responseData.data
      }
    })
  }

  getCollectionCenterById(collectionId) {
    this.feeCollectionCenterService.getCollectionCenterById(collectionId).then((responseData: any) => {
      console.log(">> [1]", responseData)
      if(responseData.status) {
        this.addCenterForm?.patchValue({ 
          name: responseData?.data?.name,
          users: responseData?.data?.fees_collection_user.map(vm => vm.user_id)
        });
      }
    }).catch((error) => {
    });
  }

  onSubmit() {
    this.submitLoading = true;
    this.formSubmitted = true
    if(this.addCenterForm.invalid) {
      return
    }

    if(this.centerId) {
      this.updateNewCollectionCenter()
    } else {
      this.addNewCollectionCenter()
    }
  }

  addNewCollectionCenter() {
    this.feeCollectionCenterService.addNewCollectionCenter(this.addCenterForm.value).then((responseData: any) => {
      if(responseData.status) {
        this.toaster.showSuccess(responseData.message);
        this.router.navigate([this.setUrl(`${URLConstants.FEES_CENTER}`)]);
      }
      this.submitLoading = false;
    }).catch((error) => {
      this.submitLoading = false;
    });
  }

  updateNewCollectionCenter() {
    this.feeCollectionCenterService.updateCollectionCenter(this.centerId, this.addCenterForm.value).then((responseData: any) => {
      if(responseData.status) {
        this.toaster.showSuccess(responseData.message);
        this.router.navigate([this.setUrl(`${URLConstants.FEES_CENTER}`)]);
      }
      this.submitLoading = false;
    }).catch((error) => {
      this.submitLoading = false;

    });
  }
}
