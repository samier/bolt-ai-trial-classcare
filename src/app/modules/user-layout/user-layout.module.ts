import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserLayoutRoutingModule } from './user-layout-routing.module';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UserHeaderComponent } from './user-header/user-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { PlanDetailsComponent } from './plan-details/plan-details.component';
import { UserBranchListComponent } from './user-branch-list/user-branch-list.component';
import { UserBranchAddEditComponent } from './user-branch-add-edit/user-branch-add-edit.component';


@NgModule({
  declarations: [
    UserLayoutComponent,
    UserHeaderComponent,
    UserProfileComponent,
    PlanDetailsComponent,
    UserBranchListComponent,
    UserBranchAddEditComponent,
  ],
  imports: [
    CommonModule,
    UserLayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgbModule,
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot()
  ]
})
export class UserLayoutModule { }
