import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { BatchService } from 'src/app/modules/batch/batch.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FeesService } from '../../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ReactiveDropdownCrudComponent } from 'src/app/shared/common-input-component/reactive-dropdown-crud/reactive-dropdown-crud.component';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentSearchComponent } from 'src/app/modules/common-components/student-search/student-search.component';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { chequeStatusList } from 'src/app/common-config/static-value';
import { SystemSettingService } from 'src/app/modules/system-setting/system-setting.service';

@Component({
  selector: 'app-collect-cheque',
  templateUrl: './collect-cheque.component.html',
  styleUrls: ['./collect-cheque.component.scss']
})
export class CollectChequeComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  collectChequeForm : FormGroup = new FormGroup({});
  @ViewChildren('reactiveCrudArray') reactiveDropDownCrudsArray!: QueryList<ReactiveDropdownCrudComponent>;
  @ViewChild('studentSearch') studentSearch!: StudentSearchComponent;
  URLConstants = URLConstants;
  sectionList: any[] = [];
  bankList: any[] = [];
  user_id = localStorage.getItem('user_id');
  hasChequeDetails : any;
  chequeDetails: any;
  isSaveLoading: boolean = false;
  isPageLoading: boolean = false;
  isView: any;
  chequeStatusList = chequeStatusList;
  totalFees: number = 0;
  remainingFees: number = 0;
  fees: any;
  bounceCharges: any;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private batchService: BatchService,
    private feeService: FeesService,
    private toastr: Toastr,
    private formValidationService: FormValidationService,
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private systemSettingService: SystemSettingService
  ) {
    this.hasChequeDetails = this.activatedRouteService?.snapshot?.params['collection_id'];
    this.activatedRouteService.queryParamMap.subscribe((ele) => {
      this.isView = ele.get('isDefaultTemplate') || null;
    })
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getBounceCharges();
    this.initForm();
    this.getSectionList();
    this.getBankList();
    if(this.hasChequeDetails){
      this.isPageLoading = true;
      this.feeService.getChequeDetailsById(this.hasChequeDetails).pipe(takeUntil(this.$destroy)).subscribe({
        next: (res:any) => {
          this.isPageLoading = false;
          if(res?.status){
            this.chequeDetails = res?.data;
            this.studentSearch.onSelect(this.chequeDetails?.student);
            this.initForm();
            this.chequeDetails?.cheque_details?.length > 0
              ? this.chequeDetails?.cheque_details?.forEach((cheque: any) => {
                  const chequeGroup = this.createChequeRow(cheque) as FormGroup;
                  chequeGroup?.addControl('isExisting', new FormControl(true));
                  chequeGroup['isReadonly'] = chequeGroup?.get('cheque_status')?.value == 'clear' || chequeGroup?.get('cheque_status')?.value == 'bounced';
                  this.chequeRow.push(chequeGroup);
                })
              : this.chequeRow.push(this.createChequeRow());
            if(this.isView){
              this.collectChequeForm.disable();
            }
          }
        },
        error: (err) => {
          this.isPageLoading = false;
          this.toastr.showError(err?.error?.message);
        }
      });
    }else{
      this.chequeRow.push(this.createChequeRow());
    }

    const studentControl = this.collectChequeForm?.get('student_id');
    studentControl?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((value: any) => {
      studentControl?.setErrors(!value ? { required: true } : null);
    });
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  get chequeRow(): FormArray {
    return this.collectChequeForm.get('cheque_details') as FormArray;
  }

  setStudentId(event: any){
    this.collectChequeForm.patchValue({ student_id: event?.id });
    if(event?.id) {
      this.getFeesDetails(event.id);
    }
  }
  
  createUpdateBank(event: any, i?: any) {
    if (!event?.id && !event?.name) {
      alert("Please add a valid bank name in the search.");
      return;
    }
    this.feeService.createBank(event).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res: any) => {
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
          this.getBankList();
          this.reactiveDropDownCrudsArray.toArray()[i].setSuccess(res?.data?.id);
        } else {
          this.toastr.showError(res?.message);
        }
      },
      error: (err) => {
        this.toastr.showError(err?.error?.message);
      }
    });
  }

  deleteBank(id: any, i?: any){
    let confirm = window.confirm('Are you sure you want to delete this bank name?')
    if(confirm){
      this.feeService.deleteBank(id).pipe(takeUntil(this.$destroy)).subscribe({
        next: (res:any) => {
          if(res.status){
            this.toastr.showSuccess(res?.message)
            this.getBankList();
            this.bankList = this.bankList.filter(bank => bank.id !== id);

            // Patch null if the deleted ID is currently selected anywhere
            this.collectChequeForm.get('bank_id')?.value == id &&
              this.collectChequeForm.get('bank_id')?.setValue(null);

            this.chequeRow.controls.forEach((group) => {
              const control = group.get('bank_id');
              if (control?.value === id) {
                control?.setValue(null);
              }
            });
          }else{
            this.toastr.showError(res?.message)
          }
        },
        error: (err) => {
          this.toastr.showError(err?.error?.message)
        }
      })
    }
  }

  saveCheques(){
    this.formValidationService.getFormTouchedAndValidation(this.collectChequeForm);
    this.collectChequeForm?.markAllAsTouched();
    if (this.collectChequeForm?.invalid) {
      return this.toastr.showError('Please fill all required fields.');
    }

    const totalChequeAmount = this.collectChequeForm?.value?.cheque_details
      ?.filter((cheque: any) => cheque.cheque_status !== 'clear' && cheque.cheque_status !== 'bounced' && cheque.cheque_status !== 'cancelled')
      .reduce((acc: any, curr: any) => acc + Number(curr.cheque_amount), 0);
    
    if(totalChequeAmount > this.remainingFees){
      return this.toastr.showError('Total cheque amount should not be greater than remaining fees of Rs. ' + this.remainingFees);
    }

    const payload = {
      ...this.hasChequeDetails && ({ id: this.hasChequeDetails }),
      ...this.collectChequeForm?.value,
    }
    this.isSaveLoading = true;
    this.feeService.saveChequeDetails(payload).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res: any) => {
        this.isSaveLoading = false;
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
          this.router.navigate([this.CommonService.setUrl(URLConstants.CHEQUE_LIST)]);
        } else {
          this.toastr.showError(res?.message);
        }
      },
      error: (err: any) => {
        this.isSaveLoading = false;

        // Laravel-style errors
        if (err?.error?.errors) {
          const errors = err.error.errors;
          Object.keys(errors).forEach(key => {
            // Example key: cheque_details.0.cheque_no
            const match = key.match(/^cheque_details\.(\d+)\.(\w+)$/);
            if (match) {
              const index = +match[1];
              const field = match[2];
              const control = (this.chequeRow.at(index) as FormGroup)?.get(field);
              if (control) {
                // Set the backend error as a validation error
                control.setErrors({ customMessage: errors[key][0] });
                control.markAsTouched();
              }
            }
          });
        } else {
          this.toastr.showError(err?.error?.errors ?? err?.error?.message);
        }
      }
    });
  }

  addChequeRow() {
    const newCheque = this.createChequeRow() as FormGroup;
    newCheque?.addControl('isExisting', new FormControl(false));
    this.chequeRow.push(newCheque);

    this.validateChequeNumbers();

    setTimeout(() => {
      const newCardIndex = this.chequeRow.length - 1;
      const newCardElement = document.getElementById('chequeRow' + newCardIndex);
      
      if (newCardElement) {
        newCardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  validateChequeNumbers() {
    this.chequeRow.controls.forEach((group, index) => {
      const chequeNoControl = group.get('cheque_no');
      if (chequeNoControl) {
        chequeNoControl.updateValueAndValidity();
      }
    });
  }

  removeChequeRow(index: number) {
    let lastCard = index > 0 ? document.getElementById('chequeRow' + (index - 1)) : null;

    if (this.chequeRow.length === 2) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (lastCard) {
      lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    setTimeout(() => {
      this.chequeRow.removeAt(index);
      this.validateChequeNumbers();
    }, 300);
  }

  getFeesDetails(studentId: any) {
    const params = {
      student_id: studentId
    };
    this.feeService.getFeesDetails(params).pipe(takeUntil(this.$destroy)).subscribe({
      next: (response: any) => {
        if(response.status) {
          this.fees = response.data;
          this.totalFees = this.fees?.total_fees?.total_fees || 0;
          this.remainingFees = this.fees?.total_fees?.remaining_fees || 0;
        }
      },
      error: (err) => {
        this.toastr.showError(err?.error?.message);
      }
    });
  }


  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.collectChequeForm = this._fb.group({
      section_id: [this.chequeDetails?.section_id ?? ''],
      student_id: [this.chequeDetails?.student_id ?? null, [Validators.required]],
      cheque_details: this._fb.array([]),
    })
  }

  createChequeRow(chequeData?: any) {
    const formGroup = this._fb.group({
      id: [chequeData?.id ?? null],
      bank_name_id: [chequeData?.bank_name_id ?? null, [Validators.required]],
      cheque_no: [chequeData?.cheque_no ?? null, [
        Validators.required, 
        ClassCareValidatores.pattern('^\\d{6}$', 'Enter valid cheque number'),
        this.uniqueChequeNumberValidator('This cheque number is already exists')
      ]],
      cheque_date: [chequeData?.cheque_date ?? null, [Validators.required]],
      cheque_amount: [chequeData?.cheque_amount ?? null, [Validators.required, ClassCareValidatores.pattern('^[0-9]*\\.?[0-9]+$', 'Enter valid amount')]],
      cheque_status: [chequeData?.cheque_status ?? 'received'],
      cheque_remark: [chequeData?.cheque_remark ?? null],
      cheque_reason: [chequeData?.cheque_reason ?? null],
      bounce_charges: [chequeData?.bounce_charges ? chequeData?.bounce_charges : this.bounceCharges],
    });

    // Add filtered status list property
    formGroup['filteredStatusList'] = this.getFilteredChequeStatusList(formGroup);

    return formGroup;
  }

  uniqueChequeNumberValidator(errorMessage: string) {
    return (control: FormControl) => {
      if (!control.value) {
        return null;
      }

      const currentIndex = this.chequeRow.controls.findIndex(group => 
        group.get('cheque_no') === control
      );

      const isDuplicate = this.chequeRow.controls.some((group, index) => {
        if (index === currentIndex) return false;
        return group.get('cheque_no')?.value === control.value;
      });

      return isDuplicate ? { customMessage: errorMessage } : null;
    };
  }

  getFilteredChequeStatusList(cheque: FormGroup) {
    if (cheque?.get('cheque_status')?.value == 'clear') {
      return this.chequeStatusList;
    }
    return this.chequeStatusList.filter(status => status.id !== 'clear');
  }

  getSectionList(){
    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res?.data)
      }
    })
  }

  getBankList(){
    this.feeService.getPermissionsList({permission:true}).pipe(takeUntil(this.$destroy)).subscribe((res:any) => {
      this.bankList = res?.data?.bank_names;
    });
  }

  getBounceCharges(){
    this.systemSettingService.getMenuFieldData({type: 2}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.bounceCharges = res?.data?.find((item: any) => item?.key == 'bounce_return_cheque' && item?.value == 1)?.child_number?.find((item: any) => item?.key == 'bounce_return_cheque_amount')?.value;
      }
    })
  }
  //#endregion Private methods
}