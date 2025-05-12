import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class HostelManagementService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch() {
    return window.localStorage.getItem("branch");
  }

  getSectionAndClass(section?: any) {
    return this.httpRequest.post(this.API_URL + 'api/get-section-and-classes', { section: section });
  }

  getClassList() {
    return this.httpRequest.get(this.API_URL + 'api/class-list/' + this.getBranch());
  }

  getBatchList(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/get-batches-by-classes', data);
  }

  getStudentList(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/student-list', data);

  }


  // Warden Details
  getWardenList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/warden/warden-datatable', params);
  }

  getWarden(warden_id: any) {
    return this.httpRequest.get(this.API_URL + 'api/warden/show/' + warden_id);
  }

  createWardenDetail(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/warden/store', params);
  }

  updateWardenDetail(params: any, warden_id: any) {
    return this.httpRequest.put(this.API_URL + 'api/warden/update/' + warden_id, params);
  }

  deleteWarden(warden_id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/warden/delete/' + warden_id);
  }

  getWardenDropdownList() {
    return this.httpRequest.post(this.API_URL + 'api/warden/warden-list/', []);
  }

  //hostel
  getHostelList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel/hostel-datatable', params);
  }

  getHostel(hostel_id: any) {
    return this.httpRequest.get(this.API_URL + 'api/hostel/show/' + hostel_id);
  }

  createHostelDetail(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel/store', params);
  }

  updateHostelDetail(params: any, hostel_id: any) {
    return this.httpRequest.put(this.API_URL + 'api/hostel/update/' + hostel_id, params);
  }

  deleteHostel(hostel_id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/hostel/delete/' + hostel_id);
  }

  getHostelDropdownList(params:any = null) {
    return this.httpRequest.post(this.API_URL + 'api/hostel/hostel-list/', params);
  }


  // Room
  getRoomList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/hostelroom-datatable', params);
  }

  getRoom(room_id: any) {
    return this.httpRequest.get(this.API_URL + 'api/hostel-room/show/' + room_id);
  }

  createRoomDetail(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/store', params);
  }

  updateRoomDetail(params: any, room_id: any) {
    return this.httpRequest.put(this.API_URL + 'api/hostel-room/update/' + room_id, params);
  }

  deleteRoom(room_id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/hostel-room/delete/' + room_id);
  }

  assignStudentRoom(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/assignStudentRoom', data);
  }

  roomStudentList(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/room-student-list', data);
  }

  updateAssignStudentFees(data:any){
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/update-assign-student-fees', data);
  }

  deleteAssignStudent(id:any){
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/delete-assign-student/'+id, []);
  }

  // Hostel fees

  showHostelFees(hostel_fees_id: any) {
    return this.httpRequest.get(this.API_URL + 'api/hostel-fees/show/' + hostel_fees_id);
  }

  collectHostelFees(data: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-fees/collect', data);
  }

  deleteReceipt(fees_id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/hostel-fees/delete-receipt/' + fees_id,);
  }

  printReceipt(fees_id: any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel-fees/print-receipt/' + fees_id, [], {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  // RoomType
  getRoomTypeList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/room-type-datatable', params);
  }

  getRoomType(id: any) {
    return this.httpRequest.get(this.API_URL + 'api/room-type/' + id);
  }

  createRoomType(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/room-type', params);
  }

  deleteRoomType(id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/room-type/' + id);
  }

  roomTypeList(){
    return this.httpRequest.get(this.API_URL + 'api/room-type-list');
  }

  getCategoryMonths(){
    return this.httpRequest.get(this.API_URL + 'api/room-type/get-category-months');
  }

  //wing
  getWingList(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/wings-datatable', params);
  }

  getWing(wing_id: any) {
    return this.httpRequest.get(this.API_URL + 'api/wings/' + wing_id);
  }

  createWingDetail(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/wings', params);
  }

  updateWingDetail(params: any, wing_id: any) {
    return this.httpRequest.put(this.API_URL + 'api/wings/' + wing_id, params);
  }

  deleteWing(wing_id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/wings/' + wing_id);
  }

  wingList(data:any){
    return this.httpRequest.post(this.API_URL + 'api/wings-list', data);
  }

  //Floor

  getFloorList(data:any, wing_id: any) {
    return this.httpRequest.post(this.API_URL + 'api/floor/datatable/' + wing_id, data);
  }

  createFloorDetail(params: any) {
    return this.httpRequest.post(this.API_URL + 'api/floor/store', params);
  }

  updateFloorDetail(params: any, wing_id: any) {
    return this.httpRequest.put(this.API_URL + 'api/floor/' + wing_id, params);
  }

  deleteFloor(floor_id: any) {
    return this.httpRequest.delete(this.API_URL + 'api/floor/' + floor_id);
  }

  singlefloorList(floor_id:any){
    return this.httpRequest.get(this.API_URL + 'api/floor/'+floor_id+'/edit');
  }

  floorList(wing_id:any){
    return this.httpRequest.post(this.API_URL + 'api/floor/floor-list', {wing_id: wing_id});
  }

  getRooms(){
    return this.httpRequest.post(this.API_URL + 'api/transfer/get-rooms', []);
  }

  getRoomStudent(data:any){
    return this.httpRequest.post(this.API_URL + 'api/transfer/get-room-students', data);
  }

  transferStudent(data:any){
    return this.httpRequest.post(this.API_URL + 'api/transfer/students-transfer', data);
  }

  roomList(params:any){
    return this.httpRequest.post(this.API_URL + 'api/hostel-room/list', params);
  }
  
  getStudentHostelDetail(params:any){
    return this.httpRequest.post(this.API_URL + 'api/get-student-hostel-detail', params);
  }

  getStudentHostelList(params:any){
    return this.httpRequest.post(this.API_URL + 'api/get-student-hostel-list', params);
  }
  
  getHostelRoomReport(params:any)
  {
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/hostel/hostel-report',params);
  }

  roomListData(data:any)
  {
    return this.httpRequest.post(this.API_URL + 'api/hostel/hostel-room-list', data);
  }

  hostelFloorList(data:any) {
    return this.httpRequest.post(this.API_URL + 'api/hostel/floor-room-list', data);
  }

  getPdfAndExcelReport (payload,format) {
    return this.httpRequest.post(`${this.API_URL}api/hostel/hostel-report/${format}`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getStudentIds(params:any){
    return this.httpRequest.post(this.API_URL+'api/get-student-ids',params);
  }

  getTemplateList(){
    return this.httpRequest.post(this.API_URL+'api/hostel/sms-template-list',[]);
  }

  getTemplateDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/hostel/sms-template-details/'+id,{});
  }

  getWhatsappTemplateList(){
    return this.httpRequest.post(this.API_URL+'api/hostel/whatsapp-template-list',[]);
  }

  getWhatsappTemplateDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/hostel/whatsapp-template-details/'+id,{});
  }

  sendSms(params:any)
  {
    return this.httpRequest.post(this.API_URL+'api/hostel/send-message',params);
  }

  deleteAttachment(attachment_id:any){
    return this.httpRequest.post(this.API_URL+'api/hostel-room/delete-attachment/'+attachment_id,[]);

  }

  getAcademicYear(){
    return this.httpRequest.get(this.API_URL+'api/get-academic-year/'+this.getBranch());
  }
}
class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}