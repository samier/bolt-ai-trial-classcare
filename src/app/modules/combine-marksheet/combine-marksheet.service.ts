import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class CombineMarksheetService {

  private API_URL = enviroment.apiUrl;

  constructor(
    private httpRequest: HttpClient
  ) { }

  // --------
  
  // CREATE COMBINE MARK SHEET LIST FOR DP
  combineMarkSheetList(){
    return this.httpRequest.post(`${this.API_URL}api/result/mark-sheet/list`,{})
  }

  // ADD/EDIT COMBINE MARK SHEET
  addEditMarkSheet(payload:any , id?:any){

    if(id) return this.httpRequest.post(`${this.API_URL}api/combine-result/update/${id}`,payload)

    return this.httpRequest.post(`${this.API_URL}api/combine-result/store`,payload)
  }

  // VIEW MARK SHEET
  viewCombineMarkSheet(id:number){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/edit/${id}`,{})
  }

  // --------

  // DELETE MARK SHEET
  deleteCombineMarkSheet(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/delete`,payload)
  }

  // LIST OF MARK SHEET
  listCombineMarkSheet(){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/list`,{})
  }

  // --------
  
  // DETAILS OF MARK SHEET
  detailsOfCombineMarkSheet(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-mark-sheet-data`,payload)
  }
  
  // UPDATE COMBINE MARK SHEET
  updateCombineMarkSheet(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/store-combine-result-settings`,payload)
  }
  
  // --------

  // GENERATE COMBINE MARK SHEET
  generateCombineTeacherResult(payload:any,who:any){
    if(who === 'student'){
      return this.httpRequest.post(`${this.API_URL}api/combine-result/generate-student-result`,payload)
    }
    return this.httpRequest.post(`${this.API_URL}api/combine-result/generate-teachers-result`,payload)
  }

  // DOWNLOAD COMBINE MARK SHEET RESULT
  downloadCombineTeacherResult(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-teachers-download-result`,payload)
  }

  getCombineMarksheetList(){
    return this.httpRequest.post(this.API_URL+'api/endpoint', [])
  }

  // TEMPLATE DESIGN OF MARK SHEET
  getTemplateDesignList(){
    return this.httpRequest.get(this.API_URL+'api/result-template');
  }

  createAndUpdateMarksheet(id: any, payload: any){
    if(id){
      return this.httpRequest.post(this.API_URL+'api/endpoint'+id, payload);
    }else{
      return this.httpRequest.post(this.API_URL+'api/endpoint', payload);
    }
  }

  // -------------------------------------------------------------

  // DETAILS OF COMBINE RESULT 
  fetchResultDetails(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-mark-sheet-data`,payload)
  }

  fetchFacultyList(){
    return this.httpRequest.post(`${this.API_URL}api/get-employees-list-for-leave`,[]);
  } 
  // -------------------------------------------------------------

  // DP SERVICES

  // Section list
  getSectionList(sections:any={}){
    return this.httpRequest.post(this.API_URL+'api/section/list',{});
  }
  
  // Class list
  getClass(payload:any,id:number){
    let url = this.API_URL+'api/class-list/'+ localStorage.getItem('branch') ;

    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    if(payload?.section_id){
      url+="&section_id="+payload?.section_id;
    }
    return this.httpRequest.get(url);
  }

  showDefaultGrade(){
    return this.httpRequest.post(`${this.API_URL}api/show-default-grade`,[]);
  }

  // USE TO GET GRADE OF PARTICULAR CLASS
  getGradeOnClass(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-grade-list`,payload);
  }
  
  getSubjectOnClass(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-subject-list`,payload);
  }
  
  // ? ------------------------------------------------------------------ DOWNLOAD COMBINE RESULT

  downLoadCombineResult(payload:any,forWho:any, studentBatchClassWise: boolean = false,schoolTemplate:boolean = false){
    // forWho 0-fac , 1-std , studentTemplate : school wise download
    if(schoolTemplate == true){
      return this.httpRequest.post(`${this.API_URL}api/combine-result/get-school-download-result`,payload);
    }else if(forWho == 0){
      return this.httpRequest.post(`${this.API_URL}api/combine-result/get-teachers-download-result`,payload);
    }else if(studentBatchClassWise == true ){
      return this.httpRequest.post(`${this.API_URL}api/combine-result/get-student-download-result-for-batch`, payload)
    }
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-student-download-result`,payload);
  }

  fetchClasses(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-class-list`,payload);
  }
  fetchBatches(payload:any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-batch-list`,payload);
  }

  runJob(who:any,id:any){
    if(who == 'student'){
      return this.httpRequest.get(`${this.API_URL}api/combine-result/get-student-job-process/${id}` )
    }
    return this.httpRequest.get(`${this.API_URL}api/combine-result/get-faculty-job-process/${id}`);
  }

  downloadMarkSheet(url:any) {
    return this.httpRequest.get(url,{
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }

  fetchClassList(id:number){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-all-class-list/${id}`,{});
  }
  
  publishMarksheet(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/combine-publish-marksheet`, payload);
  }

  publishMarksheetManually(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/combine-publish-marksheet-manually`, payload)
  }

  studentTemplateResult(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-school-download-result`, payload)
  }

  fetchGenerateSetupList(markSheetId : any){
    return this.httpRequest.post(`${this.API_URL}api/combine-result/get-all-classes-for-result/${markSheetId}`, {})
  }
}
