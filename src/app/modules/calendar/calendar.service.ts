import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiVersions } from 'src/app/common-config/static-value';
import { apiUrlConstants } from 'src/app/shared/constants/apiUrl-constants';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  
  private API_URL = enviroment.apiUrl;
  private NEW_API_URL = enviroment.newApiUrl;
  public branch_id = window.localStorage?.getItem("branch");

  constructor(private httpRequest: HttpClient) { }

  getBatchList(payload:any)
  {
    return this.httpRequest.post( this.API_URL+"api/get-batches-by-classes",payload);
  }
  getBatchOnClass(payload:any){
    return this.httpRequest.post( this.API_URL+"api/get-batches-by-classes",payload);
  }

  getFacultyList(){
    return this.httpRequest.get(this.API_URL+'api/get-faculty-list/'+this.branch_id); 
  }

  addEditSection(isEdit:boolean,payload:any,holiday_id:number){
    if(isEdit){
      return this.httpRequest.post(`${this.API_URL}api/holiday/update/${holiday_id}`,payload);
    }
    return this.httpRequest.post(`${this.API_URL}api/holiday/create`,payload);
  }

  editHoliday(_holiday_id:number){
    
    return this.httpRequest.post(`${this.API_URL}api/holiday/edit/${_holiday_id}`, {});
  }

  getHolidayList(payload : any){
    return payload.pageType == 'holiday' ? this.httpRequest.post(`${this.API_URL}api/holiday/index`,payload) : this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.CALENDAR_EVENT_LIST}${this.branch_id}`,payload);
  }

  deleteHoliday(payload:any){
    return payload.pageType == 'holiday' ? this.httpRequest.post(`${this.API_URL}api/holiday/delete/${payload.id}`,{}): this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.CALENDAR_EVENT_DELETE}${payload.id}`,{}) 
  }

  getCalendarEventsList(payload){
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.VIEW_CALENDAR}`, payload);
  }

  createUpdateEventHoliday(payload: any, id : any){
    if(payload.modalFor == 'event' && !id){  
      return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.CALENDAR_EVENT_CREATE}`, payload)
    }else if(payload.modalFor == 'event' && id) {
      return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.CALENDAR_EVENT_UPDATE}`, payload);
    }else if (payload.modalFor == 'holiday' && !id) {
      return this.httpRequest.post(`${this.API_URL}api/holiday/create`, payload);
    }else {
      return this.httpRequest.post(`${this.API_URL}api/holiday/update`, payload);
    }
  }

  getEventTypeList(){
    return this.httpRequest.get(`${this.NEW_API_URL}${apiVersions.v2}${apiUrlConstants.CALENDAR_EVENT_TYPE_LIST}${this.branch_id}`,{});
  }
}
