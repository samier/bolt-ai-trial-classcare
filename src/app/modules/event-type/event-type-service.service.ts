import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Injectable({
  providedIn: 'root'
})
export class EventTypeServiceService {

  private API_URL = enviroment.apiUrl; 
  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  eventTypeList(params:any)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/event-type/list/'+this.getBranch(),params);
  }

  deleteRecord(id:number)
  {
    return this.httpRequest.post(this.API_URL+'api/event-type/delete/'+id,{});
  }

  addEditEvent(payload:any,holiday_id:number){
    if(holiday_id){
      return this.httpRequest.post(`${this.API_URL}api/event-type/update/${holiday_id}`,payload);
    }
    return this.httpRequest.post(`${this.API_URL}api/event-type/create/`,payload);
  }
  
  getData(id?:any)
  {   
    return this.httpRequest.get(this.API_URL+'api/event-type/edit/'+id);
  }

  updateEventType(payload:any,id?:any)
  {   
    return this.httpRequest.post(this.API_URL+'api/event-type/update/'+id,payload);    
  }

  addEventType(payload:any)
  {    
    return this.httpRequest.post(this.API_URL+'api/event-type/create/',payload);   
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
