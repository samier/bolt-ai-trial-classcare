import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {enviroment} from 'src/environments/environment.staging';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private API_URL = enviroment.apiUrl;
  private symfonyHost = enviroment.symfonyHost;
  private student = new BehaviorSubject<any>(null);

  constructor(private httpRequest: HttpClient) {}

  getBranchId() {
    return window.localStorage.getItem("branch");
  }

  // Adacamic List
  getAcadamicYearList(param: any) {
    return this.httpRequest.post(this.API_URL + 'api/global-search/get-academic-year', param);
  }

  // classList
  getClassList(param: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/class/list', param);
  }

  // batchList
  getBatchList(param: any) {
    return this.httpRequest.post(this.API_URL + 'api/batch-list', param);
  }

  getlastSchool(param: any) {
    return this.httpRequest.post(this.API_URL + 'api/old-school/school-list', param);
  }

  getStudentsList(param: any) {
    return this.httpRequest.post(this.API_URL + 'api/student-list', param);
  }

  addStudent(param): any {
    return this.httpRequest.post(this.API_URL + 'api/student/create', param);
  }

  getStudentDetail(id: any) {
    return this.httpRequest.post(this.API_URL + 'api/student/edit/' + id, {});
  }

  updateStudent(id: any, payload: any): any {
    return this.httpRequest.post(this.API_URL + 'api/student/update/' + id, payload);
  }
  
  downloadStudentFullBasicReport(id: any, payload: any) {
    return this.httpRequest.post(`${this.API_URL}api/student/studentFullDetail/${id}`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  // downloadStudentBasicReport(id: any): any {
  //   return this.httpRequest.get(this.symfonyHost+this.getBranchId()+'/students/studentFullDetail/' + id + '/1',{
  //     observe: 'response',
  //     responseType: 'blob' as 'json'
  //   });
  // }

  studentIdGeneration(param: any,zip: boolean = false): any {
    return this.httpRequest.post(this.API_URL+'api/generate-student-id-card'+ ( zip ? '/zip' : '' ) , param, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deleteStudent(id: any, param: any): any {
    return this.httpRequest.post(this.symfonyHost+this.getBranchId()+'/students/delete/' + id, param);
  }

  uploadProfilePicture(param): any {
    return this.httpRequest.post(this.API_URL + 'api/student/upload-profile-picture', param);
  }

  setStudent(data: any): void {
    this.student.next(data);
  }

  getStudent(): Observable<any> {
    return this.student.asObservable();
  }

  getPdfAndExcel(payload,format) {
    return this.httpRequest.post(`${this.API_URL}api/student/student-detail/${format}`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getExcel(payload){
    return this.httpRequest.post(`${this.API_URL}api/machine-attendance/get-users-students`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  printData(payload,format) {
    return this.httpRequest.post(`${this.API_URL}api/student/print-student-data/${format}`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  bulkDelete(param: any): any {
    return this.httpRequest.post(this.API_URL + 'api/student/bulk-delete', param);
  }

  sendAdmissionSms(param: any): any {
    return this.httpRequest.post(this.API_URL + 'api/student/send-admission-sms', param);
  }
  
  getClass(payload:any){
    const params = this.createParams(payload);
    return this.httpRequest.get(this.API_URL+'api/class-list/'+ payload.branch_id,{params});
  }

  getBatch(payload:any) {
    const params = this.createParams(payload);
    return this.httpRequest.get(this.API_URL + 'api/batch-list', {params});
  }

  createParams(payload) {
    let params = new HttpParams();
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        params = params.set(key, payload[key]);
      }
    }
    return params
  }

  getSchoolDetails(){
    return this.httpRequest.get(this.API_URL + 'api/old-school/category-type-and-admission-year');
  }
  getOldSchoolName(){
    return this.httpRequest.post(this.API_URL + 'api/old-school/index',{});
  }
  studentCreate(payload:any,id:any){

    if(id){
      return this.httpRequest.post(this.API_URL + `api/student/update/${id}`, payload);
    }
    else{
      return this.httpRequest.post(this.API_URL + 'api/student/create', payload);
    }
  }
  createUpdate( id:number , name:any ){
    if(id){
      return this.httpRequest.put(this.API_URL + `api/old-school/update/${id}`, { name : name } );
    }
    else{
      return this.httpRequest.post(this.API_URL + 'api/old-school/create', { name : name } );
    }
  }
  deleteField(id:number){
    return this.httpRequest.post(this.API_URL + `api/old-school/delete/${id}`,{});
  }
  deleteArea(id:number){
    return this.httpRequest.post(this.API_URL + `api/area/delete/${id}`,{});
  }

  getStudentDetails(id:number){
    return this.httpRequest.post(this.API_URL + `api/student/edit/${id}`,{ branch_id: this.getBranchId() } );
  }

  getInquiryStudentData(id) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/view/${id}`,{});
  }
  
  boysGirlsCountPdf(payload,format) {
    return this.httpRequest.post(`${this.API_URL}api/student/boys-girls-count/${format}`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getAreaList(data:any){
    return this.httpRequest.post(this.API_URL+'api/area/list',data);
  }

  createUpdateArea( id:number , name:any ){
    if(id){
      return this.httpRequest.post(this.API_URL + `api/area/update/${id}`, { name : name } );
    }
    else{
      return this.httpRequest.post(this.API_URL + 'api/area/store', { name : name } );
    }
  }
  
  // Section List
  fetchSectionList(sections:any){
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  // Class list
  fetchClassList(payload:any,id:number){
    let url = this.API_URL+'api/class-list/'+ window.localStorage.getItem('branch') ;
    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    if(payload?.section){
      url+="&section_id="+payload?.section;
    }
    return this.httpRequest.get(url);
  }

  // BatchList
  fetchBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  getBranch(){
    return window.localStorage.getItem("branch");
  }
  
  getStudentAttendance(payload:any){
    return this.httpRequest.post(this.API_URL + 'api/attendance/student-list-single-attendance', payload);
  }

  saveOrUpdateAtt(payload:any){
    return this.httpRequest.post(this.API_URL + 'api/attendance/take-single-attendance', payload);
  }

  // STUDENT DETAILS PAGE

  // FOR STUDENT LAYOUT
  fetchStudentDetails(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/get-student-detail`,payload)
  }


  // FOR STUDENT PROFILE TAB
  fetStudentProfile(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/student/view-student-profile-details`,payload)
  }

  // TO SAVE STUDENT BANK DETAILS 
  saveBankDetail(paylaod:any,uniqueID:any){
    return this.httpRequest.post(`${this.API_URL}api/student/store-student-bank-details/${uniqueID}`,paylaod)
  }

  // FETCH THE STUDENT BANK DETAILS
  fetchBankDetail(uniqueID:any){
    return this.httpRequest.get(`${this.API_URL}api/student/view-student-bank-details/${uniqueID}`)
  }

  // GET ACADEMICS YEAR LIST
  getAcademicYear(payload :any){
    return this.httpRequest.post(`${this.API_URL}api/filter/get-users-academic-years`,payload)
  }
  // DOCUMENT ADD
  documentAdd(formData:FormData){
    return this.httpRequest.post(`${this.API_URL}api/student/upload-student-document`,formData);
  }

  // DOCUMENT LIST 
  getDocumentList(uniqueID:any){
    return this.httpRequest.get(`${this.API_URL}api/student/view-student-documents/${uniqueID}`,);
  }

  // DELETE DOCUMENT
  deleteDocument(id:number){
    return this.httpRequest.delete(`${this.API_URL}api/student/delete-student-document/${id}`);
  }

  studentFieldSettingData(){
    return this.httpRequest.post(this.API_URL+'api/student/field_setting',{});
  }
  
  getEventList(payload:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/get-student-profile-event-list`,payload);
  }

}
