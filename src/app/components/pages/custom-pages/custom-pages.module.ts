import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomPagesRoutingModule } from './custom-pages-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
// import { LockscreenComponent } from './lockscreen/lockscreen.component';
// import { UnderConstructionComponent } from './under-construction/under-construction.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error501Component } from './error501/error501.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxTimerModule } from 'ngx-timer';



@NgModule({
  declarations: [
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    // LockscreenComponent,
    // UnderConstructionComponent,
    Error404Component,
    Error500Component,
    Error501Component
  ],
  imports: [
    CommonModule,
    CustomPagesRoutingModule,
    NgbModule,
    NgxTimerModule
  ]
})
export class CustomPagesModule { }
