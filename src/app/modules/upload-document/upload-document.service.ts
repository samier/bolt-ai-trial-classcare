import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class UploadDocumentService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  storeDocument (payload) {
    return this.httpRequest.post(`${this.API_URL}api/template-manager/store`,payload);
  }

  deleteDocument (id) {
    return this.httpRequest.delete(`${this.API_URL}api/template-manager/delete/${id}`);
  }

  documentList (payload) {
    return this.httpRequest.post(`${this.API_URL}api/template-manager/list`,payload);
  }


}
