import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error501Component } from './error501/error501.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
// import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
// import { UnderConstructionComponent } from './under-construction/under-construction.component';

const routes: Routes = [
  {
      path: '',
      children: [
          {
              path: 'signin', title:"Valex - Signin",
              component: SignInComponent
          },
          {
              path: 'sign-up', title:"Valex - Sign Up",
              component: SignUpComponent
          },
          {
              path: 'forgot-password', title:"Valex - Forgot Password",
              component: ForgotPasswordComponent
          },
          {
              path: 'reset-password', title:"Valex - Reset Password",
              component: ResetPasswordComponent
          },
          // {
          //     path: 'lockscreen', title:"Valex - Lockscreen",
          //     component: LockscreenComponent
          // },
          // {
          //   path: 'under-construction', title:"Valex - Under-construction",
          //   component: UnderConstructionComponent
          // },
          {
            path: 'error404', title:"Valex - Error 404",
            component: Error404Component
          },
          {
            path: 'error500', title:"Valex - Error 500",
            component: Error500Component
          },
          {
            path: 'error501', title:"Valex - Error 501",
            component: Error501Component
          }
      ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomPagesRoutingModule { }
