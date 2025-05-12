import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TrustDetailManagementService } from '../trust-details-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-trust-details',
  templateUrl: './trust-create.component.html',
  styleUrls: ['./trust-create.component.scss'],
})
export class TrustCreateComponent implements OnInit {
  URLConstants = URLConstants;
  public trust_id: any;

  constructor(
    private TrustService: TrustDetailManagementService,
    private toastr: Toastr,
    private router: Router,
    private route: ActivatedRoute,
    public CommonService: CommonService
  ) {
    // this.trust_id = this.route.snapshot.paramMap.get('id');
  }

  formData: any = {
    name: null,
    contact_number: null,
    email: null,
    address: null,
    bank_name: null,
    account_number: null,
    account_holder_name: null,
    type_of_account: null,
    ifsc_code: null,
    branch_name: null,
  };

  submitted = false;
  validationError: any = [];

  account_types = [
    { id: 1, name: 'Savings Account' },
    { id: 2, name: 'Current Account' },
    { id: 3, name: 'Salary Account' },
    { id: 4, name: 'Recurring Deposit (RD) Accounts' },
    { id: 5, name: 'Fixed Deposit (FD) Accounts' },
    { id: 6, name: 'NRI Account' },
  ];
  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    this.trust_id = this.route.snapshot.paramMap.get('id');
    if (this.trust_id) {
      setTimeout(() => {
        this.getTrustDetails();
      }, 10);
    }
  }

  getTrustDetails() {
    this.TrustService.getTrustDetail(this.trust_id).subscribe((resp: any) => {
      if (resp.status) {
        for (const field in this.formData) {
          this.formData[field] = field == 'type_of_account' ? parseInt(resp.data[field]) : resp.data[field]
        }
      }
    });
  }

  submit() {
    this.submitted = true;
    if (this.checkFormData()) {
      this.TrustService.createTrustDetails(this.formData).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.submitted = false;
            this.toastr.showServerSuccess(resp.message);
            this.clear();
            this.router.navigate([this.setUrl(URLConstants.TRUST_LIST)]);  
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
      this.TrustService.updateTrustDetails(this.formData, this.trust_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.submitted = false;
            this.toastr.showServerSuccess(resp.message);
            this.clear();
            this.router.navigate([this.setUrl(URLConstants.TRUST_LIST)]);  
          } else {
            this.toastr.showError(resp.message);
            this.validationError = resp.data;
          }
        }
      );
    }
  }

  checkFormData() {
      if (this.formData.name == null && this.formData.contact_number == null) {
        return false;
      }
    return true;
  }

  clear() {
    this.formData.name = null;
    this.formData.contact_number = null;
    this.formData.email = null;
    this.formData.address = null;
    this.formData.bank_name = null;
    this.formData.account_number = null;
    this.formData.account_holder_name = null;
    this.formData.type_of_account = null;
    this.formData.ifsc_code = null;
    this.formData.branch_name = null;
  }

  cancel(){
    this.router.navigate([this.setUrl(URLConstants.TRUST_LIST)]); 
  }
}
