import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';
import { EditEventTypeComponent } from './edit-event-type/edit-event-type.component';
import { AddEventTypeComponent } from './add-event-type/add-event-type.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'create',
    component: AddEventTypeComponent,
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: EventTypeListComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: EditEventTypeComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    EventTypeListComponent,
    EditEventTypeComponent,
    AddEventTypeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    SharedModule        
  ]
})
export class EventTypeModule { }
