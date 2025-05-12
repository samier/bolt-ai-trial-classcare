import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TransportSmsService {

  constructor(private httpRequest:HttpClient) { }
  private API_URL = enviroment.apiUrl;
  public branch_id = window.localStorage?.getItem("branch");
  getRouteList(){
    return this.httpRequest.post(this.API_URL+'api/route-list',{});    
  }  
  
  getStopList(param:any){
    return this.httpRequest.post(this.API_URL+'api/stop-list-by-route-id',param);    
  }    

  getStudentList(param:any){
    return this.httpRequest.post(this.API_URL+'api/sms/student-list',param);    
  }  
  
  getStudentNumbers(param:any){
    return this.httpRequest.post(this.API_URL+'api/sms/get-student-numbers',param);    
  }     

  addRecord(param:any){
    return this.httpRequest.post(this.API_URL+'api/message/send-tranport-sms',param); 
  }
  // deleteLeaveTypeRecord(id:any){
  //   return this.httpRequest.delete(this.API_URL+'api/teacher-diary/'+id);
  // }
  // whasup-history

  getSMSTemplate(payload) {
    return this.httpRequest.post(this.API_URL+'api/get-sms-templates',payload); 
  }

  notification() {
    return this.httpRequest.get(this.API_URL+`api/get-branch-notification/${this.branch_id}`);
  }
}


class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}

