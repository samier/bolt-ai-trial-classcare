import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class FeesCategoryManagementService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getTrustDetailList(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/index', params);
  }

  getTrustDetail(trust_id:any){
    return this.httpRequest.get(this.API_URL+'api/fees-category/get/'+trust_id);
  }

  createTrustDetails(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/create', params);
  }

  updateTrustDetails(params:any, trust_id:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/update/'+trust_id, params);
  }

  deleteTrustDetails(id:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/delete/'+id, null);
  }

  getTrustList(){
    return this.httpRequest.get(this.API_URL+'api/fees-category/get-trust-list');
  }
  
  getCourseList(){
    return this.httpRequest.get(this.API_URL+'api/fees-category/course-list');
  }

  getIncomeHeadList(){
    return this.httpRequest.post(this.API_URL+'api/head/list/income', []);
  }
}
