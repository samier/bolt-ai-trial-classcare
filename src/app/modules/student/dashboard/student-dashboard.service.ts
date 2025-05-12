import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class StudentDashboardService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  getGenderData(){
    return this.httpRequest.post(`${this.API_URL}api/student/get-classwise-student-gender-for-datatable`, []);
  }

  getNewAdmissionAndStrengthData(payload:any) {
    return this.httpRequest.post(`${this.API_URL}api/dashboard/get-academic-year-wise-new-admission-type-student`, payload);
  }

  getStudentCategory () {
    return this.httpRequest.post(`${this.API_URL}api/dashboard/get-category-wise-student-count`,[]);
  }

}
