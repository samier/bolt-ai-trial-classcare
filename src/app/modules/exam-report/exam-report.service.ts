import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class ExamReportService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  //Get branch id
  getBranch() {
    return window.localStorage.getItem("branch");
  }


  getClassList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/class/list', params);
  }

  getBatchList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/batch/list', params);
  }

  getExamTypeList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/exam-type/list', params);
  }

  getTemplateList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/template', params);
  }

  //Generate exam report card by admin
  generateExamReportCard(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/result/template', params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  publishExamReportCard(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/publish', params);
  }

  getExamTypeListForStudent(id: number) {
    return this.httpRequest.get(this.API_URL + 'api/exam-report/exam-type-student/list/' + id);
  }

  //Generate exam report card by student
  generateExamReportCardForStudent(params: any, studentId: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/result-student/template/' + studentId, params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getExamTypeListForFaculty(params: any, id: number) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/exam-type-faculty/list/' + id, params);
  }

  //Generate exam report card by faculty
  generateExamReportCardForFaculty(params: any, facultyId: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/result-faculty/template/' + facultyId, params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getData(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/result/template', params);
  }


  getTemplateName(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/result/template-name', data);
  }

  getStudentMarks(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/get-student-marks', data);
  }

  getStudentMarksForReport(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/get-student-marks', data, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  updateStudentMarks(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/update-student-marks', data);
  }

  getStudents(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/get-students', data);
  }

  addGraceMarks(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/add-grace-marks', data);
  }
  updateExamReport(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/update-exam-report', data);
  }

  getPublishedResult(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/publish/list', data);
  }

  deletePublishedResult(id: any) {
    return this.httpRequest.post(this.API_URL + 'api/exam-report/publish/delete/' + id, []);
  }
}
