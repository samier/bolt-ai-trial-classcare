import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class HallTicketService {
  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }

  getBranchId(){
    return window.localStorage.getItem("branch");
  }

  getBatchId(){
    return window.localStorage.getItem("batch_id");
  }

  getAcademicYear(){
    return this.httpRequest.get(this.API_URL+'api/get-academic-year/'+this.getBranchId());
  }

  getBatchList() {
    return this.httpRequest.get(`${this.API_URL}api/batch-list`);
  }

  getExamTypeList() {
    return this.httpRequest.post(`${this.API_URL}api/exams/exam-type/list`,[]);
  }

  getHallTicket() {
    let data = { batch_id: this.getBatchId(), branch_id: this.getBranchId() },
     api_url = this.API_URL+'api/hall-ticket-list';
    return this.httpRequest.post(api_url,data);
  }

  generateHallTicket(payload : any , editID : boolean ) {
    if(editID) return this.httpRequest.post(`${this.API_URL}api/exam-hall-ticket/update-hall-ticket/${editID}`,payload);
    return this.httpRequest.post(`${this.API_URL}api/exam-hall-ticket/generate`,payload);
  }

  getExamOnTypeAndBatch(data) {
    return this.httpRequest.post(`${this.API_URL}api/exam-hall-ticket/get-exam-by-batch-id`,data);
  }

  publishHallTicket(data:any) {
    return this.httpRequest.post( this.API_URL+'api/exam-hall-ticket/hall-ticket-publish' , data );
  }

  updateHallTicket(data, id) {
    let api_url = this.API_URL+'api/exam-hall-ticket/update-student-hall-ticket-status/'+id;
    return this.httpRequest.post(api_url,data);
  }

  getStudentHallTicketList(payload, id: Number) {
    return this.httpRequest.post(`${this.API_URL}api/exam-hall-ticket/hall-ticket-details/${id}`,payload);
  }

  getAHallTicket(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exam-hall-ticket/hall-ticket-list`,payload);
  }

  getAdminHallTicketDetails(data) {
    let api_url = this.API_URL+'api/hall-ticket-list';
    return this.httpRequest.post(api_url, data);
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getFacultyAndPrincipal () {
    return this.httpRequest.post(`${this.API_URL}api/get-faculty-and-principal`,[]);
  }

  updateHallTicketData(){

  }

  getHallTicketById(id: any){
    return this.httpRequest.post(this.API_URL+"api/exam-hall-ticket/edit-hall-ticket", {id : id});
  }

  deleteHallTicket(id:any){
    return this.httpRequest.post(`${this.API_URL}api/exam-hall-ticket/delete-hall-ticket/${id}`,{})
  }
  
  /**
   *
   * @param sid student id
   * @param hid hall ticket id
   * @returns
   */
  downloadHallTicket(payload, id) {
    return this.httpRequest.post(`${this.API_URL}api/hall-ticket-download`, payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}
