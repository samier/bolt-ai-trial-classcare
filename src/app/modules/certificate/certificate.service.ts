import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class certificateService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getSectionAndClass(section?:any){
    return this.httpRequest.post(this.API_URL+'api/get-section-and-classes', {section: section});
  }

  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  getStudentList(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-students-by-batch',data);
  }

  getTemplate(){
    return this.httpRequest.get(this.API_URL+'api/generate/certificate-master/list');
  }

  generateCertificate(data:any){
    return this.httpRequest.post(this.API_URL+'api/generate/certification', data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  certificateList(data:any){
    return this.httpRequest.post(this.API_URL+'api/generate/certification/list', data);
  }

  printCertificate(id:any){
    return this.httpRequest.post(this.API_URL+'api/print/certificate/'+id, [], {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deleteCertificate(id:any){
    return this.httpRequest.post(this.API_URL+'api/delete/certificate/'+id, []);
  }

}
