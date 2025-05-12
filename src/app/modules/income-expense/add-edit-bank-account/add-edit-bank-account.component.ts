import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { IncomeExpenseService } from '../income-expense.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { accountType } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-add-edit-bank-account',
  templateUrl: './add-edit-bank-account.component.html',
  styleUrls: ['./add-edit-bank-account.component.scss']
})
export class AddEditBankAccountComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addBankAccountF : FormGroup = new FormGroup({});
  hasBankAccountId: any;
  isSaveLoading: boolean = false;
  branchList: any[] = [];
  trustList: any[] = [];
  accountTypeList: any[] = accountType;
  URLConstants = URLConstants;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private incomeExpenseService: IncomeExpenseService,
    private _fb : FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    private formValidationService: FormValidationService
  ) {
    this.hasBankAccountId = this.activatedRoute?.snapshot?.params['id'] ?? null;
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getBranchList();
    // this.getTrustList();
    if(this.hasBankAccountId){
      this.getBankAccountDetails();
    }
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  handleAccountChange(type:any){
    if(type == 'trust'){
      this.addBankAccountF.controls['trust_id'].setValidators([Validators.required]);
      this.addBankAccountF.controls['branch_id'].clearValidators();
      this.addBankAccountF.controls['branch_id'].setValue(null)
      if(this.trustList.length == 0){
        this.getTrustList();
      }
    }

    if(type == 'school'){
      this.addBankAccountF.controls['branch_id'].setValidators([Validators.required]);
      this.addBankAccountF.controls['trust_id'].clearValidators();
      this.addBankAccountF.controls['trust_id'].setValue(null)
      if(this.branchList.length == 0){
        this.getBranchList();
      }
    }
    this.addBankAccountF.controls['branch_id'].updateValueAndValidity();
    this.addBankAccountF.controls['trust_id'].updateValueAndValidity();
  }
  
  createUpdateAccount(){
    if(this.addBankAccountF.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.addBankAccountF);
      return this.toastr.showError("Please fill all required fields");
    }
    const payload = {
      ...this.addBankAccountF.value,
    }
    this.isSaveLoading = true;
    this.incomeExpenseService.createOrUpdateAccount(payload, this.hasBankAccountId).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.BANK_ACCOUNT_LIST)]);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
    });
  }
  

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addBankAccountF = this._fb.group({
      name: [null, [Validators.required]],
      account_holder_name: [null, [Validators.required]],
      account_for: ['school', [Validators.required]],
      trust_id: [null],
      branch_id: [null, [Validators.required]],
      account_number: [null, [Validators.required]],
      ifsc_code: [null, [Validators.required]],
      branch_address: [null],
      account_type: [null, [Validators.required]]
    })
  }

  getBranchList(){
    this.incomeExpenseService.getBranchList().subscribe((res: any) => {
      if(res?.status){
        this.branchList = res?.data.map((el:any) => {
          return {id: el.id, name:el.branchName}
        });
      }
    })
  }

  getTrustList(){
    this.incomeExpenseService.getTrustList().subscribe((res: any) => {
      if(res?.status){
        this.trustList = res?.data.trusts;
      }
    })
  }

  getBankAccountDetails(){
    this.incomeExpenseService.getBankAccountDetails(this.hasBankAccountId).subscribe((res: any) => {
      if(res?.status){
        this.handleAccountChange(res.data.account_for)
        this.addBankAccountF.patchValue({...res.data});
      }
    })
  }
	
  //#endregion Private methods
}