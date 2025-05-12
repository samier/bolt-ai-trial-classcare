import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEventComponent } from './add-event/add-event.component';
import { EventListComponent } from './event-list/event-list.component';
import { EditEventComponent } from './edit-event/edit-event.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from 'src/app/shared/shared.module';
import { EventGalleryComponent } from './event-gallery/event-gallery.component';
import { AddEventGalleryComponent } from './add-event-gallery/add-event-gallery.component';
import { EventGalleryDetailComponent } from './event-gallery-detail/event-gallery-detail.component';


const routes: Routes = [
  {
    path: 'create',
    component: AddEventComponent,
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: EventListComponent,
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: EditEventComponent,
    pathMatch: 'full'
  },
  {
    path: 'gallery-list',
    component: EventGalleryComponent,
    pathMatch: 'full'
  },
  {
    path: 'gallery-detail/:id',
    component: EventGalleryDetailComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AddEventComponent,
    EventListComponent,
    EditEventComponent,
    EventGalleryComponent,
    AddEventGalleryComponent,
    EventGalleryDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ]
})
export class EventModule { }
