import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class ExamTypeService {

  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { } 

  getBranchId(){
    return window.localStorage.getItem("branch");
  }

  addRecord(payload:any){
    return this.httpRequest.post(this.API_URL+'api/exam-type',payload);    
  }

  getExamTypeList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/exam-type/list',params);   
  }

  deleteRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/exam-type/delete/'+id, []);    
  }

  getRecord(id:any){
    return this.httpRequest.post(this.API_URL+'api/exam-type/'+id, []); 
  }

  updateRecord(id:any,payload:any){
    return this.httpRequest.put(this.API_URL+'api/exam-type/'+id,payload);    
  }  

  getTemplateList(){
    return this.httpRequest.get(this.API_URL+'api/get-exam-report-template'); 
  }
  
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}