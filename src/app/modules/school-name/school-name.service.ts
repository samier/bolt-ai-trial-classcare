import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class SchoolNameService {

  private API_URL = enviroment.apiUrl;  
  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }
  schoolList(params:any)
  {
    // alert(this.getBranch());
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/school-name/list/'+this.getBranch(),params);   
  }

  addSchool(payload:any)
  {    
    return this.httpRequest.post(this.API_URL+'api/school-name/create/',payload);   
  }

  getData(id?:any)
  {
    // let ele = '';    
    // if(id != undefined && id != null && id != '' && id != 'undefined')
    // {
    //   // id = 0;
    //   ele = id;
    // }
    return this.httpRequest.get(this.API_URL+'api/school-name/edit/'+id);
  }

  updateSchool(payload:any,id?:any)
  {
    // let ele = '';    
    // if(id != undefined && id != null && id != '' && id != 'undefined')
    // {
    //   // id = 0;
    //   ele = id;
    // }
    // payload.append("params",JSON.stringify(params));
    
    return this.httpRequest.post(this.API_URL+'api/school-name/update/'+id,payload);
    // return this.httpRequest.post(this.API_URL+'api/school-name/update/'+id+'/'+this.branch_id,payload);
  }

  deleteRecord(id:number)
  {
    return this.httpRequest.post(this.API_URL+'api/school-name/delete/'+id,{});
  }

}
class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
