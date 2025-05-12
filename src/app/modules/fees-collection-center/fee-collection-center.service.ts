import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class FeeCollectionCenterService {
  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }

  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getAcademicYear(){
    return new Promise((resolve, reject) => {
      this.httpRequest.get(this.API_URL+'api/get-academic-year/'+this.getBranch())
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  getCollectionCenterById(id){
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL+'api/collection-center/show/'+id, {})
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  addPermissions(payload){
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL+'api/collection-center/add-permissions', payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  addNewCollectionCenter(payload){
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL+'api/collection-center/store', payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  updateCollectionCenter(id, payload){
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL+'api/collection-center/update/'+id, payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  } 

  deleteCollectionCenter(id){
    return new Promise((resolve, reject) => {
      this.httpRequest.delete(this.API_URL+'api/collection-center/delete/'+id)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  } 

  fetchCollectionCenterList(dataTablesParameters){
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL+'api/collection-center/list', dataTablesParameters)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  } 
  
  fetchUserList(branchId){
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL+'api/user-list/' + branchId, {})
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  } 
}
