import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicTablesComponent } from './basic-tables/basic-tables.component';
import { DataTablesComponent } from './data-tables/data-tables.component';
import { TablesRoutingModule } from './tables-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { NgbTableComponent } from './data_table_components/ngb-table/ngb-table.component';
import { BasicAngularTableComponent } from './data_table_components/basic-angular-table/basic-angular-table.component';
// import { AddRemoveDataComponent } from './data_table_components/add-remove-data/add-remove-data.component';
// import { SortingFilterPaginationTableComponent } from './data_table_components/sorting-filter-pagination-table/sorting-filter-pagination-table.component';
// import { SelectionTableComponent } from './data_table_components/selection-table/selection-table.component';
// import { StickyheaderComponent } from './data_table_components/stickyheader/stickyheader.component';
import { SharedModule } from 'src/app/shared/shared.module';
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatFormFieldModule } from '@angular/material/form-field';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
// import {MatCheckboxModule} from '@angular/material/checkbox';
// import { MatInputModule } from '@angular/material/input';
// import { EditTableComponent } from './edit-table/edit-table.component';
import { MaterialModuleModule } from 'src/app/material-module/material-module.module';





@NgModule({
  declarations: [BasicTablesComponent, DataTablesComponent
    ,BasicAngularTableComponent,
    // SortingFilterPaginationTableComponent,
    // SelectionTableComponent,
    // AddRemoveDataComponent,
    // StickyheaderComponent,
    // NgbTableComponent,
    // EditTableComponent,
  ],
  imports: [
    CommonModule,
    TablesRoutingModule,
    SharedModule,
    MaterialModuleModule,
    NgSelectModule,
    NgxDatatableModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class TablesModule { }
