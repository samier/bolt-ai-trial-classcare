import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {

  private symfonyHost = enviroment.symfonyHost;
  public isLoggedIn = ('; '+document.cookie)?.split(`; LOGGEDIN=`)?.pop()?.split(';')[0];
  public is_student = window.localStorage.getItem("role")?.includes('STUDENT');
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Your logic here

    if(this.isLoggedIn == "1" && this.is_student){
      return true; // or false to prevent the route from activating
    }
    window.location.href = this.symfonyHost;  
    return false;
  }
}