import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CourseService } from '../course.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})
export class CourseListComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  courseList :any = []

  loading:boolean = true;
  deleting:boolean = false;
  URLConstants = URLConstants;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public courseService:CourseService,
    public commonService:CommonService,
    private toastr:Toastr
  ) { }

  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getCourseList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  deleteCourse (id) {
    if(confirm('Are you sure want to delete course?')){
      this.deleting = true
      this.courseService.deleteCourse(id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status) {
          this.getCourseList(); 
          this.toastr.showSuccess(res.message)
        } else {
          this.toastr.showError(res.message)
        }
        this.deleting = false
      } ,(error)=> {
        this.deleting = false
        this.toastr.showError(error?.error ?? error?.error?.message)
      })
    }
  }


  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getCourseList() {
    this.loading = true;
    this.courseList = [];
    this.courseService.getCourseList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.courseList = res.data; 
      } else {
        this.toastr.showError(res.message)
      }
      this.loading = false;
    } ,(error)=> {
      this.loading = false;
      this.toastr.showError(error?.error ?? error?.error?.message)
    })
  }

  //#endregion Private methods

}
