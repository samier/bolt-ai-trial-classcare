import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDailyPlanningRoutingModule } from './user-daily-planning-routing.module';
import { AddEditLessonPlanComponent } from './add-edit-lesson-plan/add-edit-lesson-plan.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LessonPlanListComponent } from './lesson-plan-list/lesson-plan-list.component';
import { AddEditLecturesComponent } from './add-edit-lectures/add-edit-lectures.component';
import { LecturesListComponent } from './lectures-list/lectures-list.component';
import { ViewCompletedLectureComponent } from './view-completed-lecture/view-completed-lecture.component';


@NgModule({
  declarations: [
    AddEditLessonPlanComponent,
    LessonPlanListComponent,
    AddEditLecturesComponent,
    LecturesListComponent,
    ViewCompletedLectureComponent
  ],
  imports: [
    CommonModule,
    UserDailyPlanningRoutingModule,
    SharedModule
  ]
})
export class UserDailyPlanningModule { }
