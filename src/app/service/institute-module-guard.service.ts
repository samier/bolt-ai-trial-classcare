import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { enviroment } from '../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { Toastr } from 'src/app/core/services/toastr';

@Injectable({
  providedIn: 'root'
})
export class InstituteModuleGuard implements CanActivate {

  private institute_modules:any = [];
  private role_wise_permission:any = [];
  private API_URL = enviroment.apiUrl;
  private symfonyHost = enviroment.symfonyHost;

  constructor(private httpRequest: HttpClient,private toastr: Toastr){}
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    // needs to remove after discuss
    
    this.institute_modules = await this.httpRequest.get(this.API_URL+'api/get-institute-modules').toPromise();
    const module_name = next.data['module'];

    if(this.institute_modules?.data?.includes(module_name)){
      return true;
    }
    this.toastr.showError('Access denied');
    if(window.localStorage?.getItem("role")?.includes('STUDENT')){
      window.location.href = this.symfonyHost;   
    }else{
      this.role_wise_permission = await this.httpRequest.post(this.API_URL+'api/modules/role-wise-modules-permission-list',[]).toPromise();
      window.localStorage.setItem("permissions",JSON.stringify(this.role_wise_permission.data));
      window.location.href = this.symfonyHost+'admin';   
    }
    return false;
  }
}