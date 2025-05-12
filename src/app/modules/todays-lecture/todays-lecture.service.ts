import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TodaysLectureService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  public branch_id = window.localStorage?.getItem("branch");

  getList()
  {
    return this.httpRequest.post(this.API_URL+'api/today-lecture/list', {});
  }

  getTodaysLectureById(id:any)
  {
    return this.httpRequest.get(this.API_URL+'api/today-lecture/edit/'+id);
  }

  deleteTodaysLecture(id:any)
  {
    return this.httpRequest.delete(this.API_URL+'api/today-lecture/delete/'+id);
  }

  cancelLecture(id:any)
  {
    return this.httpRequest.post(this.API_URL+'api/today-lecture/statusUpdate/'+id,{});
  }

  getAllFaculty(){
    return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.branch_id);
  } 
  
  updateTodaysLecture(id:any,data:any)
  {
    return this.httpRequest.post(this.API_URL+'api/today-lecture/update/'+id,data); 
  }
}
