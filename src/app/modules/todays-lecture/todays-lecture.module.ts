import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodaysLectureListComponent } from './todays-lecture-list/todays-lecture-list.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'list',
    component: TodaysLectureListComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
  
    TodaysLectureListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule
  ]
})
export class TodaysLectureModule { }
