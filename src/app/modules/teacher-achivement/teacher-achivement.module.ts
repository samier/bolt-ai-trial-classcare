import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherAchivementRoutingModule } from './teacher-achivement-routing.module';
import { TeacherAchivementComponent } from './teacher-achivement/teacher-achivement.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    TeacherAchivementComponent
  ],
  imports: [
    CommonModule,
    TeacherAchivementRoutingModule,
    SharedModule
  ]
})
export class TeacherAchivementModule { }
