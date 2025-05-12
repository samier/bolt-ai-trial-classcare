import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { subjectComponent } from './subject-order/subject-order.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SubjectsListComponent } from './subjects-list/subjects-list.component';
import { AddSubjectFormComponent } from './add-subject-form/add-subject-form.component';
import { SubjectCardComponent } from './subject-card/subject-card.component';
import { SharedModule } from "../../shared/shared.module";


const routes: Routes = [
  {
    path: 'order/:id',
    component: subjectComponent,
    pathMatch: 'full'
  },
  {
    path: 'subject-list',
    component: SubjectsListComponent,
    pathMatch: 'full'
  },
  {
    path: 'add-subject',
    component: AddSubjectFormComponent,
    pathMatch: 'full'
  },
  {
    path: 'add-subject/:id',
    component: AddSubjectFormComponent,
    pathMatch: 'full'
  }
]
@NgModule({
  declarations: [
    subjectComponent,
    SubjectsListComponent,
    AddSubjectFormComponent,
    SubjectCardComponent,
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    DataTablesModule,
    NgbModule,
    DragDropModule,
    SharedModule
],
  exports: [
    RouterModule
  ]
})
export class subjectModule { }
