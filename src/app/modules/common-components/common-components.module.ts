import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentSearchComponent } from './student-search/student-search.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    StudentSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
  ],
  exports: [
    StudentSearchComponent
  ]
})
export class CommonComponentsModule { }
