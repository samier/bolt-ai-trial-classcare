import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader-service';
import { finalize } from 'rxjs/operators';
import { enviroment } from '../../../environments/environment.staging';
import { Toastr } from '../services/toastr';
import { Location } from '@angular/common';
import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
    constructor(
      // private router: Router,
      private loaderService: LoaderService,
      private toastr: Toastr,
      private location: Location,
      private _router : Router,
      private _sharedUserService : SharedUserService
    ) { }
    token:string|null|undefined = null;
    symfonyHost = enviroment.symfonyHost;
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      if(!window.localStorage.getItem('token')) {
        this._sharedUserService.isLoginCheck.next(true);
      } 
      this.loaderService.show();
      const hostname = new URL(request.url).hostname;
      const href = new URL(request.url).href;
      const academic_year_id = sessionStorage.getItem('academic_year_id');
      const academicYear : any = ('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0];
      const isActivityLog : any =  JSON.parse( localStorage.getItem('institute') || '[]' )?.some((module: any) => module == 'Activity Log') 

      // After dashboard convert in angular now token role and user_id strore from here from cookies

      const token:any = ('; '+document.cookie)?.split(`; USER_BEARER=`)?.pop()?.split(';')[0];
      const roleList:any = ('; '+document.cookie)?.split(`; roles=`)?.pop()?.split(';')[0];
      const decodedArray = decodeURIComponent(roleList);
      const role = decodedArray ? JSON.parse(decodedArray).join(',') : '';
      const user_id:any = ('; '+document.cookie)?.split(`; user_id=`)?.pop()?.split(';')[0];
      localStorage.setItem("token",token);
      localStorage.setItem("role",role);
      localStorage.setItem("user_id",user_id);

      const localBranchId = localStorage.getItem('branch')
      if(!localBranchId) {
        const currentBranchId : any = ('; '+document.cookie)?.split(`; current_branch_id=`)?.pop()?.split(';')[0];
        localStorage.setItem("branch",currentBranchId);
      }

      if(academic_year_id && (academic_year_id != academicYear)){
        window.alert('The branch or academic year has been changed in another tab.')
        let branch_id:any = ('; '+document.cookie)?.split(`; current_branch_id=`)?.pop()?.split(';')[0]
        if (branch_id == '') {
          branch_id = 1
        }
        // const url = `${this.symfonyHost}${branch_id}/dashboard`;
        const url = `/${branch_id}/dashboard`;
        sessionStorage.setItem('academic_year_id', academicYear);
        this._router.navigate([url])
        window.location.reload();
        return throwError('The branch or academic year has been changed in another tab.');
      }

      if(href.includes('v1/api') || href.includes('v2/api')){
        this.token = window.localStorage.getItem("token");
      }else{
        this.token = ('; '+document.cookie)?.split(`; AUTH=`)?.pop()?.split(';')[0]??"";
      }
      const branchId = window.localStorage.getItem("branch")?.toString()??"";
      sessionStorage.setItem('academic_year_id', academicYear);
      // TODO: [Add branch _id in header]
      if (branchId) {
        request = request.clone({
          headers: request.headers.set('branch_id', branchId)
        });
      }

      // TODO: [Add academic_year_id _id in header]
      if (!request.url.includes(enviroment.s3BucketUrl)) {
        if (academicYear) {
          request = request.clone({
            headers: request.headers.set('academic_year_id', academicYear)
          });
        }

        if (request.body instanceof FormData && academicYear) {
          request.body.append('academic_year_id', academicYear);
        }

        request = request.clone({
          headers: request.headers.set('Accept', 'application/json').set('Authorization', 'Bearer ' + this.token).set('Referrer-Policy', 'unsafe-url'),
          body: request.body instanceof FormData ? request.body.append('branch_id', branchId) : { ...(academicYear && { academic_year_id: academicYear }), ...request.body, branch_id: branchId }
        })

        request = request.clone({
          headers: request.headers.set('Accept', 'application/json').set('Authorization', 'Bearer ' + this.token).set('Referrer-Policy', 'unsafe-url'),
          body: request.body instanceof FormData
            ? (request.body.append('branch_id', branchId), request.body.append('activity_log',  String(isActivityLog ? 1 : 0 )) )
            : {
              ...(academicYear && { academic_year_id: academicYear }),
              ...request.body,
              branch_id: branchId,
              activity_log: isActivityLog ? 1 : 0
            }
        })

        // TODO: [Add branch_id & academic_year_id _id in get request params]
        if (request.method === 'GET' && !request.url.includes('http://classcare.ap-south-1')) {
          var params = request.params ?? new HttpParams();
          params = params.append('academic_year_id', academicYear);
          params = params.append('branch_id', branchId);
          params = params.append('activity_log', isActivityLog ? 1 : 0 );
          request = request.clone({
            params: params
          });
        }
      }

     

      return next.handle(request).pipe(catchError(error => {
        if (error instanceof HttpErrorResponse) {

          if (error.status === 403 && error.error.message === 'Your subscription has expired!') {
            this._router.navigate(['/access-denied']);
          }

          if (error.status === 401) {
              // Unauthorised request
              // window.location.href = enviroment.symfonyHost+'logout';
          }

            if (error.status === 403) {
              this.toastr.showError('Access denied');
              if(window.localStorage?.getItem("role")?.includes('STUDENT')){
                // window.location.href = enviroment.symfonyHost;
              }else{
                // window.location.href = enviroment.symfonyHost+'admin';
                // this.location.back();
              }
            }

            if (error.status === 404) {
              // Not found
              // this.router.navigate(['/pagenotfound']);
            }
         }
        return throwError(error);
      }),finalize(() => {
        this.loaderService.hide();
      }));
    }
}
