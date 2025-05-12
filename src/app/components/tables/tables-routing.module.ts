import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BasicTablesComponent } from "./basic-tables/basic-tables.component";
import { DataTablesComponent } from "./data-tables/data-tables.component";
// import { EditTableComponent } from "./edit-table/edit-table.component";


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'basictables', title:"Valex - Basictables",
                component: BasicTablesComponent
            },
            {
                path: 'datatables', title:"Valex - Datatables",
                component: DataTablesComponent
            },
            // {
            //     path: 'edittables', title:"Valex - Edittables",
            //     component: EditTableComponent
            // },
        ],
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TablesRoutingModule { }