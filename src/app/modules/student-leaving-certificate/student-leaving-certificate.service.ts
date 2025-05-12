import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';
import * as moment from 'moment';
import { DateFormatService } from 'src/app/service/date-format.service';

@Injectable({
  providedIn: 'root'
})
export class StudentLeavingCertificateService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient, private _dateFormatService : DateFormatService) { }

  //Get branch id
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  //Get branch id
  getBranchDetail(){
    return this.httpRequest.get(this.API_URL+'api/get-branch-detail/'+this.getBranch());
  }

  getClassList(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/fees/get-classes',data);
  }

  getClassesList(params?:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/class-list-by-section',params);
  }

  //Get Batch by class_id and branch_id
  getBatchesListByClassId(class_id:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/batch-list/'+this.getBranch()+"/"+class_id, []);
  }

  //Get students list by batch_id
  getStudentListByClassId(batch_id:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/student-list-by-batch-id/'+batch_id, []);
  }

  //Get students list by batch_id
  getStudentDetailsByStudentId(student_id:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/student-details-by-student-id/'+student_id, this.getBranch());
  }

  //Get students list by batch_id
  addStudentToLeavingCertificate(params:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/?_method=put',params);
  }

  getStudentList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student-leaving-certificate/datatable',params);
  }

  studentLCListDownload(data:any, format:any){
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/datatable/'+format, data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getAcademicYearIdName() {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/get-academic-year-id-name-list/'+this.getBranch());
  }

  removeLc(id:number) {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/remove-leaving-certificate/'+id);
  }

  updateLCStatus(student_id:any, params:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/update-lc-status/'+student_id, params);
  }

  editLeavingCertificate(id:any) {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/student-lc-detail/'+id);
  }

  //Get inactive students list by batch_id
  getInActiveStudentListByBatch(batch_id:any) {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/inactive-student-list-by-batch/'+batch_id);
  }

  //Update students LC details
  updateStudentLcDetail(id:any, params:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/lc-detail-update/'+id,params);
  }

  //Get section list by branch
  getSectionListByBranch() {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/section-list-by-branch/'+this.getBranch());
  }


  //categories: 1=Open,2=OBC,3=SC,4=ST,5=S.E.B.C,6=LAGUMATI,7=Bhill S.T,8=Other
  getCategoryName(id:any) {
    var category:any = null;
    if(id == 1) {
      category = "Open";
    } else if(id == 2) {
      category = "OBC";
    } else if(id == 3) {
      category = "SC";
    } else if(id == 4) {
      category = "ST";
    } else if(id == 5) {
      category = "SEBC";
    } else if(id == 6) {
      category = "LAGUMATI";
    } else if(id == 7) {
      category = "Bhill ST";
    } else if(id == 8) {
      category = "Other";
    }

    return category;
  }

  //Get date in well formed
  getDateFormat(date:any) {
    var well_date = moment(date).format(this._dateFormatService.getFormat());
    return well_date;
  }

  view(student_id:any) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/getPdf/'+student_id, this.getBranch,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getpdfHtml(student_id:any,params:any = null) {
    return this.httpRequest.post(this.API_URL+'api/student-leaving-certificate/getPdf/'+student_id, params);
  }

  getStudentDetails (payload) {
    return this.httpRequest.post(`${this.API_URL}api/student-leaving-certificate/get-student-details`,payload)
  }

  deleteAttachment(id:any){
    return this.httpRequest.post(`${this.API_URL}api/student-leaving-certificate/delete-lc-attachment/`+id, [])

  }

  getLcAttachment(params:any){
    return this.httpRequest.post(`${this.API_URL}api/student-leaving-certificate/get-lc-attachment`, params)
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
