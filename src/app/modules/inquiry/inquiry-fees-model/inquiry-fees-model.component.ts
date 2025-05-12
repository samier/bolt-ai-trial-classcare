import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { paymentModes } from 'src/app/common-config/static-value';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesService } from '../../fees/fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { InquiryService } from '../inquiryservice';

@Component({
  selector: 'app-inquiry-fees-model',
  templateUrl: './inquiry-fees-model.component.html',
  styleUrls: ['./inquiry-fees-model.component.scss']
})
export class InquiryFeesModelComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  inquiryFeesForm : FormGroup = new FormGroup({})
  @Input() inquiryData
  bankNames : any
  paymentModeList = paymentModes
  isLoader : boolean = false
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private modalRef: NgbActiveModal,
      private _feeSerivce : FeesService,
      private _toaster : Toastr,
      private _formValidationService : FormValidationService,
      private _inquiryService : InquiryService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getPermissionsList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  closeModel() {
    this.modalRef.dismiss();
  }

  createAndUpdateData(event) {
    if(!event?.id && !event?.name ){
      // this.toastr.showInfo("Enter the name ","Name not Found")
      alert("Please add Bank name in search")
      return
    }
    this._feeSerivce.createBank(event).subscribe((resp:any) => {
      if(resp.status){
        this._toaster.showSuccess(resp.message)
        this.bankNames.push(resp.data)
      }else{
        this._toaster.showError(resp.message)
      }
    })
  }

  getPermissionsList(id?:any){
    this._feeSerivce.getPermissionsList({permission:true}).subscribe((response:any) => {
      this.paymentModeList = response.data?.payment_modes;
      this.bankNames = response.data?.bank_names;
    });
  }

  selectionChange(event) {
    this.inquiryFeesForm.get('bank_name')?.patchValue(event?.name)
    this.inquiryFeesForm.get('bank_name_id')?.patchValue(event?.id)
  }

  deleteData(event) {
    let confirm = window.confirm('Are you sure you want to delete this bank name?')
    if(confirm){
      this._feeSerivce.deleteBank(event).subscribe((res:any)=>{
        if(res.status){
          this._toaster.showSuccess(res?.message)
          this.getPermissionsList()
        }else{
          this._toaster.showError(res?.message)
        }
     })
    }
  }

  async fileChange(event) {

    const file = event.target.files[0]

    if (
      !['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'text/plain'].includes(file.type) &&
      !file.name.toLowerCase().endsWith('.doc')
    ) {
      this._toaster.showError('Invalid file type. Allowed formats: JPG, JPEG, PNG, PDF, DOC, TEXT')
      this.inquiryFeesForm.controls['attechment'].patchValue('')
      return;
    }

    if (file) {
      const size = file.size / 1000000
      if (size >= 2) {
        this._toaster.showError('Total file size cannot exceed more than 2 MB.');
        this.inquiryFeesForm.controls['attechment'].patchValue('')
        return;
      }
    }


    const imagebase64 = await this.CommonService.convertToBase64(file);
    const data = {
      attachment_name    : file.name,
      imagebase64 : imagebase64,
    }
    this.inquiryFeesForm.controls['selected_attechment'].patchValue(data);
  }

  saveFees() {
    
    if(this.inquiryFeesForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.inquiryFeesForm);

      if(this.inquiryFeesForm.get('payment_mode')?.invalid) {
        this._toaster.showError('Please Choose Your Payment Mode.');
        return;
      } else if(this.inquiryFeesForm.get('bank_name')?.invalid) {
        this._toaster.showError('Please Select bank.')
        return;
      } else {
        return;
      }
    }

    let payload:any = {
      payment_mode : this.inquiryFeesForm.value.payment_mode,
      amount : this.inquiryFeesForm.value.amount,
      remark : this.inquiryFeesForm.value.remark,
      attachment : this.inquiryFeesForm.value.selected_attechment ?? [],
      category_fees : this.inquiryFeesForm.value.selected_category_fees
    }

    switch(this.inquiryFeesForm.value.payment_mode) {
      case 2:
        payload.cheque_no = this.inquiryFeesForm.value.cheque_no
        payload.bank_name_id = this.inquiryFeesForm.value.bank_name_id
        payload.cheque_status = this.inquiryFeesForm.value.cheque_status
        payload.cheque_date = this.inquiryFeesForm.value.cheque_date
        break;
      case 3:
        payload.card_type = this.inquiryFeesForm.value.card_type
        payload.bank_name_id = this.inquiryFeesForm.value.bank_name_id
        payload.bank_name = this.inquiryFeesForm.value.bank_name
        payload.rrn_no = this.inquiryFeesForm.value.rrn_no
        break;
      case 4:
        payload.account_no = this.inquiryFeesForm.value.account_no
        payload.account_holder_name = this.inquiryFeesForm.value.account_holder_name
        payload.ifsc_code = this.inquiryFeesForm.value.ifsc_code
        break;
      case 5:
        payload.upi_id = this.inquiryFeesForm.value.upi_id
        break;
      case 6:
        payload.transaction_or_ref_no = this.inquiryFeesForm.value.transaction_or_ref_no
        payload.payment_type = this.inquiryFeesForm.value.payment_type
        payload.bank_name_id = this.inquiryFeesForm.value.bank_name_id
        payload.bank_name = this.inquiryFeesForm.value.bank_name
        break;
      default:
    }

    if(this.inquiryData.type === 'list') {
      this.collectFeesSave(this.inquiryData.id,payload)
    } else {
      this.modalRef.close({
        status: true,
        data : payload
      });
    }

  }

  setValidationOnPaymentMode (event) {
    this.clearValidation();

    let requiredArray : any = []

    switch(event) {
      case 2:
        requiredArray = ['cheque_status','bank_name','cheque_no']
        break;
      case 3:
        requiredArray = ['card_type', 'rrn_no', 'bank_name']
        break;
      case 4:
        requiredArray = ['account_no','account_holder_name', 'ifsc_code']
        break;
      case 5:
        requiredArray = ['upi_id']
        break;
      case 6:
        requiredArray = ['transaction_or_ref_no', 'payment_type', 'bank_name']
        break;
      default:
    }

    requiredArray.forEach((ele)=>{
      this.inquiryFeesForm.get(ele)?.addValidators([Validators.required]);
      this.inquiryFeesForm.get(ele)?.updateValueAndValidity();
    })
  }

  changeCategory(event) {
    let selectedData: any = []
    if (event?.id) {
      selectedData = [event]
    } else {
      selectedData = event
    }
    const data = this.inquiryData.feesDetails.filter((ele) =>
      selectedData.map(ele => ele.id).includes(ele.id)
    )
    this.inquiryFeesForm.get('selected_category_fees')?.patchValue(data);
    let totalAmount = 0
    if (data.length > 0) {
      totalAmount = data?.map(ele => ele.amount).reduce((av: any, pv: any) => av + pv) ?? 0
    }
    this.inquiryFeesForm.get('amount')?.patchValue(totalAmount ?? 0)

  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.inquiryFeesForm = this._fb.group({
        student_name: [ this.inquiryData?.student_name ?? '' ],
        class: [ this.inquiryData?.class_name ?? null ],
        amount : [null, [Validators.required]],
        payment_mode : ['',[Validators.required]],
        remark : [''],
        attechment : [''],
        selected_attechment : [null],
        category_fees : ['',[Validators.required]],
        selected_category_fees : [''],

        // payment_mode 2
        cheque_no: ['', [Validators.minLength(6), Validators.maxLength(6)]],
        bank_name : [''],
        bank_name_id : [''],
        cheque_date : [''],
        cheque_status: ['clear'],

        // payment_mode 3
        rrn_no : [''],
        card_type: ['1'],

        // payment_mode 4
        account_no : [''],
        account_holder_name : [''],
        ifsc_code : [''],

        // payment_mode 5
        upi_id : [''],

        // payment_mode 6
        transaction_or_ref_no : [''],
        payment_type : ['']
      })

      this.inquiryFeesForm.controls['category_fees'].valueChanges.subscribe(value => {
        const data = this.inquiryData.feesDetails.filter((ele) =>
          value.map(ele => ele.id).includes(ele.id)
        )
        this.inquiryFeesForm.get('selected_category_fees')?.patchValue(data);
        let totalAmount = 0
        if (data.length > 0) {
          totalAmount = data?.map(ele => ele.amount).reduce((av: any, pv: any) => av + pv) ?? 0
        }
        this.inquiryFeesForm.get('amount')?.patchValue(totalAmount ?? 0)
      });
    }

    clearValidation() {
      const keyArray = ['cheque_no','bank_name','cheque_date','cheque_status','rrn_no','card_type','account_no','account_holder_name','ifsc_code','upi_id','transaction_or_ref_no']
      keyArray.forEach((ele)=>{
        this.inquiryFeesForm.get(ele)?.clearValidators();
        this.inquiryFeesForm.get(ele)?.updateValueAndValidity();
        if (ele == 'cheque_no') {
          this.inquiryFeesForm.get(ele)?.setValidators([Validators.minLength(6), Validators.maxLength(6)]);
          this.inquiryFeesForm.get(ele)?.updateValueAndValidity();
        }
      })
    }

    collectFeesSave(id,payload) {
      this.isLoader = true
      this._inquiryService.inquiryFeesCollect(id,payload).pipe(takeUntil(this.$destroy)).subscribe((res : any)=>{
        if(res.status){
          this.isLoader = false
          this._toaster.showSuccess(res.message)
          this.modalRef.close({
            status: true,
          });
        } else {
          this._toaster.showError(res.message)
        }
      },(error)=>{
        this.isLoader = false
        this._toaster.showError(error?.error?.message ?? error?.message)
      })
    }
	
  //#endregion Private methods
}