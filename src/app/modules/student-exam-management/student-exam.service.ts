import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { callAPIConstants } from 'src/app/shared/constants/callAPI-constants';

@Injectable({
  providedIn: 'root'
})
export class StudentExamService {

  private API_URL = enviroment.apiUrl;
  private SYMFONY_API_URL = enviroment.symfonyHost;

  constructor(private httpRequest: HttpClient) { }

  // exam
  getTodaysExam(student_id:any = null){
    return this.httpRequest.get(this.API_URL+'api/student/exam-list?student_id='+student_id);
  }

  getExamDetail(id:number){
    return this.httpRequest.get(this.API_URL+'api/student/exam-detail/'+id);
  }

  saveExam(params:any,id:any){
    return this.httpRequest.post(this.API_URL+'api/student/exam/'+id,params);
  }

  saveResult(id:any){
    return this.httpRequest.get(this.API_URL+'api/student/saveResult/'+id);
  }

  getResultList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student/result-list',params);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}