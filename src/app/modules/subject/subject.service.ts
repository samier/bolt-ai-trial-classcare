import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class subjectService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getSubjects(data:any){
    return this.httpRequest.post(this.API_URL+'api/class/get-subjects',data);
  }

  updateOrder(data:any){
    return this.httpRequest.post(this.API_URL+'api/class/update-order',data);
  }

  getSubjectList(){
    return this.httpRequest.post(this.API_URL+'api/subject/group/list',[])
  }

  getSubjectonId(subjectId: any){
    return this.httpRequest.post(`${this.API_URL}api/subject/get-subject/${subjectId}`,[])
  }
  
  addSubject(subject: any){
    return this.httpRequest.post(this.API_URL+'api/subject/add-subject', subject);
  }

  updateSubject(subject: any,subjectId:any){
    return this.httpRequest.post(this.API_URL+'api/subject/update-subject/'+subjectId, subject);
  }

  deleteSubject(subject: any){
    return this.httpRequest.post(this.API_URL+'api/subject/delete-subject/'+subject.id,subject);
  }
}
