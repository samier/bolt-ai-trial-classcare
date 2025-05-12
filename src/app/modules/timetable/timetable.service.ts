import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getClassList(){
    return this.httpRequest.get(this.API_URL+'api/timetable/get-classes-by-branch/'+this.getBranch());
  }

  getAllLectures(params:object){
    return this.httpRequest.post(this.API_URL+'api/lecture-timing/index', params);
  }

  getLectureById(lecture_id:string){
    return this.httpRequest.get(this.API_URL+'api/lecture-timing/get/'+lecture_id);
  }

  storeLectureTiming(data:object){
    return this.httpRequest.post(this.API_URL+'api/lecture-timing/store', data);
  }

  updateLectureTiming(data:object, lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/lecture-timing/update/'+lecture_id, data);
  }
  deleteLectureTiming(lecture_id:string){
    return this.httpRequest.post(this.API_URL+'api/lecture-timing/delete/'+lecture_id, null);
  }

  getAllAssignRooms(params:object){
    return this.httpRequest.post(this.API_URL+'api/assign-classroom/index', params);
  }

  getAssignRoomById(lecture_id:string){
    return this.httpRequest.get(this.API_URL+'api/assign-classroom/get/'+lecture_id);
  }

  storeAssignRoom(data:object){
    return this.httpRequest.post(this.API_URL+'api/assign-classroom/store', data);
  }

  updateAssignRoom(data:object, lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/assign-classroom/update/'+lecture_id, data);
  }
  deleteAssignRoom(lecture_id:string){
    return this.httpRequest.post(this.API_URL+'api/assign-classroom/delete/'+lecture_id, null);
  }

  getSubjectByClass(class_id:any){
    return this.httpRequest.post(this.API_URL+'api/get-subjects-by-class', {class_id: class_id});
  }

  getAllAssignLecture(params:object){
    return this.httpRequest.post(this.API_URL+'api/assign-lecture/index', params);
  }

  getAssignLectureById(lecture_id:string){
    return this.httpRequest.get(this.API_URL+'api/assign-lecture/get/'+lecture_id);
  }

  storeAssignLecture(data:object){
    return this.httpRequest.post(this.API_URL+'api/assign-lecture/store', data);
  }

  updateAssignLecture(data:object, lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/assign-lecture/update/'+lecture_id, data);
  }
  deleteAssignLecture(lecture_id:string){
    return this.httpRequest.post(this.API_URL+'api/assign-lecture/delete/'+lecture_id, null);
  }
  
  //create timetable
  getLecturesByClass(class_id:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-lecture-timing/'+ class_id, null);
  }

  getLecturers(params:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-subject-faculty', params);
  }

  handleLecturerChange(params:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-lecturer-availability', params);

  }

  handleRoomChange(params:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/handle-room-change', params);
  }

  storeTimetable(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/store-timetable', data);
  }

  getTimetable(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-timetable', data);
  }

  autoGenerateTimetable(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/auto-generate-timetable', data);
  }

  saveAllLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/save-all-lectures', data);
  }

  clearAllLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/clear-all-lectures', data);
  }

  clearLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/clear-lecture', data);
  }

  downloadTimetable(data:any, format:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/download-timetable/'+format, data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  saveLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/save-lecture', data);
  }

  getLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-lecture', data);
  }

  getBatchList(){
    return this.httpRequest.post(this.API_URL+'api/assign-classroom/batch-list', null);
  }
  
  getRoomList(){
    return this.httpRequest.post(this.API_URL+'api/assign-classroom/room-list', null);
  }

  getAllRooms(params:object){
    return this.httpRequest.post(this.API_URL+'api/room/index', params);
  }

  getRoomById(lecture_id:string){
    return this.httpRequest.get(this.API_URL+'api/room/get/'+lecture_id);
  }

  storeRoom(data:object){
    return this.httpRequest.post(this.API_URL+'api/room/store', data);
  }

  updateRoom(data:object, lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/room/update/'+lecture_id, data);
  }
  deleteRoom(lecture_id:string){
    return this.httpRequest.post(this.API_URL+'api/room/delete/'+lecture_id, null);
  }

  //teachers timetable
  getTeachersTimetable(page:any, search:any){
    return this.httpRequest.post(this.API_URL+'api/teacher-timetable/get-timetable?page='+page, {search: search});
  }

  downloadTeachersTimetable(format:any, data:any){
    return this.httpRequest.post(this.API_URL+'api/teacher-timetable/download-timetable/'+format, data, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  // proxy timetable
  getProxyTeachersTimetable(params:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-teacher-timetable/get-timetable', params);
  }

  storeProxyTeachersTimetable(params:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-teacher-timetable/store-timetable', params);
  }

  getProxyTimetableList(params:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-teacher-timetable/get-list', params);
  }


  getTimetableByUser(data:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/proxy/list', data);
  }
  
  getFacultyTimetable(params:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-details/proxy/list', params);
  }

  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getClasses(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }

  getBatches(payload:any)
  {
    return this.httpRequest.post(this.API_URL+'api/get-batches',payload);
  }











  // time slot

  timeTableSlotList(data:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/index',data);
  }

  createTimeSlot(data:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/create',data);
  }

  updateTimeSlot(data:any, time_slot:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/update/'+time_slot ,data);
  }

  deleteSlot(day:any, time_slot:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/delete/'+time_slot ,{day: day});
  }

  getTimeSlots(){
    return this.httpRequest.post(this.API_URL+'api/time-slot/list',[]);
  }

  assignTimeSlot(data:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/assign',data);
  }

  updateAssignTimeSlot(data:any, assigned_time_slot_id:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/update-assign-time-slot/'+assigned_time_slot_id,data);
  }

  getAssignedTimeSlot(assigned_time_slot_id:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/assigned-time-slot/'+assigned_time_slot_id , []);
  }

  getAssignedSlotList(params:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/assigned-slot-list',params);
  }

  deleteTimeSlot(assigned_time_slot_id:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/delete-time-slot/'+assigned_time_slot_id, []);
  }

  destroyTimeSlot(time_slot_id:any){
    return this.httpRequest.post(this.API_URL+'api/time-slot/destroy/'+time_slot_id, []);
  }

  getTimeSlotClasses(section:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/time-slot/get-classes', data);
  }

  //subject lectures

  getSubjects(data:any){
    return this.httpRequest.post(this.API_URL+'api/subject-lectures/get-subjects', data);
  }

  SubjectLecturesList(data:any){
    return this.httpRequest.post(this.API_URL+'api/subject-lectures/index', data);
  }

  createSubjectLectures(data:any){
    return this.httpRequest.post(this.API_URL+'api/subject-lectures/create', data);
  }

  getSubjectLectures(lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/subject-lectures/get/'+lecture_id, []);
  }

  updateSubjectLectures(data:any, lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/subject-lectures/update/'+lecture_id, data);
  }

  deleteSubjectLectures(lecture_id:any){
    return this.httpRequest.post(this.API_URL+'api/subject-lectures/delete/'+lecture_id, []);
  }

  //assign subject to users

  getUsers(data:any){
    return this.httpRequest.post(this.API_URL+'api/assign-subject/get-users', data);
  }

  assignSubjectToUsers(data:any){
    return this.httpRequest.post(this.API_URL+'api/assign-subject/assign-subject-to-users', data);
  }

  // time table
  getTimeTable(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/index', data);
  }

  saveTimeTableLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/save', data);
  }

  saveAllTimeTableLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/save-all', data);
  }

  deleteTimeTableLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/delete', data);
  }

  deleteAllTimeTableLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/delete-all', data);
  }

  getSubjectFaculties(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/subject-faculties', data);
  }

  getFacultyAvailability(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-faculty-availability', data);
  }

  getRoomAvailability(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-room-availability', data);
  }

  download(data:any, format:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/download/'+format, data, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  downloadStudent(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/download', data);
  }

  timetableAutoGenerate(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/auto-generate', data);
  }

  getLectures(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-lectures', data);
  }

  //proxy-timetable
  getProxyTimeTable(data:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-timetable/index', data);
  }

  saveProxyTimeTable(data:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-timetable/save', data);
  }

  proxyTimeTableList(data:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-timetable/list', data);
  }

  deleteProxyTimeTable(id:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-timetable/delete/'+id, []);
  }

  downloadProxyTimetable(params:any, format:any){
    return this.httpRequest.post(this.API_URL+'api/proxy-timetable/list/'+format, params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  
  getTimetableSettings(){
    return this.httpRequest.post(this.API_URL+'api/timetable/get-timetable-settings', []);
  }

  saveTimetableSettings(data:any){
    return this.httpRequest.post(this.API_URL+'api/timetable/save-timetable-settings', data);
  }


  //faculty timetable
  getFacultyList(){
    return this.httpRequest.post(this.API_URL+'api/faculty-timetable/faculty-list', []);
  }

  facultyTimetable(data:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-timetable/get-faculty-timetable', data);
  }

  downloadFacultyTimetable(data:any, format:any){
    return this.httpRequest.post(this.API_URL+'api/faculty-timetable/get-faculty-timetable/'+format, data, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  //extra lecture
  getExtraLectureTimetable(data:any){
    return this.httpRequest.post(this.API_URL+'api/extra-lecture/get-timetable', data);
  }

  getExtraLectureTimetableList(data:any){
    return this.httpRequest.post(this.API_URL+'api/extra-lecture/list', data);
  }

  saveExtraLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/extra-lecture/save', data);
  }

  clearExtraLecture(data:any){
    return this.httpRequest.post(this.API_URL+'api/extra-lecture/clear', data);
  }

  downloadExtraLecture(data:any, format:any){
    return this.httpRequest.post(this.API_URL+'api/extra-lecture/list/'+format, data, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
}
