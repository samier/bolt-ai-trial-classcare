import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';
import { incomeSource } from 'src/app/common-config/static-value';
import { IncomeExpenseService } from '../income-expense.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeadModalComponent } from '../head-modal/head-modal.component';

@Component({
    selector: 'app-income-form',
    templateUrl: './income-form.component.html',
    styleUrls: ['./income-form.component.scss']
})
export class IncomeFormComponent {
    //#region Public | Private Variables
    incomeForm: FormGroup = new FormGroup({});
    URLConstants = URLConstants;
    record_id: any;
    edit_view: any = false;
    is_saving: any = false;
    is_drafting: any = false;

    file: any = null;
    file_name: any = null;

    incomeSourceList: any = incomeSource
    userList: any = [];
    headList: any = [];
    paymentModes: any = [];
    taxList: any = [];
    source_name: any = '';
    status: any = null
    academicYear: any = null


    //#endregion Public | Private Variables

    // --------------------------------------------------------------------------------------------------------------
    // #region constructor
    // --------------------------------------------------------------------------------------------------------------
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _fb: FormBuilder,
        private toastr: Toastr,
        public CommonService: CommonService,
        private incomeExpenseService: IncomeExpenseService,
        private modalService: NgbModal,
        
    ) {
        this.record_id = this.route.snapshot.paramMap.get('income_id');
    }


    //#endregion constructor

    // --------------------------------------------------------------------------------------------------------------
    // #region Lifecycle hooks
    // --------------------------------------------------------------------------------------------------------------
    ngOnInit() {
        this.initForm();
        this.getAcademicYear()
        this.getHadList();
        this.getPaymentModes();
        this.getTaxList();
        if (this.record_id) {
            this.edit_view = true;
            this.incomeExpenseService.getIncome(this.record_id).subscribe((res: any) => {
                let data = res.data;
                this.status = data.status;
                if (data.income_source == 'user') {
                    this.getUserList();
                    this.source_name = data.user.full_name;
                }
                if (data.income_source == 'student') {
                    this.source_name = data.student.full_name;
                }
                data.attachment = null
                this.incomeForm.controls['record_id'].setValue(res.data.id);
                this.incomeForm.patchValue(data);
                setTimeout(() => {
                    this.calculateAmount()
                }, 500);

            })
        }

    }

    //#endregion Lifecycle hooks

    // --------------------------------------------------------------------------------------------------------------
    // #region Public methods
    // --------------------------------------------------------------------------------------------------------------

    getAcademicYear() {
        this.incomeExpenseService.getAcademicYear().subscribe((resp: any) => {
            if (resp.status) {
                this.academicYear = resp.data
            }
        })
    }

    getStudent(event: any) {
        if (event) {
            this.incomeForm.controls['income_source_id'].setValue(event.id);
        }
        // this.selectedSection = event;
    }

    getUserList() {
        this.incomeExpenseService.getUserList().subscribe((res: any) => {
            this.userList = res.data.map((item: any) => {
                return { id: item.id, name: item.full_name };
            });
        }, (err: any) => {
            this.toastr.showError(err.error.message);
        });
    }

    getHadList() {
        this.incomeExpenseService.getHeadList('income').subscribe((res: any) => {
            this.headList = res.data;
        }, (err: any) => {
            this.toastr.showError(err.error.message);
        });
    }

    getTaxList() {
        this.incomeExpenseService.getTaxList().subscribe((res: any) => {
            this.taxList = res.data.map((item: any) => {
                return { id: item.id, percentage: item.percentage, name: item.name + ' - ' + item.percentage + '%' };
            });
        }, (err: any) => {
            this.toastr.showError(err.error.message);
        });
    }

    getPaymentModes() {
        this.incomeExpenseService.getPaymentModes().subscribe((resp: any) => {
            this.paymentModes = resp.data;
        }, (err: any) => {
            this.toastr.showError(err.error.message);
        });
    }

    getPaymentType() {
        const paymentValidationMap: { [key: string]: string[] } = {
            'Cheque': ['cheque_no', 'cheque_date', 'bank_name'],
            'POS': ['rrn_no', 'bank_name'],
            'NEFT': ['account_no', 'account_holder_name', 'ifsc_code'],
            'UPI': ['upi_id'],
            'Others': ['transaction_no', 'bank_name']
        };

        const type = this.paymentModes.find((item: any) => item.id == this.incomeForm.value.payment_mode_id);

        if (type) {
            // Get the required fields for the selected payment mode
            const requiredFields = paymentValidationMap[type.name] || [];

            // Iterate over all possible fields and apply validators accordingly
            Object.keys(paymentValidationMap).flatMap(key => paymentValidationMap[key]).forEach(field => {
                if (!this.incomeForm.controls[field]) {
                    // Ensure the control exists in the form
                    this.incomeForm.addControl(field, new FormControl(null));
                }
                if (requiredFields.includes(field)) {
                    // this.incomeForm.controls[field].setValidators([Validators.required]);
                } else {
                    this.incomeForm.controls[field].setValue(null);
                    // this.incomeForm.controls[field].clearValidators();
                }
                // this.incomeForm.controls[field].updateValueAndValidity();
            });

            return type.name;
        }
    }

    handleSourceChange() {
        this.incomeForm.value.income_source == 'employee' ? this.getUserList() : this.userList = [];
    }

    calculateAmount() {
        let amount = parseInt(this.incomeForm.value.amount);
        let tax = this.incomeForm.value.tax_id;
        let tax_percent = this.taxList.find((item: any) => item.id == tax)?.percentage;
        tax_percent = parseInt(tax_percent);

        let taxable = (amount * tax_percent) / 100;
        this.incomeForm.controls['taxable_amount'].setValue(taxable);
        this.incomeForm.controls['total_amount'].setValue(taxable ? (amount + taxable) : amount);

    }

    draft() {
        this.is_drafting = true;
        this.incomeForm.controls['status'].setValue('draft');
        this.onSubmit();
    }

    save() {
        this.is_saving = true;
        this.incomeForm.controls['status'].setValue('publish');
        this.onSubmit();
    }

    onSubmit() {
        this.incomeForm.value.attachment = { base64: this.file, file_name: this.file_name };
        const payload = this.incomeForm.value;
        this.saveIncome(payload);
        return 0;
    }

    saveIncome(payload: any) {
        let record_id = this.incomeForm.controls['record_id'].value;
        this.incomeExpenseService.saveIncome(payload, record_id).subscribe((res: any) => {
            if (res.status == false) {
                this.toastr.showError(res.message);
            } else {
                this.toastr.showSuccess(res.message);
                this.router.navigate([this.CommonService.setUrl(URLConstants.INCOME_LIST)]);
            }
            this.is_saving = false;
            this.is_drafting = false;
        }, (err: any) => {
            this.toastr.showError(err.error.message);
            this.is_saving = false;
            this.is_drafting = false;
        });
    }

    onFileChange(event: any) {
        this.file = event.target.files[0];
        this.file_name = this.file.name;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const image64 = e.target?.result as string; // Base64 string
            this.file = image64;
        };

        reader.readAsDataURL(this.file);
    }

    async openModal(){
        const modalRef = this.modalService.open(HeadModalComponent, {
              // centered: true,
              backdrop: 'static',
              size: 'lg',
              windowClass: 'duplicate-modal-section',
              backdropClass: 'duplicate-modal-backdrop'
            });
        
            // Pass data to the modal component
            modalRef.componentInstance.moduleName = 'income';
        
            await modalRef.result.then((response: any) => {
              if (response.data) {
                this.getHadList();
              }
            })
    }

    //#endregion Public methods

    // --------------------------------------------------------------------------------------------------------------
    // #region Private methods
    // --------------------------------------------------------------------------------------------------------------

    initForm() {
        this.incomeForm = this._fb.group({
            income_source: [null],
            income_source_id: [null],
            head_id: [null, [Validators.required]],
            receipt_no: ['', [Validators.required]],
            narration: [''],
            amount: ['', [Validators.required, ClassCareValidatores.number(2, false)]],
            tax_id: [null],
            taxable_amount: [''],
            total_amount: ['',],
            payment_mode_id: [null, [Validators.required]],
            cheque_no: [''],
            cheque_date: [''],
            bank_name: [''],
            rrn_no: [''],
            account_no: [''],
            account_holder_name: [''],
            ifsc_code: [''],
            upi_id: [''],
            transaction_no: [''],
            income_date: ['', [Validators.required]],
            attachment: [''],
            remark: [''],
            status: ['publish'],
            record_id: [''],
        });
    }
}
