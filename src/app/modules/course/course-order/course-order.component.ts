import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CourseService } from '../course.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-course-order',
  templateUrl: './course-order.component.html',
  styleUrls: ['./course-order.component.scss']
})
export class CourseOrderComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  sortedClass: any [] = []
  URLConstants = URLConstants
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public _courseService: CourseService,
    private toastr: Toastr,
    public CommonService : CommonService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getSortedClass();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sortedClass, event.previousIndex, event.currentIndex);
    const updatedOrder = this.sortedClass.map((course: any) => {
      return {
        id: course.id,
        class_order: this.sortedClass.indexOf(course)
      }
    })
    this._courseService.updateClassOrder({course: updatedOrder}).subscribe((res: any) => {
      if(res?.status){
        this.toastr.showSuccess(res?.message)
      } else {
        this.toastr.showError(res?.message)
      }
    }, (error)=> {
      this.toastr.showError(error?.error?.message ?? error?.message)
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  getSortedClass(){
    this._courseService.getSortedClass().subscribe((res: any) => {
      if(res?.status){
        this.sortedClass = res?.data;
      }
    })
  }
	
  //#endregion Private methods
}