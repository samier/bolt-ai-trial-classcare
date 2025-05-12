import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  eventList(params:any)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/calendar-event/list/'+this.getBranch(),params);
  }

  deleteRecord(id:number)
  {
    return this.httpRequest.post(this.API_URL+'api/calendar-event/delete/'+id,{});
  }

  addEvent(payload:any)
  {    
    return this.httpRequest.post(this.API_URL+'api/calendar-event/create/',payload);   
  }

  getData(id?:any)
  {   
    return this.httpRequest.get(this.API_URL+'api/calendar-event/edit/'+id);
  }

  updateEvent(payload:any,id?:any)
  {   
    return this.httpRequest.post(this.API_URL+'api/calendar-event/update/'+id,payload);    
  }
  
  getBatchList(payload?:any)
  {
    return this.httpRequest.post(this.API_URL+'api/get-batches/',payload);
  }

  getEventTypeList()
  {
    return this.httpRequest.get(this.API_URL+'api/calendar-event/event-type-list/'+this.getBranch(),{});
  }
  
  getColorList(id:any)
  {
    return this.httpRequest.get(this.API_URL+'api/calendar-event/color-list/'+id);
  }

  getColorData(id?:any)
  {   
    return this.httpRequest.get(this.API_URL+'api/event-type/edit/'+id);
  }

  getEventList(payload?:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/list-with-filters`,payload);
  }

  getEvent(id:any)
  {
    return this.httpRequest.get(`${this.API_URL}api/event/${id}`);
  }

  addEventGallery(payload?:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/create`,payload);
  }

  addEventImages(payload?:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/add-images`,payload);
  }

  storeEventGallery(payload?:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/store`,payload);
  }

  storeEventImages(payload?:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/store-images`,payload);
  }

  deleteEvent(id:any)
  {
    return this.httpRequest.delete(`${this.API_URL}api/event/delete/${id}`,{});
  }

  deleteImages(payload?:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/delete-images`,payload);
  }

  showImage(payload:any)
  {
    return this.httpRequest.post(`${this.API_URL}api/event/visibility-change`,payload);
  }

  updateImageOrder(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/event/change-order`, payload);
  }

  // initiateMultipartUpload(fileName: string) {
  //   return this.httpRequest.post(`${this.API_URL}api/event/initiate-upload`, { file_name: fileName });
  // }

  // uploadPart(uploadId: string, key: string, partNumber: number, chunk: Blob) {
  //   const formData = new FormData();
  //   formData.append('file', chunk, `chunk-${partNumber}`); // 👈 name MUST be 'file'
  //   formData.append('uploadId', uploadId);
  //   formData.append('key', key);
  //   formData.append('partNumber', partNumber.toString());

  //   return this.httpRequest.post(`${this.API_URL}api/event/upload-part`, formData);
  // }

  // completeMultipartUpload(uploadId: string, filePath: string, parts: any[]) {
  //   return this.httpRequest.post(`${this.API_URL}api/event/complete-multipart-upload`, {
  //     uploadId,
  //     filePath,
  //     parts
  //   });
  // }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}
