import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class documentManagerService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  //Get branch id
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  
  storeDocument(data:any) {
    return this.httpRequest.post(this.API_URL+'api/document-manager/store',data);
  }

  getDocumentTypeList(data:any){
    return this.httpRequest.post(this.API_URL+'api/document-manager/list',data);
  }

  getDocumentType(id:any){
    return this.httpRequest.post(this.API_URL+'api/document-manager/getDocument/'+id, []);
  }

  updateDocument(data:any, id:any){
    return this.httpRequest.post(this.API_URL+'api/document-manager/update/'+id,data);
  }

  deleteDocumentType(id:any){
    return this.httpRequest.post(this.API_URL+'api/document-manager/delete/'+id, []);
  }
}
