import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentLayoutComponent } from './shared/layouts/content-layout/content-layout.component';
import { FullLayoutComponent } from './shared/layouts/full-layout/full-layout.component';
import { SwitcherOneLayoutsComponent } from './shared/layouts/switcher-one-layouts/switcher-one-layouts.component';
import { Content_Routes } from './shared/routes/content.routes';
import { Full_Content_Routes } from './shared/routes/full.routes';
import { SwitcherOneRoute } from './shared/routes/switcher-one-route';
import { SubscriptionAccessDeniedComponent } from './page/subscription-access-denied/subscription-access-denied.component';
import { InquiryFormComponent } from './page/inquiry-form/inquiry-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  {
    path:'user',
    // component:UserLayoutComponent
    loadChildren: () => import('src/app/modules/user-layout/user-layout.module')
    .then(m => m.UserLayoutModule),
  },
  {
    path:'access-denied',
    component:SubscriptionAccessDeniedComponent
  },
  {
    path:'inquiry-form/:id',
    component:InquiryFormComponent
  },
  {
    path: 'embedded-signup',
    loadChildren: () => import('src/app/modules/whatsapp/whatsapp.module').then(m => m.WhatsappModule)
  },
  { path: '', component: FullLayoutComponent, children: Full_Content_Routes },
  { path: '', component: ContentLayoutComponent, children: Content_Routes },
  { path: '', component: SwitcherOneLayoutsComponent, children: SwitcherOneRoute },
  {
    path: '',
    loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule)
  },
  {
    path: '', title:"Valex - login",
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
  }

];

@NgModule({
  imports: [[RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy'
  })],
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
