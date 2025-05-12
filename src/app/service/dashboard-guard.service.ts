import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Toastr } from '../core/services/toastr';
import { enviroment } from '../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashBoardGuard implements CanActivate {

  cookie_academic_id: any = Number(('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]);

  constructor(
    private httpRequest: HttpClient,
    private toastr: Toastr,
    private router: Router
  ) { }
  
  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean> {
    const branchId = next.parent?.params['branch'];
    
    const academic_years: any = await this.httpRequest.post(enviroment.apiUrl + 'api/filter/get-users-academic-years',
      {
        current_branch_id: [branchId]
      }).toPromise();

    const cookie_has = academic_years?.data?.find(item=>item?.id == this.cookie_academic_id)
      
    const current = cookie_has ? cookie_has : academic_years?.data?.find(item=>item.current == 1);

    const role_wise_permission :any = await this.httpRequest.post(enviroment.apiUrl+'api/modules/role-wise-modules-permission-list',[]).toPromise();
    window.localStorage.setItem("permissions",JSON.stringify(role_wise_permission?.data));
    
    document.cookie = `academic_year_id=${current?.id}; expires=0; path=/`;
    const academic_year_id = JSON.stringify(current?.id);
    sessionStorage.setItem('academic_year_id', academic_year_id);
        
    if(!current){
        this.toastr.showError('Access denied')
        window.location.href = enviroment.symfonyHost+'admin';  
        return false;
    }
    
    return true;
  }
}