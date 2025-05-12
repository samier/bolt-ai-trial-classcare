import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { apiVersions } from 'src/app/common-config/static-value';
import { apiUrlConstants } from 'src/app/shared/constants/apiUrl-constants';

@Injectable({
  providedIn: 'root'
})
export class StudentRemarkService {

  private API_URL = enviroment.apiUrl;
  private NEW_API_URL = enviroment.newApiUrl;
  constructor(private httpRequest: HttpClient) { }

  getBranch() {
    return window.localStorage.getItem("branch");
  }

  getAcademicYearId(id:any) {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/get-academic-year-id-name-list/'+this.getBranch());
  }

  getRemarkList(params:any)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/remark/remarks-list',params);
  }

  
  download(param:any) {
    return this.httpRequest.post(this.API_URL+'api/remark/pdf', param,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });    
  }
  
  getPdfAndExcel(param:any,format:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/remark/pdf`, param,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  
  getStudentRemarkList(param: any) {    
    return this.httpRequest.post<DataTablesResponse>(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.STUDENT_REMARK_LIST}`, param);
  }

  deleteRemark(id: any, param: any): any {
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.STUDENT_REMARK_DELETE}${id}`, param);
  }

  sendRemark(param:any,remarkId:any)
  {
    if(remarkId)
    {
      return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.STUDENT_REMARK_UPDATE}${remarkId}`, param);  
    }else
    {
      return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.STUDENT_REMARK_CREATE}`, param);
    }
  }

  getRemarkTitle(param:any)
  {
    return this.httpRequest.post<DataTablesResponse>(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.REMARK_TYPE}`,param);
  }

  getRemarkData(id:any)
  {
    return this.httpRequest.get(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.STUDENT_REMARK_EDIT}${id}`);
  }

  deleteTitle(id:any)
  {
    return this.httpRequest.delete(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.REMARK_TYPE_DELETE}${id}`);
  }

  addTitle(id:any,param:any)
  {
    if(id)
      {
        return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.REMARK_TYPE_UPDATE}${id}`, param);
      }else
      {
        return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.REMARK_TYPE_CREATE}`, param);
      }
  }
}
class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
