import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  storeMarkSheet (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/marksheet/create`, payload);
  }

  updateMarkSheet (id,payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/marksheet/update/${id}`, payload);
  }

  showMarkSheet (id) {
    return this.httpRequest.post(`${this.API_URL}api/result/marksheet/show/${id}`, []);
  }

  deleteMarkSheet (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/marksheet/delete`, payload);
  }

  copyMarkSheet (id,payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/marksheet/copy/${id}`, payload);
  }

  getMarkSheetList () {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet/list`, []);
  }

  getTemplateList (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/academicyearwise/sheet/list`, payload);
  }

  getAcademicYearsList (payload) {
    return this.httpRequest.post(`${this.API_URL}api/filter/get-users-academic-years`, payload);
  }
  
  getTemplateVariables() {
    return this.httpRequest.get(`${this.API_URL}api/result-template/variables`);
  }
  
  getMarksheetBodyTemplates() {
    return this.httpRequest.get(`${this.API_URL}api/result-template/body-templates`);
  }
  
  getTemplatesList(){
    return this.httpRequest.get(this.API_URL+'api/result-template');  
  }

  saveTemplate(params:any,id:any = null) {
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/result-template',params);
    }else{
      return this.httpRequest.post(this.API_URL+'api/result-template/'+id+'?_method=put',params);
    }
  }

  getTemplate(id:any){
    return this.httpRequest.get(this.API_URL+'api/result-template/'+id);  
  }

  deleteTemplate(id:any){
    return this.httpRequest.delete(this.API_URL+'api/result-template/'+id);  
  }

  getAssignMarksheet (id) {
    return this.httpRequest.post(`${this.API_URL}api/assign/mark-sheet/${id}`,[]);  
  }

  storeAssignMarksheet (payload) {
    return this.httpRequest.post(`${this.API_URL}api/assign/mark-sheet/store`,payload);
  }

  getSubjectSetupDetail(params:any){
    return this.httpRequest.post(this.API_URL+'api/result/get-subject-setup-details',params);  
  }

  saveSubjectSetupDetail(params:any){
    return this.httpRequest.post(this.API_URL+'api/result/save-subject-setup-details',params);  
  }



  storeMarksheetResultSection(payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-section/store`,payload);
  }

  getMarksheetResultSection(payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-section/list`,payload);
  }

  showMarksheetResultSection(id,payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-section/show/${id}`,payload);
  }

  updateMarksheetResultSection(payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-section/update/${payload.id}`,payload);
  }

  deleteMarksheetResultSection(id) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-section/delete/${id}`,[]);
  }

  getMarksheetExamSetup (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-exam-setup/list`,payload);
  }

  storeMarksheetExamSetup (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet-exam-setup/store`,payload);
  }

  getSubjectSetupMarkCalculation (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/get-subject-setup-marks-calculation`,payload);
  }

  storeSubjectSetupMarkCalculation (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/get-subject-setup-marks-calculation/store`,payload);
  }

  saveResultSetup(payload){
    return this.httpRequest.post(`${this.API_URL}api/result/result-settings/store`,payload);
  }

  getSelectedSection(id) {
    return this.httpRequest.post(`${this.API_URL}api/result/selected-section/get/${id}`,[]);
  
  }

  storeSelectedSection(payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/selected-section/store`,payload);
  }

  downlaodMarkSheet(url) {
    return this.httpRequest.get(url,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  generateMarksheet (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/generate-result`,payload);
  }

  batchProgress (id) {
    return this.httpRequest.post(`${this.API_URL}api/result/generate-result/batch-progress/${id}`,[]);
  }


  //student attendance
  getStudentList(params:any){
    return this.httpRequest.post(`${this.API_URL}api/student-attendance/student-list`,params);
  }

  saveStudentAttendance(params:any){
    return this.httpRequest.post(`${this.API_URL}api/student-attendance/save`,params);
  }

  getStudentAttendanceDetailList(params:any){
    return this.httpRequest.post(`${this.API_URL}api/student-attendance/list`,params);
  }

  deleteAttendanceDetail(id:any){
    return this.httpRequest.post(`${this.API_URL}api/student-attendance/delete/${id}`,[]);
  }

  getKrupaSidhiGun (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/krupa-siddhi-gun/student-list`,payload);
  }

  storeKrupaSidhiGun (payload) {
    return this.httpRequest.post(`${this.API_URL}api/result/krupa-siddhi-gun/store`,payload);
  }

  getEmployee() {
    return this.httpRequest.post(`${this.API_URL}api/get-employees-list-for-leave`,[]);
  }
  // ----------------------------------------------------------
  // SERIVES FOR STUDENT-WISE-RESULT

  // Section List
  getSectionList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/assign/mark-sheet/get-section-list',payload);
  }
  
  // Class list
  getClassList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/assign/mark-sheet/get-class-list',payload);
  }

  // Batch List
  getBatchList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/assign/mark-sheet/get-batch-list',payload);
  }
  
  getMarkSheetResultList(payload : any){
    return this.httpRequest.post(this.API_URL+'api/assign/mark-sheet/student-pdf-list',payload);
  }
  // ----------------------------------------------------------

  getStudentRemarksList(){
    return this.httpRequest.post(`${this.API_URL}api/result_remark/get`,[]);
  }

  getStudentRemarkOnId(params:any) {
    return this.httpRequest.post(`${this.API_URL}api/result_remark/edit`,params);
  }

  createStudentRemarks(params:any){
    return this.httpRequest.post(`${this.API_URL}api/result_remark/create`,params);
  }

  editStudentRemark (params:any) {
    return this.httpRequest.post(`${this.API_URL}api/result_remark/update`,params);
  }

  deleteStudentRemark (id) {
    return this.httpRequest.post(`${this.API_URL}api/result_remark/delete/${id}`,[]);
  }

  getClassTeacherRemark() {
    return this.httpRequest.post(`${this.API_URL}api/result_remark/list`,[]);
  }
  
  showDefaultGrade(){
    return this.httpRequest.post(`${this.API_URL}api/show-default-grade`,[]);
  }

  importRemarksExcel(payload: any){
    return this.httpRequest.post(this.API_URL+"api/result_remark/import-remark-list", payload);
  }

  exportRemarksExcel(payload: any){
    return this.httpRequest.post(this.API_URL+"api/result_remark/edit/excel", payload , {
      responseType: 'blob',
      observe: 'response',
    });
  }

  publishMarksheet(payload: any){
    return this.httpRequest.post(this.API_URL+"api/assign/published-mark-sheet", payload);
  }

  publishMarksheetManually(payload: any){
    return this.httpRequest.post(this.API_URL+"api/assign/published-mark-sheet-manually", payload);
  }
}
