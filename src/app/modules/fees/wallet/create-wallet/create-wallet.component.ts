import { Component, ElementRef, OnInit, Output, Input, ViewChild, EventEmitter } from '@angular/core';
import { WalletService } from '../wallet.service';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FeesService } from 'src/app/modules/fees/fees.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss']
})
export class CreateWalletComponent implements OnInit {
  @ViewChild('createWalletMdl') createWalletMdl: ElementRef | undefined;
  @Output() reloadWallets = new EventEmitter<any>();
  @Input() wallet: any;
  payment_modes: any;
  payment_mode_id: any = 1;
  in_transaction: boolean = false;
  saving: any = 0;
  student:any
  URL_id:any
  errors:any
  constructor(
    private WalletService: WalletService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private feesService: FeesService,
    private commonService: CommonService,
  ) { }
  
  params = {
    student_unique_id: null,
    amount: null,
    type: null,
    payment_mode_id: null,
    note: null,
    date: moment().format('YYYY-MM-DD')
  };
  validationError: any = [];

  types: any = [
    {
      "id": 'cr',
      "name": "Credit"
    },
    {
      "id": 'dr',
      "name": "Debit",
    }
  ];
  walletForm: FormGroup | any;
  formSubmitted: boolean = false;

  ngOnInit(): void {
    this.URL_id = this.route.snapshot.paramMap.get('id');
    if(this.URL_id){
      this.in_transaction = true;
    }
    this.getPaymentModes();
    this.initForm()
  }

  getPaymentModes(){
    this.feesService.getPaymentModes({permission:true}).subscribe((response:any)=>{
      this.payment_modes = response.data;
    })
  }
  initForm () {
    this.walletForm = this.formBuilder.group({
      student_unique_id: new FormControl(this.URL_id ? this.URL_id : '', [Validators.required]),
      amount: new FormControl('', [Validators.required,  Validators.pattern("^[0-9]*$"),]),
      type : new FormControl('', [Validators.required]),
      note: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      payment_mode_id : new FormControl('', [Validators.required]),
      is_father_message : new FormControl(false),
      is_mother_message : new FormControl(false),
      is_student_message : new FormControl(false),
    })
  }

  get f() {
    return this.walletForm.controls;
  }

  getStudent(student:any = null){
    this.student = student;
    if(this.student?.unique_id) {
      this.walletForm.get('student_unique_id').setValue(this.student?.unique_id);
      this.walletForm.get('student_unique_id').clearValidators();
    }
  }

  paymentModeValidate(delay = 0){
    if(this.formSubmitted){
      setTimeout(()=>{
        const form = document.getElementById('wallet-form') as HTMLFormElement;
        const formData:any = new FormData(form);
        this.errors = this.commonService.paymentModeValidator(formData,this.payment_mode_id);
      },delay);
    }
  }

  submit(print = false) {
    this.formSubmitted = true
    const form = document.getElementById('wallet-form') as HTMLFormElement;
    const formData:any = new FormData(form);
    this.errors = this.commonService.paymentModeValidator(formData,this.payment_mode_id);
    if(this.walletForm.invalid) {
      return
    }
    if(Object.keys(this.errors)?.length > 0){
      return;
    }
    if(this.walletForm.value?.student_unique_id){
      formData.append('student_unique_id',this.walletForm.value?.student_unique_id);
      if(this.walletForm?.value?.type){
        formData.append('type',this.walletForm?.value?.type);
      }
      formData.append('date',this.walletForm.value.date);
      formData.append('payment_mode_id',this.payment_mode_id);
      formData.append('is_father_message',this.walletForm.value.is_father_message);
      formData.append('is_mother_message',this.walletForm.value.is_mother_message);
      formData.append('is_student_message',this.walletForm.value.is_student_message);
      this.saving = print ? 2 : 1;
      this.WalletService.saveWallet(formData).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.toastr.showSuccess(resp.message);
            this.clearForm();
            this.modalService.dismissAll();
            if(print){
              this.reloadWallets.emit(resp.data.history);
            }else{
              this.reloadWallets.emit({});
            }
          } else {
            this.validationError = resp.error
            this.toastr.showError(resp.message)
          }
        this.saving = 0;
        }
      ,(error:any)=>{
        this.saving = 0;
        this.toastr.showError(error.error.message);
      });
    }
  }

  close() {
    this.modalService.dismissAll()
    this.clearForm()
  }

  clearForm() {
    this.params = {
      student_unique_id: null,
      amount: null,
      type: null,
      payment_mode_id: null,
      note: null,
      date: moment().format('YYYY-MM-DD')
    };
  }
}
