import { param } from 'jquery';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest:HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getBatchTransferStudentList(data:any){
    return this.httpRequest.post(`${this.API_URL}api/batch-transfer-student-list`,data);
  }

  batchTransfer(data:any) {
    return this.httpRequest.post(`${this.API_URL}api/batch-transfer`,data);
  }

  getBatchTransferList (params:any) {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/batch-transfer-datatable',params);
  }

  getBatchTransferLog (params:any) {
    return this.httpRequest.post<DataTablesResponse>(`${this.API_URL}api/batch-transfer-log`,params);
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getClasses(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }

  getBatchesByClass(classes:any){
    const data = {
      classes : Array.isArray(classes) ? classes : [classes],
      branchId : this.getBranch()
    }
    return this.httpRequest.post(this.API_URL+'api/filter/get-batches', data);
  }

  getSectionList()
  {
    return this.httpRequest.get(this.API_URL+'api/lesson/section-list/'+this.getBranch());
  }

  getList(payload)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL + 'api/get-student-list', payload);
  }

  updateRollNumbers(payload)
  {
    return this.httpRequest.post(this.API_URL + 'api/auto-update-roll-no',payload);
  }

  saveRollNo(payload)
  {
    return this.httpRequest.post(this.API_URL + 'api/save-roll-no', payload);
  }

  getClassList()
  {
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+this.getBranch());
  }

  getClassTeacherList() {
    return this.httpRequest.post(`${this.API_URL}api/batch/get-class-teacher`,[]);
  }

  getBatchData(payload){
    return this.httpRequest.post(`${this.API_URL}api/batch/get`,payload);
  }

  createBatch (payload) {
    return this.httpRequest.post(`${this.API_URL}api/batch/create`,payload);
  }

  updateBatch (payload, id) {
    return this.httpRequest.post(`${this.API_URL}api/batch/batch-update/${id}`,payload);
  }

  deleteBatch (id) {
    return this.httpRequest.post(`${this.API_URL}api/batch/delete/${id}`,[]);
  }

  getSortedBatch(){
    return this.httpRequest.post(`${this.API_URL}api/batch/get-sorted-batch`, [])
  }

  updateBatchOrder(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/batch/sort`, payload);
  }

  getUserWiseSectionList(user_id:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/section-list',user_id);
  }

  getClassWiseSubject(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/batch/get-class-wise-subject`, payload);
  }

  getStudentOnBatch(id){
    return this.httpRequest.post(`${this.API_URL}api/batch/get-batch-wise-student/${id}`,[]);
  }

  updateBatchStudent(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/batch/update-batch-wise-student`, payload);
  }

}


class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
