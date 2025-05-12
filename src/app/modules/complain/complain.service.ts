import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class ComplainService {

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  branchID : any = window.localStorage.getItem('branch');
  userID   : any = window.localStorage.getItem('user_id');
  currentYearID: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  constructor(
    private httpRequest : HttpClient
  ) { }

  // LIST COMPLAIN
  complainList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/complain/index',payload)
  }

  deleteComplain( complainID : number ){
    return this.httpRequest.post(`${this.API_URL}api/complain/delete/${complainID}`,{})
  }

  // ADD/EDIT COMPLAIN

  getComplainDetails(id:number){
    return this.httpRequest.post(`${this.API_URL}api/complain/show/${id}`,{})
  }

  updateStatus(rowID:any,payload:any){
    return this.httpRequest.post(`${this.API_URL}api/complain/update-status/${rowID}`,payload)
  }

  addComplain(payload,id){
    if(id){
      return this.httpRequest.post( `${this.API_URL}api/complain/update/${id}`, payload )
    }
    return this.httpRequest.post(`${this.API_URL}api/complain/store`,payload)
  }

  //---------------------------- THREAD COMPONENT -----------------------------

  // TO ADD THREAD MESSAGE
  addThreadMessage(payload:any,threadID:any){
    return this.httpRequest.post(`${this.API_URL}api/complain/send-comment/${threadID}`,payload)
  }
  
  // THREAD MESSAGE LIST
  threadList(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/complain/comment-list/${payload}`,payload)
  }


  //---------------------------- FETCHING DROPDOWN -----------------------------
  // SECTION LIST 
  fetchSection(){
    const payload = { branch: this.branchID }
    return this.httpRequest.post(this.API_URL+'api/section/list',payload);
  }

  // CLASS LIST
  fetchClass(payload:any){
    // URL :- "api/class-list/1?user_id=''&section_id=''"

    let url = `${this.API_URL}api/class-list/${this.branchID}` ;
    
    if(payload?.userID){
      url+="?user_id="+payload?.userID;
    }
    if(payload?.sectionID){
      url+="&section_id="+payload?.sectionID;
    }
    return this.httpRequest.get(url); 
  }

  // BATCH LIST 
  fetchBatch(payload:any){
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',payload); 
  }

  // STUDENT LIST 
  fetchStudent(payload:any){
    return this.httpRequest.post(this.API_URL+'api/get-students-by-batch',payload);
  }

  // Employee LIST 
  fetchEmployeeList(payload:any){
    return this.httpRequest.post( this.API_URL+"api/get-employees-list-for-web",payload);
  }
  
  // SCROLL WISE STUDENT LIST
  getAllStudent(){
    return this.httpRequest.get(`${this.API_URL}api/get-student-list/${this.branchID}`);
  }

  fetchEmployees(){
    return this.httpRequest.post(this.API_URL+'api/user/user-list',{})
  }

  // FETCH EACH COMPLAIN DETAILS
  fetchComplainDetail(viewID:any){
    return this.httpRequest.post(`${this.API_URL}api/complain/show/${viewID}`,{})
  }
  
}
