import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

  private API_URL = enviroment.apiUrl;

  constructor( private httpRequest : HttpClient) { }


  getInquiryFormList(payload){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/fields/get/datatable`,payload)
  }

  getAllEmployee(){
    return this.httpRequest.post(`${this.API_URL}api/inquiry/get-responsible-users`,{})
    // return this.httpRequest.post(`${this.API_URL}api/get-employees-list-for-web`,[])
  }

  getInquiryFormFields() {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/fields/list`,[])
  }

  storeInquiryFormFields(payLoad) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/fields/store`,payLoad)
  }

  getInquiryFieldsOnId(id) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/fields/${id}`,[])
  }

  updateInquiryFormFields(id,payLoad) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/fields/update/${id}`,payLoad)
  }

  deleteInquiryForm(id) {
    return this.httpRequest.delete(`${this.API_URL}api/inquiry/form/fields/delete/${id}`)
  }

  updateFormStatus(payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/form/update/status`,payload)
  }

}
