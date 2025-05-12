import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private API_URL = enviroment.apiUrl;

  constructor(private http : HttpClient) { }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  storeOrUpdateCourse(payload,id) {
    if(id){
      return this.http.post(`${this.API_URL}api/course/${id}?_method=put`,payload);
    }else{
      return this.http.post(`${this.API_URL}api/course`,payload);
    }
  }

  getCourseList() {
    return this.http.get(`${this.API_URL}api/course`);
  }

  deleteCourse(id) {
    return this.http.delete(`${this.API_URL}api/course/${id}`);
  }

  getCourseOnId(id) {
    return this.http.get(`${this.API_URL}api/course/${id}`);
  }

  getSubjectList() {
    return this.http.get(`${this.API_URL}api/subjects-list`);
  }

  getCategoryList() {
    return this.http.get(`${this.API_URL}api/category-list`);
  }

  getNotification() {
    return this.http.get(`${this.API_URL}api/get-branch-notification/${window.localStorage.getItem("branch")}`);
  }

  getSortedClass(){
    return this.http.post(`${this.API_URL}api/class/class-list-order-by`, [])
  }

  updateClassOrder(payload: any){
    return this.http.post(`${this.API_URL}api/class/sort-class-order`, payload);
  }

}
