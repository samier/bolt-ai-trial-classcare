import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/environment.staging';
import { Router,NavigationEnd,Route } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  private symfonyHost = enviroment.symfonyHost;
  public isLoggedIn = ('; '+document.cookie)?.split(`; LOGGEDIN=`)?.pop()?.split(';')[0];
  public is_admin   = window.localStorage.getItem("role")?.includes('ROLE_ADMIN');
  public is_faculty = window.localStorage?.getItem("role")?.includes('ROLE_FACULTY')  
  public is_staff   = window.localStorage?.getItem("role")?.includes('ROLE_STAFF');
  public is_branch_admin   = window.localStorage?.getItem("role")?.includes('ROLE_BRANCH_ADMIN');  
  public is_back_office   = window.localStorage?.getItem("role")?.includes('ROLE_BACK_OFFICE');  

  constructor(private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Your logic here
    
    // if(this.isLoggedIn == "1" && (this.is_admin || this.is_faculty || this.is_staff || this.is_branch_admin || this.is_back_office)){
    if(this.isLoggedIn == "1"){
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const urlSegments = this.router.parseUrl(this.router.url).root.children['primary'].segments;
          if(urlSegments[1].path != 'user'){
            if(localStorage.getItem('dataTables_users_list')){
              localStorage.removeItem('dataTables_users_list')
            }
            if(localStorage.getItem('user_params')){
              localStorage.removeItem('user_params')
            }
          }
          if(!isNaN(Number(urlSegments[0].path))){
            window.localStorage.setItem("branch",urlSegments[0].path);
            const branches = ('; '+document.cookie)?.split(`; BRANCHES=`)?.pop()?.split(';')[0].split('%2C');
            if(false == branches?.includes(urlSegments[0].path)){
              window.location.href = this.symfonyHost+'admin';
            }
          }else{
            if(urlSegments[0].path != 'user'){
              window.location.href = this.symfonyHost+'admin';  
            }
          }
        }
      });
      return true;
    }
    window.location.href = this.symfonyHost+'admin';  
    return false;
  }
}