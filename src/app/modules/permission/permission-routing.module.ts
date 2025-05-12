import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentPermissionComponent } from './student-permission/student-permission.component';

const routes: Routes = [
  {
    path:'student',
    component : StudentPermissionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionRoutingModule { }
