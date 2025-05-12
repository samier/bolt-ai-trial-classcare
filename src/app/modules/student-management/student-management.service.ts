import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class StudentManagementService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getClassList(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-section-and-classes', data);
  }

  getStudentTableAllFieldList(){
    return this.httpRequest.get(this.API_URL+'api/student/get-field-list-bulk-edit');
  }

  generateStudentGrReport(params:object){
    return this.httpRequest.post(this.API_URL+'api/student/get-student-list-by-batch-id/'+this.getBranch(), params);
  }

  getBatchesByClass(classes:any){
    const data = {
      classes : [classes],
      branchId : this.getBranch()
    }
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes', data);
  }

  studentBulkEdit(params:any){
    return this.httpRequest.post(this.API_URL+'api/student/student-bulk-edit', params);
  }
}
