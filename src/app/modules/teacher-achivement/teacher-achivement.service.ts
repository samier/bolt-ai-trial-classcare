import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TeacherAchivementService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest : HttpClient) { }

  getAchivement(payload) {
    return this.httpRequest.post(`${this.API_URL}api/teacher-achievement/list`,payload);
  }

  deleteAchivement (id) {
    return this.httpRequest.delete(`${this.API_URL}api/teacher-achievement/delete/${id}`,);
  }

  createAchivement (payload) {
    return this.httpRequest.post(`${this.API_URL}api/teacher-achievement/create`,payload);
  }

  updateAchivement (payload, id) {
    return this.httpRequest.put(`${this.API_URL}api/teacher-achievement/update/${id}`,payload);
  }

  getFaculty(payload) {
    return this.httpRequest.post(`${this.API_URL}api/get-employees-list-for-web`,payload);
  }

}
