import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class oldSchoolManagementService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getAllSchoolList(params:any){
    return this.httpRequest.post(this.API_URL+'api/old-school/index', params);
  }

  getSchool(school_id:any){
    return this.httpRequest.post(this.API_URL+'api/old-school/get/'+school_id, []);
  }

  createSchool(params:any){
    return this.httpRequest.post(this.API_URL+'api/old-school/create', params);
  }

  updateSchool(params:any, school_id:any){
    return this.httpRequest.put(this.API_URL+'api/old-school/update/'+school_id, params);
  }

  deleteSchool(school_id:any){
    return this.httpRequest.post(this.API_URL+'api/old-school/delete/'+school_id, null);
  }
}
