import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IncomeExpenseService } from '../income-expense.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss']
})
export class TaxListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addTaxForm: FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any [] = [];
  tableLoading: boolean = false;
  isSaveLoading: boolean = false;
  URLConstants = URLConstants;
  taxData: any;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private incomeExpenseService: IncomeExpenseService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private _fb : FormBuilder,
    private formValidationService: FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initDataTable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  openModal(modalName: any, taxData?: any){
    taxData ? this.taxData = taxData : this.taxData = null;
    this.initForm();
    this.modalService.open(modalName, {
      centered: true,
      size: 'lg',
      windowClass: 'duplicate-modal-section add-tex',
      backdropClass: 'duplicate-modal-backdrop'
    })
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  saveTax(){
    if(this.addTaxForm.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.addTaxForm);
      return this.toastr.showError("Please Fill all required fields.");
    }
    const payload = {
      ...this.addTaxForm.value
    }
    this.isSaveLoading = true;
    this.incomeExpenseService.createOrUpdateTax(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.closeModal();
        this.reloadData()
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
    });
  }

  deleteTax(id: any){
    const conf = confirm("Are you sure you want to delete this tax?");
    if(conf){
      this.incomeExpenseService.deleteTax(id).subscribe((res: any) => {
        if(res?.status){
          this.toastr.showSuccess(res?.message);
          this.closeModal();
          this.reloadData()
        }else{
          this.toastr.showError(res?.message);
        }
      },
      (error: any) => {
        this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
      });
    }else{
      return;
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm(){
    this.addTaxForm = this._fb.group({
      id: [this.taxData?.id ?? null],
      name: [this.taxData?.name ?? null, [Validators.required]],
      percentage: [this.taxData?.percentage ?? null, [Validators.required, ClassCareValidatores.min(0 , "Value must be greater than or equal to 0"), ClassCareValidatores.max(100, "Value must be less than or equal to 100")]],
    })
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100 ,200],
      serverSide: true,
      searching: true,
  
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
  
      columns: [
        { data: 'name', name: 'name' },
        { data: 'percentage', name: 'percentage' },
        { data: 'action', orderable: false, searchable: false}
      ]
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    this.tableLoading = true;

    this.incomeExpenseService.taxIndex(dataTablesParameter).subscribe((res: any) => {
      this.tableLoading = false;
      this.tbody = res?.data;
      callback({
        recordsTotal: res?.recordsTotal,
        recordsFiltered: res?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    },
    (error: any) => {
      this.tableLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.error ?? error?.error?.message);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Private methods
}