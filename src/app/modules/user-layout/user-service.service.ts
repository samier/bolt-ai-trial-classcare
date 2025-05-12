import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {enviroment} from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private _API_URL = enviroment.apiUrl;
  private _symfonyHost = enviroment.symfonyHost;

  constructor(
    private httpRequest: HttpClient,
  ) { }

  // GET USER DETAILS
  getUserDetails(userId:number){
    return this.httpRequest.post(`${this._API_URL}api/loggedin-user-profile`,{})
  }

  // SAVE USER DETAILS
  saveUserDetails(data:any){
    return this.httpRequest.post(`${this._API_URL}api/loggedin-user-profile-update`,data)
  }

  // PASSWORD SAVE
  savePassword(data:any){
    return this.httpRequest.post(`${this._API_URL}api/change-user-password`,data)
  }

  // BRANCH-LIST API
  getBranchList(userID:any=null){
    if(userID){
      return this.httpRequest.get(`${this._API_URL}api/get-branch-list/${userID}`)
    }
    return this.httpRequest.get(this._API_URL+'api/get-branch-list')
  }

  // ADD/EDIT BRANCH
  addBranch(payload:any , branchID:any = null){
    if(branchID){
      return this.httpRequest.post(`${this._API_URL}api/branch/add-update-branch/${branchID}`,payload)
    }
    return this.httpRequest.post(this._API_URL+'api/branch/add-update-branch',payload)
  }
  // GET BRANCH DETAILS
  getBranchDetails(branchID:number){
    return this.httpRequest.post(`${this._API_URL}api/branch/edit-branch/${branchID}`,{})
  }

  // GET PLAN DETAILS 
  getPlanDetails(){
    return this.httpRequest.post(`${this._API_URL}api/get-plan-detail`,{})
  }
}
