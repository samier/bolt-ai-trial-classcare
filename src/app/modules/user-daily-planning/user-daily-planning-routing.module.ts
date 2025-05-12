import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEditLessonPlanComponent } from './add-edit-lesson-plan/add-edit-lesson-plan.component';
import { LessonPlanListComponent } from './lesson-plan-list/lesson-plan-list.component';
import { AddEditLecturesComponent } from './add-edit-lectures/add-edit-lectures.component';
import { LecturesListComponent } from './lectures-list/lectures-list.component';

const routes: Routes = [
  {
    path: 'add-lesson-plan',
    component: AddEditLessonPlanComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit-lesson-plan/:id',
    component: AddEditLessonPlanComponent,
    pathMatch: 'full'
  },
  {
    path: 'lesson-plan-list',
    component: LessonPlanListComponent,
    pathMatch: 'full'
  },
  {
    path: 'add-lecture',
    component: AddEditLecturesComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit-lecture/:id',
    component: AddEditLecturesComponent,
    pathMatch: 'full'
  },
  {
    path: 'lectures-list',
    component: LecturesListComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserDailyPlanningRoutingModule { }
