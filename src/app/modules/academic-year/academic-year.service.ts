import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class AcademicYearService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest:HttpClient) { }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getYearTransferStudentList(params:any){
    return this.httpRequest.post(`${this.API_URL}api/academic-year/year-transfer-student-list`,params);
  }

  yearTransfer(params:any){
    return this.httpRequest.post(`${this.API_URL}api/academic-year/year-transfer`,params);
  }

  getYearTransferList (params:any) {
    return this.httpRequest.post(this.API_URL+'api/academic-year/year-transfer-datatable',params);
  }

  getYearTransferLog (params:any) {
    return this.httpRequest.post(`${this.API_URL}api/academic-year/year-transfer-log`,params);
  }

  storeOrUpdateAcademicYear(payload,id) {
    if(id){
      return this.httpRequest.post(`${this.API_URL}api/academic-year/${id}?_method=put`,payload);
    }else{
      return this.httpRequest.post(`${this.API_URL}api/academic-year`,payload);
    }
  }

  getAcademicYearList() {
    return this.httpRequest.get(`${this.API_URL}api/academic-year`);
  }

  deleteAcademicYear(id) {
    return this.httpRequest.delete(`${this.API_URL}api/academic-year/${id}`);
  }

  getAcademicYearOnId(id) {
    return this.httpRequest.get(`${this.API_URL}api/academic-year/${id}`);
  }
  
  markAsCurrent(id) {
    return this.httpRequest.get(`${this.API_URL}api/academic-year/mark-as-current/${id}`);
  }

  getUserWiseSectionList(params:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/section-list',params);
  }
}
