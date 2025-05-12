import { Routes } from "@angular/router";

export const Content_Routes: Routes = [
    {
        path: 'custompages',
        loadChildren: ()=> import('../../components/pages/custom-pages/custom-pages.module').then(m => m.CustomPagesModule)
    }
];