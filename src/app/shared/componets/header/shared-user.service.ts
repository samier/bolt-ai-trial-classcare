import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedUserService {
  user: any;

  subscriptionDetails: BehaviorSubject<any>;
  subscriptionDetails$: Observable<any>

  isLoginCheck: BehaviorSubject<boolean>;
  isLoginCheck$: Observable<boolean>

  private API_URL = enviroment.apiUrl;
  private SYMPHONY_API_URL = enviroment.symfonyHost;
  public branch_id  = window.localStorage?.getItem("branch");

  constructor(private httpRequest: HttpClient) {
    this.subscriptionDetails = new BehaviorSubject(null);
    this.subscriptionDetails$ = this.subscriptionDetails.asObservable();

    this.isLoginCheck = new BehaviorSubject(false);
    this.isLoginCheck$ = this.isLoginCheck.asObservable();
   }

  searchStudent(param:any){
    const branchId = window.localStorage?.getItem("branch")
    return this.httpRequest.post(this.API_URL+'api/studentFilter/'+branchId,param);
  }

  getAcadamicYearList(param: any) {
    return this.httpRequest.post(this.API_URL + 'api/filter/get-users-academic-years', param);
  }

  getSubscriptionDetails() {
    return this.httpRequest.post(this.API_URL + 'api/me', []);
  }
}
