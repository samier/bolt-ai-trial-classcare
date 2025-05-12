import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FeesService } from '../../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ResultService } from 'src/app/modules/result/result.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  dashboardForm : FormGroup = new FormGroup({})
  isLoading : boolean = false
  feesDetails:any = []
  yearsList :any = []
  branchList :any = []
  currentAcadamicyear:any
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _feesService : FeesService,
    private _toaster : Toastr,
    private _fb: FormBuilder,
    private _resultService: ResultService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    // this.getFeesDetailsForDashboard();
    this.getBranchYear()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.dashboardForm = this._fb.group({
      date: [''],
      branch_id : []
    })
  }

  getBranchYear() {
    this._feesService.getDashboardBranch().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.branchList = res.data.map((ele) => {
        return { id: ele.id, name: ele.branchName }
      })
      // this.branchList =  [{ id: '', name: 'All Branch' }].concat(branch);
    })
    const payload = {
      current_branch_id: [localStorage.getItem('branch')],
    }
    this._resultService.getAcademicYearsList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.currentAcadamicyear = res.data.find(ele => ele.current)?.year
      this.yearsList = res.data.map((ele) => {
        return { id: ele.year, name: ele.year }
      })
    })
  }
  
  //#endregion Private methods
}