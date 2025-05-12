import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  private API_URL = enviroment.apiUrl;
  
  constructor(
    private httpRequest: HttpClient,
  ) { }

  activityLoglList(params:any){
    return this.httpRequest.post(`${this.API_URL}api/activity-log`,params)
  }

  // TO GET THE ACTION DROPDOWN AND MODULE DROPDOWN
  moduleDropDownList(){
    return this.httpRequest.post(`${this.API_URL}api/activity-log/module-name`,{})
  }

  // EMPLOYEE DROPDOWN
  employeeDropDownList(){
    return this.httpRequest.post(`${this.API_URL}api/get-employees-list-for-leave`,{type:2})
  }
}
