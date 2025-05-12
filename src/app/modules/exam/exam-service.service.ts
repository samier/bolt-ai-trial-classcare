import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ExamServiceService {

  private API_URL = enviroment.apiUrl;
  academicYear : any = ('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0];
  singleExamData


  constructor(private httpRequest: HttpClient) { }

  //get current branch
  getBranch() {
    return window.localStorage.getItem("branch");
  }

  //get class list by branch
  getClassesList() {
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+this.getBranch());
  }

  //save exam-grade data
  saveExamGrade(params:any,id:number){
    Object.assign(params,{branchId:this.getBranch()});
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/exam-grade/store',params);
    }else{
      return this.httpRequest.post(this.API_URL+'api/exam-grade/'+id+'?_method=put',params);
    }
  }

  getExamGradeList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/exam-grade-list',params);
  }

  getExamGradeDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/exam-grade/show/'+id, []);
  }
  
  deleteExamGrade(id:number){
    return this.httpRequest.post(this.API_URL+'api/exam-grade/delete/'+id,[]);
  }


  //bulk marks edit
  getSections(params:any){
    let data = {
      section_id : params.section,
      class_id : params.class,
      batch_id : params.batch,
      exam_type : params.exam_type
    };
    return this.httpRequest.post(this.API_URL+'api/exam-marks/get-section', data);
  }

  getStudentMarks(params:any){
    return this.httpRequest.post(this.API_URL+'api/exam-marks/get-student-marks', params);
  }

  bulkUpdateMarks(data:any){
    return this.httpRequest.post(this.API_URL+'api/exam-marks/bulk-marks-edit', data);

  }

  getSubjectOnClass(payload) {
    // payload.academicYear = this.academicYear
    // payload.branchId = this.getBranch()
    return this.httpRequest.post(this.API_URL+'api/exam-report/get-subjects', payload);
  }

  getSubjectOnbatch(payload) {
    return this.httpRequest.post(`${this.API_URL}api/notes/subject`, payload);
  }

  getStudentOnBatch(payload) {
    payload.branchId = this.getBranch()
    return this.httpRequest.post(this.API_URL + 'api/get-students-by-batches', payload);
  }

  createExam(payload) {
    return this.httpRequest.post(this.API_URL + 'api/exams/create', payload);
  }

  editExam(payload,id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/update/${id}`, payload);
  }

  getGradeList(payload) {
    return this.httpRequest.post(this.API_URL + 'api/exams/grade/list', payload);
  }

  getExamList(payload){
    return this.httpRequest.post(this.API_URL + 'api/exams/list', payload);
  }

  getExamTypeList(){
    return this.httpRequest.post(this.API_URL + 'api/exams/exam-type/list ',[]);
  }

  deleteExam(id) {
    return this.httpRequest.delete(`${this.API_URL}api/exams/delete/${id}`);
  }

  getExamOnId(id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/show/${id}`,[]);
  }

  getBatchAndSubjectWiseExamData(id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/show/batch-wise-subject-exam/${id}`,[]);
  }

  getStudentOnAttendence(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/subject-exam/student/attendance/list`,payload);
  }

  examStatusUpdate(payload,id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/update/status/${id}`,payload);
  }

  storeStudentAttendence(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/subject-exam/student/attendance/store`,payload);
  }

  getStudentOnMark(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/fill-marks/list`,payload);
  }

  getGradeListOnId(id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/get-grade-details/${id}`,[]);
  }

  markStore(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/fill-marks/store`,payload);
  }

  publishSingleSubjectExamMarks(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/subject-exam/publish/result`,payload);
  }
  
  publishMultipleSubjectExamMarks(payload){
    return this.httpRequest.post(`${this.API_URL}api/exams/multiple/subject-exam/publish/result`,payload);
  }

  getNotification() {
    return this.httpRequest.get(`${this.API_URL}api/get-branch-notification/${this.getBranch()}`);
  }

  getStudentPdfAndExcel(value,payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/export-marks-list/${value}`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  downloadPdfAndExcel (payload,type) {
    return this.httpRequest.post(`${this.API_URL}api/exams/export-marks-list/batch-wise/${type}`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  getStudentExamList(payload) {
    return this.httpRequest.post(`${this.API_URL}api/student/get-exam-list`,payload);
  }

  getBlankExamSheet (payload) {
    return this.httpRequest.post(`${this.API_URL}api/student/blank-exam-sheet`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  saveExam (payload,id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/date-time/update/${id}`,payload);
  }

  publishAllExam (payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/subject-exam/publish/multiple-result`,payload);
  }

  studentMarkVisible(payload,id) {
    return this.httpRequest.post(`${this.API_URL}api/exams/status-update/${id}`,payload);
  }

  getSectionFilterList(payload) {
    return this.httpRequest.post(`${this.API_URL}api/section/list`, payload);
  }

  getClassFilterList(payload) {
    let url = this.API_URL + 'api/class-list/' + this.getBranch();
    if (payload?.user_id) {
      url += "?user_id=" + payload?.user_id;
    }
    if (payload?.section_id) {
      url += "&section_id=" + payload?.section_id;
    }
    return this.httpRequest.get(url);
    // return this.httpRequest.post(`${this.API_URL}api/filter/get-classes`,payload);
  }

  getPdfAndExcelExamReport(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/download-exam-report/${payload.download_type}`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  getExamNameOnBatch(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/class-wise-exam`, payload);
  }

  gradeMarkAsDefault (payload) {
    return this.httpRequest.post(`${this.API_URL}api/grade/select-is-default`, payload);
  }

  gradeRemoveAsDefault (payload) {
    return this.httpRequest.post(`${this.API_URL}api/grade/unselect-is-default`, payload);
  }

  exportMarks(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/export-marks`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
}

  importMarks (payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/import-marks`, payload);
  }

  importedMarksList(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/exams/imported-marks-list`, payload);
  }

  importedMarksLogs(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/exams/imported-marks-logs`, payload);
  }

  getMultipleClassOnSubject(payload) {
    return this.httpRequest.post(`${this.API_URL}api/multiple/exams/subject/list`, payload);
  }

  getStudentRankList(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/top-ten-student-list`, payload);
  }

  getStudentRankListPdfExcel(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/top-ten-student-list`, payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  getStudentRankDrpData(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/top-ten-student-list/dropdown`, payload);
  }

  getStudentRankListByType(payload: any) {
    return this.httpRequest.post(`${this.API_URL}api/exams/get/${payload.type}/report/exam-list`, payload);
  }

  getFilteredExamList(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/exams/get/filtered/exam-list`, payload);
  }

  downloadStudentRankList(payload){
    return this.httpRequest.post(`${this.API_URL}api/exams/get/${payload.type}/report/exam-list/${payload.format}`, payload,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }  
  createMultipleExam(payload) {
    return this.httpRequest.post(`${this.API_URL}api/exams/multiple-exam-create`, payload);
  }

  /**
   * 
   * @param value : Date
   * @param type = 1 : date, 2 : time 
   * @returns 
   */
    dateFormate(value: string, type: number): string {
      if (type == 1) {
        return moment(value, 'YYYY-MM-DD').format('DD-MM-YYYY')
      } else if (type == 2) {
        return moment(value, 'HH:mm').format("hh:mm:ss A")
      } else if (type == 3) {
        return moment(value, 'DD-MM-YYYY hh:mm:ss A').format('YYYY-MM-DD')
      } else if (type == 4) {
        return moment(value, 'DD-MM-YYYY hh:mm:ss A').format('HH:mm')
      } else if (type == 5) {
        return moment(value, 'DD-MM-YYYY hh:mm:ss A').format('DD-MM-YYYY')
      } else {
        return value
      }
    }
}


class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
