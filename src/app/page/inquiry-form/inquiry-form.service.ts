import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class InquiryFormService {

 private API_URL = enviroment.apiUrl;
 
   constructor( private httpRequest : HttpClient) { }

   getInquiryForm(id){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/user/form/get/${id}`,[])
  }

  storeInquiry (id,payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/user/form/store/${id}`,payload)
  }

  getClassList (payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/get/class`,payload)
  }

}
