import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExamTimetableService {

  constructor(private httpRequest:HttpClient) { }
  private API_URL = enviroment.apiUrl;
  public branch_id = window.localStorage?.getItem("branch");

  getExamTypeList(){
    return this.httpRequest.post(this.API_URL+'api/exam-timetable/exam-type-list',{});    
  } 

  getClassList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/exam-timetable/class-list',payload); 
  }

  generateTimeTable(payload:any){
    return this.httpRequest.post(this.API_URL+'api/exam-timetable/generate-timetable',payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    }); 
  }
  generateTimeTableExcel(payload:any){
    return this.httpRequest.post(this.API_URL+'api/exam-timetable/generate-timetable-excel',payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  // generateTimeTableExcel(payload:any){
  //   return this.httpRequest.post(this.API_URL+'api/exam-timetable/generate-timetable-excel',payload,{
  //     observe: 'response',
  //     responseType: 'blob' as 'json'
  //   });
  // }
}
