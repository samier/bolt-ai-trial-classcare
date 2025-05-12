import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../common-components/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';  
import moment from 'moment';
import { DropdownCrudComponent } from 'src/app/shared/common-input-component/dropdown-crud/dropdown-crud.component';
@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.component.html',
  styleUrls: ['./add-edit-expense.component.scss']
})
export class AddEditExpenseComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  @ViewChildren(DropdownCrudComponent) dropDownCrud! : QueryList<DropdownCrudComponent>
  addExpense: FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  categoriesList: any = [];
  vendorsList: any = [];
  paymentModeList: any = [];
  expenseId = null;
  expenseData: any;
  isSaveLoading: boolean = false;
  isSaveAddLoading: boolean = false;
  categoryRequired: boolean = false;
  categoryId: any;
  vendorId: any;
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    public commonService: CommonService,
    private _fb : FormBuilder,
    private expenseService: ExpenseService,
    public activatedRouteService: ActivatedRoute,
    private toaster:Toastr,
    private router: Router
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.getVendorsList();
    this.getCategoriesList();
    this.getPaymentModes();
    this.expenseId = this.activatedRouteService?.snapshot?.params['id'];
    if(this.expenseId){
      this.getExpenseById();
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

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  onSave(addAnother: boolean){
    const category = this.addExpense?.value?.expense_category;
    this.addExpense?.markAllAsTouched();
    if(this.addExpense?.invalid || !category){
      this.categoryRequired = !category ? true : false; 
      return;
    }
    const payload = {
      ...this.addExpense?.value,
      date: new Date(this.addExpense?.value?.date)
    };
    this.isSaveLoading = addAnother ? false : true;
    this.isSaveAddLoading = addAnother ? true : false;
    this.expenseService.saveExpenseData(this.expenseId,payload).subscribe(
      (res: any) => {
        this.isSaveLoading = false;
        this.isSaveAddLoading = false;
        if(res?.status){
          this.toaster.showSuccess(res?.message);
          if(addAnother){
            this.dropDownCrud.forEach(element => {
              element.clearSelection(null);
            });;
            this.addExpense?.reset();
            this.addExpense?.markAsUntouched();
          }else {
            this.router.navigate([this.setUrl(URLConstants.EXPENSE_LIST)]);
          }
        }else{
          this.toaster.showError(res?.message);
        }
      }, (error: any)=> {
        this.isSaveLoading = false;
        this.isSaveAddLoading = false;
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    );
  }
  
  selectionChange(event: any = '', controlName: any ='') {
    this.categoryRequired = false;
    this.addExpense.controls[controlName].patchValue(event?.id);
  }
  
  createAndUpdateCategory(event) {
    if(!event?.id && !event?.name ){
      alert("Please add category name in search")
      return
    }
    this.expenseService.createUpdateCategory( event?.id , event?.name ).subscribe((res:any)=>{
      if(res?.status){
        event?.id ?  this.toaster.showSuccess("Updated Successfully") : this.toaster.showSuccess("Created Successfully")
        this.getCategoriesList(event?.name);
      }
      else if(res?.status == false){
        alert(res?.message?.name)
      }else {
        this.toaster.showError(res.message)
      }
    }, (error: any)=> {
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  
  deleteCategory(event) {
    this.expenseService.deleteExpenseCategory( event ).subscribe((res:any)=>{
      if(res?.status){
        this.toaster.showSuccess(res?.message);
        this.getCategoriesList();
      }else {
        this.toaster.showError(res?.message)
      }
    }, (error: any)=> {
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  
  createAndUpdateVendor(event) {
    if(!event?.id && !event?.name ){
      alert("Please add vendor name in search")
      return
    }
    this.expenseService.createUpdateVendor( event?.id , event?.name ).subscribe((res:any)=>{
      if(res?.status){
        event?.id ?  this.toaster.showSuccess("Updated Successfully") : this.toaster.showSuccess("Created Successfully")
        this.getVendorsList(event?.name);
      }
      else if(res?.status == false){
        alert(res?.message?.name)
      }
      else {
        this.toaster.showError(res.message)
      }
    }, (error: any)=> {
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  
  deleteVendor(event) {
    this.expenseService.deleteExpenseVendor( event ).subscribe((res:any)=>{
      if(res?.status){
        this.toaster.showSuccess(res?.message);
        this.getVendorsList();
      }
    })
  }
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.addExpense = this._fb.group({
      date: ['', [Validators.required]],
      description: [ '', [Validators.required]],
      amount: ['', [Validators.required]],
      payment_mode: [null, [Validators.required]],
      expense_category: ['', [Validators.required]],
      expense_vendor:  [],
      note: [],
    })
  }
  
  getExpenseById(){
    this.expenseService.getExpenseById(this.expenseId).subscribe(
      (res: any) => {
        if(res?.data) {
          this.expenseData = res?.data;
          const setExpense = {
            date: moment(this.expenseData.expenseDate).format('YYYY-MM-DD'),
            description: this.expenseData?.expenseDescription,
            amount: this.expenseData?.expenseAmount,
            payment_mode: this.expenseData?.paymentMode,
            note: this.expenseData?.note,
            expense_category: this.expenseData?.expenseCategory,
            expense_vendor: this.expenseData?.expenseVendor
          }

           setTimeout(() => {
             this.categoryId = this.categoriesList?.find(ele => ele.id == this.expenseData?.expenseCategory)?.id;
             this.vendorId = this.vendorsList?.find(ele => ele.id == this.expenseData?.expenseVendor)?.id;
             this.addExpense.patchValue(setExpense);
           }, 500);
        } else {
          this.toaster.showError(res.message)
        }
      }, (error)=> {
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    )
  }

  getCategoriesList( name:any = "" ){
    this.expenseService.getCategoryList(null).subscribe((res: any) => {
      if (res?.data) {
        this.categoriesList = res?.data.map(item => {
          return {
            id: item.id,  
            name: item.categoryName
          }
        });
        if(name){
          this.categoryId = this.categoriesList?.find(ele=>ele.name == name )?.id
          this.addExpense?.controls['expense_category'].patchValue(name)
        }
      }
    });
  }

  getVendorsList(name:any = ''){
    this.expenseService.getVendorsList(null).subscribe(
      (res:any) => {
        if(res?.data){
          this.vendorsList = res?.data.map(item => {
            return {
              id: item.id,  
              name: item.vendorName
            }
          });
          if(name){
            this.vendorId = this.vendorsList?.find(ele=>ele.name == name )?.id
            this.addExpense.controls['expense_vendor'].patchValue(name);
          }
        }
      }
    )
  }

  getPaymentModes(){
    this.expenseService.getPaymentModes().subscribe(
      (res:any) => {
        if(res?.status){
          const paymentModes = res?.data?.payment_mode.map(item => ({
            id: item.id,  
            name: item.mode
          }));
          this.paymentModeList = paymentModes;
        }
      }
    )
  }
  //#endregion Private methods
}
