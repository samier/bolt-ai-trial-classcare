import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { AcademicYearService } from '../academic-year.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-academic-year-list',
  templateUrl: './academic-year-list.component.html',
  styleUrls: ['./academic-year-list.component.scss']
})
export class AcademicYearListComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  academicYearList :any = []

  loading:boolean = true;
  deleting:boolean = false;
  URLConstants = URLConstants;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public academicYearService: AcademicYearService,
    public commonService: CommonService,
    private toastr: Toastr
  ) { }

  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getAcademicYearList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  deleteAcademicYear (id) {
    if(confirm('Are you sure want to delete this academic year ?')){
      this.deleting = true
      this.academicYearService.deleteAcademicYear(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status) {
          this.getAcademicYearList(); 
          this.commonService.triggerYearDropdownRefresh();
          this.toastr.showSuccess(res.message)
        } else {
          this.toastr.showError(res.message)
        }
        this.deleting = false
      } ,(error)=> {
        this.deleting = false
        this.toastr.showError(error?.error?.message ?? error?.message)
      })
    }
  }
  
  markAsCurrent (id) {
    if(confirm('Are you sure you want to make this year as current year ?')){
      this.deleting = true
      this.academicYearService.markAsCurrent(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status) {
          this.getAcademicYearList(); 
          this.toastr.showSuccess(res.message)
        } else {
          this.toastr.showError(res.message)
        }
        this.deleting = false
      } ,(error)=> {
        this.deleting = false
        this.toastr.showError(error?.error?.message ?? error?.message)
      })
    }
  }


  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getAcademicYearList() {
    this.loading = true;
    this.academicYearList = [];
    this.academicYearService.getAcademicYearList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.academicYearList = res.data; 
      } else {
        this.toastr.showError(res.message)
      }
      this.loading = false;
    } ,(error)=> {
      this.loading = false;
        this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  //#endregion Private methods

}
