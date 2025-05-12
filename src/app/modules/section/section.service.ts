import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
@Injectable({
  providedIn: 'root'
})
export class SectionService {

  branchID : any = window.localStorage.getItem('branch');
  private API_URL = enviroment.apiUrl;

  constructor(
    private httpRequest : HttpClient
  ) { }

  addEditSection(isEdit:boolean,payload:any,sectionID:number){
    if(isEdit){
      return this.httpRequest.post(`${this.API_URL}api/section/update-section/${sectionID}`,payload);
    }
    return this.httpRequest.post(`${this.API_URL}api/section/add-section`,payload);
  }

  getSectionList(){
    const payload ={
      branch_id : this.branchID
    }
    return this.httpRequest.post(this.API_URL+'api/section/get-section' ,payload);
  }
  deleteSection(section:any){
    return this.httpRequest.post(`${this.API_URL}api/section/delete-section/${section.id}`,{})
  }

  // SCHOOL DROPDOWN LIST
  getSchoolList(){
    return this.httpRequest.post(`${this.API_URL}api/school-name/list/${this.branchID}`,{});
  }
  
  // MEDIUM DROPDOWN LIST
  getMediumList(){
    return this.httpRequest.post(`${this.API_URL}api/get-medium`,{});
  }

}
