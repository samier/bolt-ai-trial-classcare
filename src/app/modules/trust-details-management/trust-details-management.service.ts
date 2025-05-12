import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TrustDetailManagementService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getTrustDetailList(params:any){
    return this.httpRequest.post(this.API_URL+'api/trust/index', params);
  }

  getTrustDetail(trust_id:any){
    return this.httpRequest.get(this.API_URL+'api/trust/get/'+trust_id);
  }

  createTrustDetails(params:any){
    return this.httpRequest.post(this.API_URL+'api/trust/create', params);
  }

  updateTrustDetails(params:any, trust_id:any){
    return this.httpRequest.post(this.API_URL+'api/trust/update/'+trust_id, params);
  }

  deleteTrustDetails(id:any){
    return this.httpRequest.post(this.API_URL+'api/trust/delete/'+id, null);
  }
}
