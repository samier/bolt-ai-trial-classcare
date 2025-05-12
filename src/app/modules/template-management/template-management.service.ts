import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getReportTemplates(payload){
    return this.httpRequest.post(this.API_URL+'api/pdf-template/get-report-templates', payload);
  }

  updateReportTemplates(data:any){
    return this.httpRequest.post(this.API_URL+'api/pdf-template/update-report-templates', data);
  }

  downloadSamplePdf(data:any){
    return this.httpRequest.post(this.API_URL+'api/pdf-template/download-sample-templates', data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });

  }

  //exam report
  getExamReports(params:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/index', params);
  }

  getExamReportById(id:any){
    return this.httpRequest.get(this.API_URL+'api/exam-report/get/'+id);
  }

  storeExamReportDetails(data:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/store', data);
  }

  updateExamReportDetails(data:any, id:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/update/'+id, data);
  }

  deleteExamReport(data:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/delete', data);
  }

  getExamDetails(){
    return this.httpRequest.get(this.API_URL+'api/exam-report/details/'+this.getBranch());
  }

  getSubjectsByClass(data:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/get-subjects', data);
  }

  getExamType(data:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/get-exam-type', data);
  }

  updateOrder(data:any, id:any){
    return this.httpRequest.post(this.API_URL+'api/exam-report/update-order/'+id, data);

  }
}