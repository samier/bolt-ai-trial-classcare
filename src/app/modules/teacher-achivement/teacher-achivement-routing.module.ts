import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherAchivementComponent } from './teacher-achivement/teacher-achivement.component';
import { PermissionGuard } from 'src/app/service/permission.service';

const routes: Routes = [
  {
    path : '',
    component : TeacherAchivementComponent,
    pathMatch : 'full',
    canActivate: [PermissionGuard],
    data: { moduleName: 'administrator_teacher_achivement', permission: 'has_access' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherAchivementRoutingModule { }
