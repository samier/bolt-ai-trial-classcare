import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PollManagementService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  //get current branch
  getBranch() {
    return window.localStorage.getItem("branch");
  }
  //Get Bearer Token
  getBearerToken() {
    return window.localStorage.getItem("token");
  }
  //get class list by branch
  getBranchList() {
    return this.httpRequest.get(this.API_URL+'api/batch/get-batch-list/'+this.getBranch());
  }
  //get academic-year id
  getAcademicYearId() {
    return this.httpRequest.get(this.API_URL+'api/get-academic-yearId/'+this.getBranch());
  }
  //Get current login user-id
  getCurrentLoggedInUserDetails() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+this.getBearerToken()
    });
    const options = { headers: headers };
    return this.httpRequest.post(this.API_URL+'api/me',options);
  }
  //Save and Update poll data
  savePollData(params:any,id:number) {    
    if(id == null) {
      return this.httpRequest.post(this.API_URL+'api/poll/create',params);
    } else {
      return this.httpRequest.post(this.API_URL+'api/poll/update/'+id,params);
    }
  }

  getPollList(params:any){
    Object.assign(params,{branch_id:this.getBranch()});
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/poll/poll_list',params);
  }

  getPollRecord(id:number){
    return this.httpRequest.get(this.API_URL+'api/poll/edit/'+id);
  }

  deletePoll(id:number){
    return this.httpRequest.delete(this.API_URL+'api/poll/delete/'+id);
  }

  pollStatusUpdate(params:any,id:number) {
    return this.httpRequest.post(this.API_URL+'api/poll/updateStatus/'+id,params);
  }

  getPollOptionsList(params:any,id:number) {
    return this.httpRequest.post(this.API_URL+'api/poll/poll_question/'+id,params);
  }

  giveVoteForPoll(params:any,id:number) {
    return this.httpRequest.post(this.API_URL+'api/poll/ans/'+id,params);
  }

  getPollVoteResultShow(params:any,id:number) {
    return this.httpRequest.post(this.API_URL+'api/poll/poll_result/'+id,params);
  }

  getPollVoteResultDetails(params:any,id:number) {
    return this.httpRequest.post(this.API_URL+'api/poll/pollResultDetail/'+id,params);
  }


  getStudentDetailsByToken() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer '+this.getBearerToken()
    });
    const options = { headers: headers };
    return this.httpRequest.post(this.API_URL+'api/student/me',options);
  }
  

  getUserRoll() {
    return window.localStorage.getItem("role");
  }

  getPollStatusStartedStatus(startDate:any, endDate:any, currentDate:any) {
    if (currentDate < startDate) {
      return 0; //not-started
    } else if (currentDate >= startDate && currentDate <= endDate) {
      return 1; //started
    } else {
      return 2; //expired
    }
  }

  //get poll type
  getPollType(poll_type:any) {
    if(poll_type == 0) {
      return 'Default';
    } else if(poll_type == 1) {
      return 'Custom';
    } else {
      return 'Both';
    }
  }

  //get poll for
  getPollFor(poll_for:any) {
    if(poll_for == 0) {
      return 'Student';
    } else if(poll_for == 1) {
      return 'Faculty';
    } else {
      return 'Student and Faculty';
    }
  }

  setStringShorter(stringMaxLength:number, originalString:string) { 
    let shortenedString = originalString.length > stringMaxLength ? originalString.substring(0, stringMaxLength) + '...'
    : originalString;

    return shortenedString;
  }

  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getBatchBySection(sections:any)
  {
    const data = {
      section_id : [sections],
      branchId : this.getBranch(),
    }
    return this.httpRequest.post(this.API_URL+'api/get-batches', data);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
