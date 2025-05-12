import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IncomeExpenseService } from '../income-expense.service';

@Component({
  selector: 'app-head-modal',
  templateUrl: './head-modal.component.html',
  styleUrls: ['./head-modal.component.scss']
})
export class HeadModalComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addHeadForm: FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any [] = [];
  ledgerList: any [] = [];
  filteredLedgerList: any [] = [];
  tableLoading: boolean = false;
  isSaveLoading: boolean = false;
  URLConstants = URLConstants;
  @Input() headData
  @Input() moduleName
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private incomeExpenseService: IncomeExpenseService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private _fb : FormBuilder,
    private formValidationService: FormValidationService,
    private modalRef: NgbActiveModal,
    
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getLedgerList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  closeModal(){
    this.modalRef.close({
      data: true
    })
  }

  saveHead(){
    if(this.addHeadForm.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.addHeadForm);
      return this.toastr.showError("Please Fill all required fields.");
    }
    const payload = {
      ...this.addHeadForm.value
    }
    this.isSaveLoading = true;
    this.incomeExpenseService.createOrUpdateHead(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.modalRef.close({
          data: true
        })
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
    });
  }

  selectionChange(event:any){
    if(event){
      this.addHeadForm.controls['ledger_id'].setValue(event.id)
    }
    
  }

  createAndUpdateData(event:any){
    let data = {
      id: event.id,
      name: event.name,
      ledger_type: this.addHeadForm.value.account_type
    }
    this.incomeExpenseService.createOrUpdateLedger(data).subscribe((resp:any)=>{
      if(resp.status){
        this.toastr.showSuccess(resp.message);
        this.getLedgerList();
        this.addHeadForm.controls['ledger_id'].setValue(resp.data.id)
      }else{
        this.toastr.showError(resp.message);
      }
    },(error:any) => {
      console.log(error);
    })
  }

  deleteData(event:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(!confirm) return;
    this.incomeExpenseService.deleteLedger(event).subscribe((resp:any)=>{
      if(resp.status){
        this.toastr.showSuccess(resp.message);
        this.getLedgerList();
      }else{
        this.toastr.showError(resp.message);
      }
    },(error:any) => {
      console.log(error);
      
    })
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm(){ 
    const account_type = this.headData 
      ? (this.headData?.ledger?.ledger_type ?? 'income')
      : (this.moduleName ? (this.moduleName === 'income' ? 'income' : 'expense') : 'income');
    this.addHeadForm = this._fb.group({
      id: [this.headData?.id ?? null],
      name: [this.headData?.name ?? null, [Validators.required]],
      account_type: [account_type],
      ledger_id: [this.headData?.ledger_id ?? null, [Validators.required]],
      opening_balance: [this.headData?.opening_balance ?? null],
    })
    
  }

  handleAccountTypeChange(state?:any){
    let account_type = this.addHeadForm.value.account_type
    this.filteredLedgerList = this.ledgerList.filter((el:any) => {
      return el.ledger_type == account_type
    })
    if(state == 'change'){
      this.addHeadForm.controls['ledger_id'].setValue(null)
    }
  }

  getLedgerList(){
    this.incomeExpenseService.ledgerList().subscribe((res: any) => {
      if(res?.status){
        this.ledgerList = res?.data;
        this.handleAccountTypeChange();
      }
    })
  }

  //#endregion Private methods
}
