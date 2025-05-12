import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentListComponent } from './document-list/document-list.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdown, NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DocumentAddComponent } from './document-add/document-add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'document-list',
    component: DocumentListComponent,
    pathMatch: 'full'
  },
  {
    path: 'document-add',
    component: DocumentAddComponent,
    pathMatch: 'full'
  },
  {
    path: 'document-edit/:id',
    component: DocumentAddComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentAddComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    DataTablesModule,
    ReactiveFormsModule,    
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    SharedModule
  ]
})
export class DocumentManagerModule { }
