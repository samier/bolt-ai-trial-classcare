import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router  } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Location } from '@angular/common';
import { Toastr } from '../core/services/toastr';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService implements CanActivate {
    constructor(
        private CommonService:CommonService,
        private location: Location,
        private toastr: Toastr
      ){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Your logic here
    let roles:any = localStorage.getItem('role')
    roles = roles?.split(',')
    if(roles.includes('ROLE_ADMIN')){
      return true;
    }
    this.toastr.showError('Access denied')

    setTimeout(() => {
      let url = window.location.href;
      let splitUrl = url.split('app/');
      if(splitUrl[splitUrl.length - 1] == ''){
        this.location.back();
      }
    }, 1000);
    return false;
  }
}