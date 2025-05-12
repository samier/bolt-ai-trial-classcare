import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest : HttpClient) { }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  getPreDefineConstant(){
    return this.httpRequest.get(`${this.API_URL}api/customfield/pre-define-constant`);
  }

  storeCustomeField(payload) {
    return this.httpRequest.post(`${this.API_URL}api/customfield/store`,payload);
  }

  updateCustomeField(payload,id) {
    return this.httpRequest.post(`${this.API_URL}api/customfield/update/${id}`,payload);
  }

  getCustomFieldList (payload) {
    return this.httpRequest.post(`${this.API_URL}api/customfield/list`,payload);
  }

  deleteCustomField (id) {
    return this.httpRequest.delete(`${this.API_URL}api/customfield/delete/${id}`);
  }

  getCustomFieldOnId(id) {
    return this.httpRequest.get(`${this.API_URL}api/customfield/view/${id}`);
  }

}
