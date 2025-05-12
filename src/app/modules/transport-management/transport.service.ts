import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment.staging';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { callAPIConstants } from 'src/app/shared/constants/callAPI-constants';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  private API_URL = enviroment.apiUrl;
  private locationPicker = new Subject<void>();
  locationPicker$ = this.locationPicker.asObservable();
  
  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }
  //Document Types
  getDocumentTypeList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/document_type-list',params);
  }

  getPaginate(url:any){
    return this.httpRequest.get(url);
  }

  getDocumentTypes(type:string){
    return this.httpRequest.post(this.API_URL+'api/document_type-list/'+type,{});
  }
  getVehicleNumbers(){
    return this.httpRequest.post(this.API_URL+'api/vehicle-number-list',{});
  }

  getDocumentTypeDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/document_type/show/'+id,id);
  }

  addDocumentType(paraAddDocumentType:any) {       
    return this.httpRequest.post(this.API_URL+'api/document_type/create',paraAddDocumentType);
  }

  saveDocumentType(paraSave:any,id:number){
    if(id == null){
      return this.addDocumentType(paraSave);
    }else{
      return this.updateDocumentType(paraSave,id);
    }
  }

  updateDocumentType(paraUpdateDocumentType:any,id:number){
    return this.httpRequest.put(this.API_URL+'api/document_type/'+id,paraUpdateDocumentType);
  }

  deleteDocumentType(id:number){
    return this.httpRequest.post(this.API_URL+'api/document_type/delete/'+id,id);
  }

  //Vehicle
  getVehicleList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/vehicle-datatable',params);
  }

  getVehicles(){
    return this.httpRequest.post(this.API_URL+'api/vehicle-list',{});
  }

  getVehicleDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/vehicle/show/'+id,id);
  }

  saveVehicle(paraSave:any,id:number){
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/vehicle',paraSave);
    }else{
      // return this.httpRequest.post(this.API_URL+'api/vehicle/'+id+'?_method=put',paraSave);
      return this.httpRequest.post(this.API_URL+'api/vehicle/update/'+id+'?_method=put',paraSave);
    }
  }

  deleteVehicle(id:number){
    return this.httpRequest.post(this.API_URL+'api/vehicle/delete/'+id,id);
  }

  deleteVehicleDocument(id:number){
    return this.httpRequest.post(this.API_URL+'api/vehicle/document/delete/'+id, []);
  }

  // Driver
  getDriverList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/driver-list',params);
  }

  getDrivers(type:string){
    return this.httpRequest.post(this.API_URL+'api/get-driver-by-type/'+type,{});
  }

  getDriverDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/driver/show/'+id,id);
  }

  saveDriver(paraSave:any,id:number){
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/driver',paraSave);
    }else{
      return this.httpRequest.post(this.API_URL+'api/driver/'+id+'?_method=put',paraSave);
    }
  }

  deleteDriver(id:number){
    return this.httpRequest.post(this.API_URL+'api/driver/delete/'+id,id);
  }

  // Stops
  getStopList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/stop-datatable',params);
  }

  getStops(data?:any){
    return this.httpRequest.post(this.API_URL+'api/stop-list',data);
  }

  getStopDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/stop/show/'+id,id);
  }

  saveStop(paraSave:any,id:number){
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/stop',paraSave);
    }else{
      return this.httpRequest.post(this.API_URL+'api/stop/'+id+'?_method=put',paraSave);
    }
  }

  deleteStop(id:number){
    return this.httpRequest.post(this.API_URL+'api/stop/delete/'+id,id);
  }

  emitLocationPicker(data) {
    this.locationPicker.next(data);
  }

  stopLogs(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/stop-logs',params);
  }

  stopLogsDetail(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/stop-logs-detail',params);
  }

  // Routes
  getRouteList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/route-datatable',params);
  }

  getRoutes(){
    return this.httpRequest.post(this.API_URL+'api/route-list',{});
  }

  getRouteDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/route/show/'+id,id);
  }

  getRouteByStop(params:any){
    return this.httpRequest.post(this.API_URL+'api/route-by-stop',params);
  }

  saveRoute(paraSave:any,id:number){
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/route',paraSave);
    }else{
      return this.httpRequest.post(this.API_URL+'api/route/update/'+id+'?_method=put',paraSave);
      // return this.httpRequest.put(this.API_URL+'api/route/'+id,paraSave);
    }
  }

  deleteRoute(id:number){
    return this.httpRequest.post(this.API_URL+'api/route/delete/'+id,id);
  }

  deleteRouteStop(id:number){
    return this.httpRequest.post(this.API_URL+'api/route/stop/delete/'+id,id);
  }

  // classes
  getClassesList(){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+this.getBranch());
  }

  // batches
  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  // students
  getStudentList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-students-by-batches',params);
  }

  // employee
  getEmployeeList(){
    return this.httpRequest.post(this.API_URL+'api/get-employees-list',{branchId:this.getBranch()});
  }

  // assign-transport
  getAssignTransportList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/assign-transport-list',params);
  }

  studentTransportList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student-transport-list',params);
  }

  getAssignTransportDetail(id:number){
    return this.httpRequest.post(this.API_URL+'api/assign-transport/show/'+id,id);
  }

  getStudentTransportDetail(params:any){
    return this.httpRequest.post(this.API_URL+'api/student-transport-detail',params);
  }

  saveAssignTransport(paraSave:any,id:any = null){
    Object.assign(paraSave,{branchId:this.getBranch()});
    if(id == null){
      return this.httpRequest.post(this.API_URL+'api/assign-transport',paraSave);
    }else{
      // return this.httpRequest.post(this.API_URL+'api/assign-transport/'+id+'?_method=put',paraSave);
      return this.httpRequest.post(this.API_URL+'api/assign-transport/update/'+id,paraSave);
    }
  }

  genrateExportFile(data:any,type){
    return this.httpRequest.post(this.API_URL+'api/assign-transport-export/'+type,data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deleteAssignTransport(id:number){
    return this.httpRequest.post(this.API_URL+'api/assign-transport/delete/'+id,id);
  }

  getFacultyTransport(){
    return this.httpRequest.post(this.API_URL+'api/faculty-transport',{});
  }

  getVehicleAndRouteList(){
    return this.httpRequest.get(this.API_URL+'api/getVehicleAndRouteList/'+this.getBranch());
  }

  getAvailableRoutes(params:any){
    return this.httpRequest.post(this.API_URL+'api/get-available-routes',params);
  }

  saveTransportSetting(params:any){
    return this.httpRequest.post(this.API_URL+'api/save-transport-setting',params);
  }

  getTransportSetting(params?:any){
    return this.httpRequest.post(this.API_URL+'api/get-transport-setting',params);
  }

  getAcademicYear(){
    return this.httpRequest.get(this.API_URL+'api/get-academic-year/'+this.getBranch());
  }

  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getClassList(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }

  getClassBySection(sections:any)
  {
    const data = {
      sections : [sections],
      branchId : this.getBranch()
    }
    return this.httpRequest.post(this.API_URL+'api/class/list', data);
  }

  getTransportRouteList(){
    return this.httpRequest.post(this.API_URL+'api/transport/route-list',[]);

  }

  getTransportStopList(data:any){
    return this.httpRequest.post(this.API_URL+'api/transport/stand-list',data);

  }

  getTransportTransferList(data:any){
    return this.httpRequest.post(this.API_URL+'api/transport/transport-transfer-list',data);
  }

  getTransportTransferStudentList(data:any, id:any){
    return this.httpRequest.post(this.API_URL+'api/transport/transport-transfer-students-list/'+id,data);
  }

  getTransportStudentList(data:any){
    return this.httpRequest.post(this.API_URL+'api/transport/student-list',data);
  }

  studentTransfer(data:any){
    return this.httpRequest.post(this.API_URL+'api/transport/student-transfer',data);

  }

  systemSetting(key_name:any){
    return this.httpRequest.get(this.API_URL+'api/assign-transport/system_setting/'+key_name);
  }
  getAreaList(params)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/area/list',params);
  }

  submitData(payload)
  {
    return this.httpRequest.post(this.API_URL+'api/area/store',payload);
  }

  showDetail(id)
  {
    return this.httpRequest.get(this.API_URL+'api/area/view/'+id);
  }

  updateData(payload,id)
  {
    return this.httpRequest.post(this.API_URL+'api/area/update/'+id,payload);
  }

  deleteArea(id){
    return this.httpRequest.delete(this.API_URL+'api/area/delete/'+id,{});
  }

  updateAreaStatus(payload,id)
  {
    return this.httpRequest.post(this.API_URL+'api/area/change-status/'+id,payload);
  }
  
  deleteAttachment(attachment_id:any){
    return this.httpRequest.post(this.API_URL+'api/assign-transport-attachment/delete/'+attachment_id, []);
  }

  documentList(payload:any){
    return this.httpRequest.post(this.API_URL+'api/vehicle-document-list',payload);
  }
  //Transport area

  TransportAreaList(data:any){
    return this.httpRequest.post(this.API_URL+'api/area/index', data);
  }

  AreaList(){
    return this.httpRequest.post(this.API_URL+'api/area/list', []);
  }

  storeTransportArea(data:any){
    if(data.id == null){
      return this.httpRequest.post(this.API_URL+'api/area/store', data);
    }else{
      return this.httpRequest.post(this.API_URL+'api/area/update', data);
    }
  }

  deleteTransportArea(id:any){
    return this.httpRequest.post(this.API_URL+'api/area/delete/'+id, []);
  }

  getUserWiseSectionList(user_id:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/section-list',user_id);
  }
}


class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}