import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseListComponent } from './course-list/course-list.component';
import { CourseFormComponent } from './course-form/course-form.component';
import { CourseRoutingModule } from './course-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { CourseOrderComponent } from './course-order/course-order.component';

@NgModule({
  declarations: [
    CourseListComponent,
    CourseFormComponent,
    CourseOrderComponent
  ],
  imports: [
    CommonModule,
    CourseRoutingModule,
    SharedModule,
    RouterModule
  ]
})
export class CourseModule { }
