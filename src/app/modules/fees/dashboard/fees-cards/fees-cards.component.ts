import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesService } from '../../fees.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-fees-cards',
  templateUrl: './fees-cards.component.html',
  styleUrls: ['./fees-cards.component.scss']
})
export class FeesCardsComponent implements OnInit, OnChanges {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  dashboardForm : FormGroup = new FormGroup({})
  @Input() yearsList = []
  @Input() branchList:any = []
  @Input() currentYear:string = ''
  isLoading : boolean = false
  feesDetails:any  = []

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _feesService : FeesService,
      private _toaster : Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const currentYear = this.yearsList.find((ele: any) => ele.name == this.currentYear)
    if (currentYear && this.dashboardForm && changes['yearsList']?.currentValue.length > 0) {
      this.dashboardForm.get('academicYear')?.patchValue([currentYear]);
    } else if (changes['branchList']?.currentValue.length > 0) {
      this.getFeesDetailsForDashboard()
    }
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  clearData() {
    this.dashboardForm.reset()
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.dashboardForm = this._fb.group({
      academicYear: [],
      dates: [],
      branches: []
    })
  }

  getFeesDetailsForDashboard() {
    const payload = {
      dates: this.dashboardForm?.value?.dates?.startDate ? [this.dashboardForm?.value?.dates.startDate?.format('YYYY-MM-DD'),this.dashboardForm?.value?.dates.endDate?.format('YYYY-MM-DD')] : [],
      academicYear: this.dashboardForm?.value?.academicYear?.length > 0 ? this.dashboardForm.value.academicYear.map(ele => ele.id) : [],
      branches: this.dashboardForm?.value?.branches?.length > 0 ? this.dashboardForm.value.branches.map(ele => ele.id) : []
    }

    this.isLoading = true

    this._feesService.getFeesDetailsForDashboard(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        res.data.discount.branch_wise_discount = Object.values(res.data.discount.branch_wise_discount)
        res.data.total_reamining_fee.reamaining_branchwise_Fees = Object.values(res.data.total_reamining_fee.reamaining_branchwise_Fees)
        res.data.total_collection.total_branchwise_fees_collection = Object.values(res.data.total_collection.total_branchwise_fees_collection)
        this.feesDetails = res.data
        this.isLoading = false
      } else {
        this.isLoading = false
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this.isLoading = false
      this._toaster.showError(error.errro.message ?? error.message)
    })
  }
  //#endregion Private methods
}