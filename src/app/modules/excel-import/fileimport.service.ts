import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class FileimportService {
  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }
  getBranchId(){
      return window.localStorage.getItem("branch");
  }
  
  getClassList(){
    return this.httpRequest.get(this.API_URL+'api/class-list-for-import/'+this.getBranchId());
  }
  getBatchList(class_id:any){
    return this.httpRequest.get(this.API_URL+'api/lesson/subject-and-batch-list-by-class-id/'+class_id);
  }  
  submitFile(param:any){
    return this.httpRequest.post(this.API_URL+'api/import/import-file',param);
  }   
  submitFeeTypeFile(type, param: any) {
    return this.httpRequest.post(this.API_URL + 'api/' + type + '/import-file', param);
  }   
  
  getExport(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/download-sample/',params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getStudentImportSample(){
    return this.httpRequest.post(this.API_URL+'api/import/download-sample',[],{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  
  getAcademicYearList(){
    return this.httpRequest.post(this.API_URL+'api/fees/get-acadmic-year-list',{});
  }

  getBatchListByAcademicYearId(param:any){
    return this.httpRequest.post(this.API_URL+'api/fees/get-batch-list',param);
  }

  importFeeFile(param:any){
    return this.httpRequest.post(this.API_URL+'api/fees/import-file',param);
  } 

  getUserExcelSample(){
    return this.httpRequest.post(this.API_URL+'api/sample/import/user/download',{},{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  
  importUsersExcel(payload: any){
    return this.httpRequest.post(this.API_URL+"api/import/user", payload);
  }
}
