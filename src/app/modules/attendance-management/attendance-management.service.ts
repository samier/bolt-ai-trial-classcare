import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class AttendanceManagementService {

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;

  constructor(private httpRequest: HttpClient) { }

  //Get branch id
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  generateStudentDailyReport(params:any) {
    return this.httpRequest.post(this.API_URL+'api/student-daily-attendance-report/generate',params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+url;
  }

  goToViewAttendanceReportPage() {
    window.location.href = this.setsymfonyUrl(this.getBranch()+'/report/viewattendance');
  }

  getDailyAttendanceReportList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student-daily-attendance-report/datatable',params);
  }

  // Section list
  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }
  // Class List 
  getClassList(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }

  // Batch List
  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  attendanceReport(data:any){
    return this.httpRequest.post(this.API_URL+'api/student-attendance/blank-attendance-report', data);
  }

  getExport(params:any,format:string){
    return this.httpRequest.post(this.API_URL+'api/student-attendance/blank-attendance-report/'+format,params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  // to get the Attendance 
  getAttendance(payload:any){
    return this.httpRequest.post(this.API_URL+'api/quick-attendance/get-list',payload)
  }
  
  saveAttendance(payLoad : any){
    return this.httpRequest.post(this.API_URL+'api/quick-attendance/update-attendance',payLoad)
  }

  getBatchWiseAttendance(payload: any){
    return this.httpRequest.post(this.API_URL+`api/attendance/batch-attendance-report/${this.getBranch()}`, payload)
  }

  getAttendanceReport(payload: any ){
    return this.httpRequest.post(this.API_URL+'api/attendance/view-attendance',payload,{
      responseType: 'text'  // Important: Expecting HTML response
    })
  }

  getAttendanceReportPdf(payload: any, format:string ){
    return this.httpRequest.post(this.API_URL+'api/attendance/view-attendance/'+format,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    })
  }

}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
