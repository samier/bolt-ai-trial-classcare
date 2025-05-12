import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';
import { StudentDashboardModule } from '../core/student-dashboard/student-dashboard.module';
import { SharedComponent } from './shared.component';
import { PipesModule } from '../shared/pipes';
import { DashboardModule } from './dashboard/dashboard.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SharedComponent],
  imports: [
    CommonModule,
    SharedRoutingModule,
    StudentDashboardModule,
    DashboardModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers:[DatePipe]
})
export class SharedModule { }
