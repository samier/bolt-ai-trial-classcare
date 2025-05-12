import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { StudentService } from '../student.service';
import {Toastr} from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bank-detail-tab',
  templateUrl: './bank-detail-tab.component.html',
  styleUrls: ['./bank-detail-tab.component.scss']
})
export class BankDetailTabComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  homeworkForm : FormGroup = new FormGroup({})
  bankDetailForm:FormGroup = new FormGroup({})

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  uniqueId! : any
  studentProfile! : any

  is_loading : boolean = false

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private validationService: FormValidationService,
    private studentService : StudentService,
    private toaster : Toastr , 
    private _activatedRoute:ActivatedRoute,
  ){

  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this._activatedRoute.params.subscribe(params => {
      this.uniqueId = params['id'] || params['unique_id'];
    });
    this.fetchAndPatch()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  fetchAndPatch() {
    this.studentService.fetchBankDetail(this.uniqueId).subscribe((res: any) => {
      if (res?.status) {
        this.bankDetailForm.controls['bank_name'].patchValue(res?.data?.bankname)
        this.bankDetailForm.controls['account_number'].patchValue(res?.data?.accountnumber)
        this.bankDetailForm.controls['ifsc_code'].patchValue(res?.data?.ifsccode)
        this.bankDetailForm.controls['branch_ifsc_code'].patchValue(res?.data?.branchifsc)
        this.bankDetailForm.controls['adhar_number'].patchValue(res?.data?.adhaar_number)
        this.bankDetailForm.controls['other_number'].patchValue(res?.data?.othernumber)
      } else {
        this.toaster.showError(res?.message)
      }
    }, (error) => {
      this.toaster.showError(error?.error?.message ?? error?.message)
    })

  }

  handleSaveBtn(){

    if(this.bankDetailForm.invalid){
      this.validationService.getFormTouchedAndValidation(this.bankDetailForm)
      return
    }

    this.is_loading = true

    const payload = {
      branch_id : this.branch_id ,
      bank_name : this.bankDetailForm.controls['bank_name'].value ,
      account_number : this.bankDetailForm.controls['account_number'].value ,
      ifsc_code : this.bankDetailForm.controls['ifsc_code'].value ,
      branch_ifsc_code : this.bankDetailForm.controls['branch_ifsc_code'].value ,
      adhar_number : this.bankDetailForm.controls['adhar_number'].value ,
      other_number : this.bankDetailForm.controls['other_number'].value ,
    }

    this.studentService.saveBankDetail(payload,this.uniqueId).subscribe((res:any)=>{
      if(res.status) {
        this.toaster.showSuccess(res.message)
        this.bankDetailForm.reset()
        this.is_loading = false
        this.fetchAndPatch()
      } else {
        this.is_loading = false
        this.toaster.showError(res.message)
      }
    }, (error)=> {
      this.is_loading = false
      this.toaster.showError(error?.error?.message ?? error?.message)
    })

  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

    initForm() {
      this.bankDetailForm = this._fb.group({

        bank_name: ['' , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter Valid Name" ) ] ] ,
        account_number: ['' , [ ClassCareValidatores.pattern(/^\d+$/,"Please enter Valid Number")] ] ,
        ifsc_code: [''] ,
        branch_ifsc_code: [''] ,
        adhar_number: ['' ,[ ClassCareValidatores.pattern(/^\d{12}$/,"Please enter valid  Aadhaar card Number") ,ClassCareValidatores.min(100000000000, "Please enter minimum 12 digits number") ,ClassCareValidatores.max(999999999999, "Please enter maximum 12 digits number") ]  ] ,
        other_number: [''] ,

      })
    }

  //#endregion Private methods
}
