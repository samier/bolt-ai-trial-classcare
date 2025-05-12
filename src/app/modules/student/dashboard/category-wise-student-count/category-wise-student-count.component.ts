import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { StudentDashboardService } from '../student-dashboard.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-category-wise-student-count',
  templateUrl: './category-wise-student-count.component.html',
  styleUrls: ['./category-wise-student-count.component.scss']
})
export class CategoryWiseStudentCountComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  isLoading : boolean = false
  studentCategoryData : any = []
  height : number = 400
  noDataFound : boolean = false
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _studentDashboardService: StudentDashboardService,
    private _toaster: Toastr,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getStudentcategoryData()
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

  getStudentcategoryData() {
      this.isLoading = true;
    
      this._studentDashboardService.getStudentCategory()
        .pipe(takeUntil(this.$destroy))
        .subscribe((res: any) => {
          if (res.data) {
            this.isLoading = false;
            this.studentCategoryData = res.data;
          } else {
            this._toaster.showError(res.message);
            this.isLoading = false;
          }
        }, error => {
          this._toaster.showError(error?.error?.message ?? error?.message);
          this.isLoading = false;
        });
    }
  
  //#endregion Private methods
}