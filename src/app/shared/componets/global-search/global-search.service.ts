import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
// import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {

  private API_URL = enviroment.apiUrl;

  constructor(private httpRequest: HttpClient) { }

  getStudentData(data: any) {

    let ret = this.httpRequest.post(this.API_URL + 'api/student-list', data);
    return ret;
  }
  getFacultyData(param: any) {

    let data = this.httpRequest.post(this.API_URL + 'api/faculty-list', param);
    return data
  }

  getAcadamicYear(param: any) {

    let data = this.httpRequest.post(this.API_URL + 'api/global-search/get-academic-year', param);
    return data
  }


  /**
  * @ngdoc method
  * @name fetchBranchList
  * @description
  * fetch branch lists
  * @param {number} userId
  * @returns Promise
  */
  fetchBranchList(userId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.get(this.API_URL + 'api/get-branch-list/' + userId)
        .subscribe({
          next: (data) => resolve(data),
          error: (e) => reject(e),
          complete() {
            // console.log("is completed");
          },
        })
    });
  }


  /**
  * @ngdoc method
  * @name fetchBranchList
  * @description
  * fetch AcademicYear list by branch
  * @param {number} userId
  * @returns Promise
  */
  fetchAcademicYearListbyBranch(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL + 'api/global-search/get-academic-year/', payload)
        .subscribe({
          next: (data) => resolve(data),
          error: (e) => reject(e),
          complete() {
            // console.log("is completed");
          },
        })
    });
  }

  /**
  * @ngdoc method
  * @name fetchAcademicYearListbyBranches
  * @description
  * fetch AcademicYear list by branches
  * @param {number} userId
  * @returns Promise
  */
  fetchAcademicYearListbyBranches(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL + 'api/get-academic-year-selected-branch-wise/', payload)
        .subscribe({
          next: (data) => resolve(data),
          error: (e) => reject(e),
          complete() {
            // console.log("is completed");
          },
        })
    });
  }

  /**
  * @ngdoc method
  * @name searchStudent
  * @description
  * fetch student data
  * @param {any} payload
  * @returns Promise
  */
  searchStudent(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL + 'api/student-global-search', payload)
        .subscribe({
          next: (data) => resolve(data),
          error: (e) => reject(e),
          complete() {
            // console.log("is completed");
          },
        })
    });
  }

  /**
 * @ngdoc method
 * @name searchFaculty
 * @description
 * fetch faculty data
 * @param {any} payload
 * @returns Promise
 */
  searchFaculty(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL + 'api/faculty-list', payload)
        .subscribe({
          next: (data) => resolve(data),
          error: (e) => reject(e),
          complete() {
            // console.log("is completed");
          },
        })
    });
  }
}
