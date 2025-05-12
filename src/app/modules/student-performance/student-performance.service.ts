import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class StudentPerformanceService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  //performance category
  listAllPerformanceCategory(){
    return this.httpRequest.post(this.API_URL+'api/performance/list-all-category',null);
  }

  listPerformanceCategory(params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/list-category', params);
  }

  getPerformanceCategory(params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/get-category/'+params, null);
  }

  createPerformanceCategory(data:any){
    return this.httpRequest.post(this.API_URL+'api/performance/create-category', data);
  }

  updatePerformanceCategory(data:any, params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/update-category/'+params, data);
  }

  deletePerformanceCategory(params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/delete-category/'+params, null);
  }

  //performance criteria

  listPerformanceCriteria(params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/list-criteria', params);
  }

  getPerformanceCriteria(params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/get-criteria/'+params, null);
  }

  createPerformanceCriteria(data:any){
    return this.httpRequest.post(this.API_URL+'api/performance/create-criteria', data);
  }

  updatePerformanceCriteria(data:any, params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/update-criteria/'+params, data);
  }

  deletePerformanceCriteria(params:any){
    return this.httpRequest.post(this.API_URL+'api/performance/delete-criteria/'+params, null);
  }

  
  //student performance 
  getFilters(params:any){
    let data = {
      section_id : params.section,
      class_id : params.class,
      batch_id : params.batch,
      exam_type : params.exam_type,
      criteria : params.performance_criteria
    };
    return this.httpRequest.post(this.API_URL+'api/performance/get-filters', data);
  }

  getStudents(data:any){
    return this.httpRequest.post(this.API_URL+'api/performance/get-students', data);
  }

  studentPerformance(data:any){
    return this.httpRequest.post(this.API_URL+'api/performance/student-performance', data);

  }
}
