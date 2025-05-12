import { Routes } from '@angular/router';
import { StudentGuard } from 'src/app/service/student-guard.service';
import { AdminGuard } from 'src/app/service/admin-guard.service';

//Route for content layout with sidebar, navbar and footer.

export const Full_Content_Routes: Routes = [
    // {
    //     path: 'dashboard',
    //     loadChildren: () => import('../../components/dashboard/dashboard.module').then(m => m.DashboardModule)
    // },
    {
        path: 'icon',
        loadChildren: () => import('../../components/icon/icon.module').then(m => m.IconModule)
    },
    // {
    //     path: 'charts',
    //     loadChildren: () => import('../../components/charts/charts.module').then(m => m.ChartModule)
    // },
    // {
    //     path: 'apps',
    //     loadChildren: () => import('../../components/apps/apps.module').then(m => m.AppsModule)
    // },
    {
        path: 'elements',
        loadChildren: () => import('../../components/elements/elements.module').then(m => m.ElementsModule)
    },
    // {
    //     path: 'advanced',
    //     loadChildren: () => import('../../components/advanced-ui/advanced-ui.module').then(m => m.AdvancedUiModule)
    // },
    // {
    //     path: 'form',
    //     loadChildren: () => import('../../components/form/form.module').then(m => m.FormModule)
    // },
    {
        path: 'tables',
        loadChildren: () => import('../../components/tables/tables.module').then(m => m.TablesModule)
    },

    // {
    //     path: 'maps',
    //     loadChildren: () => import('../../components/maps/maps.module').then(m => m.MapsModule)
    // },
    {
        path: 'pages',
        loadChildren: () => import('../../components/pages/pages.module').then(m => m.PagesModule)
    },
    // {
    //     path: 'utilities',
    //     loadChildren: () => import('../../components/utilities/utilities.module').then(m => m.UtilitiesModule)
    // },
    // {
    //     path: 'menu-levels',
    //     loadChildren: () => import('../../components/menu-levels/menu-levels.module').then(m => m.MenuLevelsModule)
    // },
    {
        path: ':branch',
        canActivate: [AdminGuard],
        loadChildren: () => import('src/app/modules/private.module').then(m => m.ModulesModule),
    },
    {
        path: 'student',
        canActivate: [StudentGuard],
        loadChildren: () => import('src/app/modules/shared.module').then(m => m.SharedModule),
    },
    // {
    //     path: 'user',
    //     // canActivate: [StudentGuard],
    //     loadChildren: () => import('src/app/modules/user/user.module').then(m => m.UserModule),
    // }
];
