import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { enviroment } from '../../../environments/environment.staging';
import { apiUrlConstants } from 'src/app/shared/constants/apiUrl-constants';
import { apiVersions } from 'src/app/common-config/static-value';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private API_URL = enviroment.apiUrl;
  private NEW_API_URL = enviroment.newApiUrl;

  constructor(private httpRequest: HttpClient) { }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getAcademicYearIs(){
    return ('; '+document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0];;
  }

  getStudentCategoryReport(params:any){
      return this.httpRequest.post(this.API_URL+'api/download-student-list-by-categories/'+this.getBranch(),params);
  }


  downloadStudentCategoryReport(params:any, format:string)
  {
    return this.httpRequest.post(this.API_URL+'api/download-student-list-by-categories/'+this.getBranch()+'/'+format,params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    }); 
  }
  // transport report
  getVehicleReport(){
    return this.httpRequest.get(this.API_URL+'api/vehicle-report/'+this.getBranch(),{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getDriverReport(){
    return this.httpRequest.get(this.API_URL+'api/driver-report/'+this.getBranch(),{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  getRouteReport(){
    return this.httpRequest.get(this.API_URL+'api/route-report/'+this.getBranch(),{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  getRouteWiseStudentCountReport(){
    return this.httpRequest.get(this.API_URL+'api/route-wise-student-count-report/'+this.getBranch(),{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getTransportStudentReport(params:object){
    return this.httpRequest.post(this.API_URL+'api/transport-student-report/'+this.getBranch(), params);
  }

  downloadStudentTransportReport(params:object,format:string){
      return this.httpRequest.post(this.API_URL+'api/transport-student-report/'+this.getBranch()+'/'+format, params,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }
  getClassList(section?:any, branch?:any){
    const data = {
      section : section,
      branch: branch,
    }
    return this.httpRequest.post(this.API_URL+'api/fees/get-classes',data);
  }

  getClassListForMaster(section?:any, branch?:any, academic?:any){
    const data = {
      section : section,
      branch: branch,
      academic_year_id: academic,
    }
    return this.httpRequest.post(this.API_URL+'api/filter/get-classes',data);
  }

  getStudentClassList(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/student/get-classes',data);
  }

  getVehicleAndRouteList(){
    return this.httpRequest.get(this.API_URL+'api/getVehicleAndRouteList/'+this.getBranch());
  }

  getStopList(){
    const data = {
      branchId : this.getBranch()
    }
    return this.httpRequest.post(this.API_URL+'api/stop-list', data);
  }
  getStopListByRouteList(route_id:any){
      const data = {
        route_id : route_id,
        branchId : this.getBranch()
      }
      return this.httpRequest.post(this.API_URL+'api/stop-list-by-route-id', data);
  }
  getBatchesByClass(classes:any){
    const data = {
      classes : Array.isArray(classes) ? classes : [classes],
      branchId : this.getBranch()
    }
    return this.httpRequest.post(this.API_URL+'api/filter/get-batches', data);
  }

 //fees report
 getFeesReport(params:object){
  return this.httpRequest.post(this.API_URL+'api/fees-report', params);
  }

  getFeesCategories(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-fees-categories',data);
  }

  getStudentIds(params:any){
    return this.httpRequest.post(this.API_URL+'api/get-student-ids',params);
  }

  sendFeesSms(params:any){
    return this.httpRequest.post(this.API_URL+'api/send-fees-sms', params);
  }

  downloadFeesReport(params:object, format:string){
      return this.httpRequest.post(this.API_URL+'api/fees-report/'+format,  params,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }

  downloadRemainingFeesReport(params:object){
      return this.httpRequest.post(this.API_URL+'api/fees/remaining-fees',  params,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }

  getFeesDueReport(data:any){
    if(data.report_type == '1'){
      return this.httpRequest.post(this.API_URL+'api/fees-due-report', data);
    }else{
      return this.httpRequest.post(this.API_URL+'api/fees-due-report-all-academics', data);
    }
  }

  downloadFeesDueReport(data:any, format:any){
    if(data.report_type == '1'){
      return this.httpRequest.post(this.API_URL+'api/fees-due-report/'+format, data, {
        observe: 'response',
        responseType: 'blob' as 'json'
      });
    }else{
      return this.httpRequest.post(this.API_URL+'api/fees-due-report-all-academics/'+format, data, {
        observe: 'response',
        responseType: 'blob' as 'json'
      });
    }
  }




  downloadClasswiseStudentGenderSummaryReport(format:string){
      return this.httpRequest.get(this.API_URL+'api/student/get-classwise-student-gender-summary/'+this.getBranch()+'/'+format,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }

  downloadClasswiseStudentActiveInActiveSummaryReport(format:string){
      return this.httpRequest.get(this.API_URL+'api/student/get-classwise-student-active-inactive-summary/'+this.getBranch()+'/'+format,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }



  //student GR report code
  // classes
  getClassesList(){
    return this.httpRequest.get(this.API_URL+'api/lesson/class-list/'+this.getBranch());
  }

  // batches
  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranch()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  getStudentTableAllFieldList(){
    return this.httpRequest.get(this.API_URL+'api/student/get-student-table-all-field-list');
  }

  //Get all students list by class and batch
  generateStudentGrReport(params:object){
    return this.httpRequest.post(this.API_URL+'api/student/get-student-list-by-batch-id/'+this.getBranch(), params);
  }

  downloadStudentReport(params:object, format:string){
      return this.httpRequest.post(this.API_URL+'api/student/get-student-list-by-batch-id/'+this.getBranch()+'/'+format,  params,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }
  getGenderFullName(gender:any) {
    if (gender == 'm') {
      return "Male";
    } else if (gender == 'f') {
      return "Female";
    } else if (gender == 'o') {
      return "Other";
    } else {
      return "-"
    }
  }

  getStudentStatus(status:any) {
    if (status == 1) {
      return "Active";
    } else if (status == 0) {
      return "InActive";
    } else {
      return "-"
    }
  }

  getApplicationReport(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/application-log-in-report',params);
  }

  getExport(params:any,format:string){
      return this.httpRequest.post(this.API_URL+'api/get-application-report/'+format,params,{
        observe: 'response',
        responseType: 'blob' as 'json'
      });
  }

  sendMessage(params:any){
    return this.httpRequest.post(this.API_URL+'api/send-application-report-sms',params);
  }

  getFeesMonth(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-fees-month', data);

  }

  getStudentReportByCategory(){
    return this.httpRequest.post(this.API_URL+'api/student/get-student-report-by-categories',{});
  }

  getStudentReportByGender(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student/get-classwise-student-gender-for-datatable',params);
  }

  getStudentReportByActiveStatus(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student/get-classwise-student-active-inactive-for-datatable',params);
  }

  getSectionList(sections:any){
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getSchoolList()
  {
    return this.httpRequest.post(this.API_URL+'api/school-name/list',{});
  }

  getBranchList(){
    return this.httpRequest.get(this.API_URL+'api/branch-list');
  }

  getClassBySection(sections:any)
  {
    const data = {
      sections : [sections],
      branchId : this.getBranch()
    }
    return this.httpRequest.post(this.API_URL+'api/class/list', data);
  }

  getFeesTableAllFieldList(type:any,status:any){
    const data = {
      type : type,
      status : status
    }
    return this.httpRequest.post(this.API_URL+'api/report/get-fees-table-all-field-list',data);
  }

  getStudentId(params:any)
  {
    return this.httpRequest.post(this.API_URL+'api/generate-student-id-card',params,{
    observe: 'response',
    responseType: 'blob' as 'json'
  });
  }

  getBonafiedCertificate(param:any)
  {
    return this.httpRequest.post(this.API_URL+'api/get-bonafide-report/'+this.getBranch(),param,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  bankReport(param:any)
  {
    return this.httpRequest.post(this.API_URL+'api/bank-detail/pdf',param,{
      observe: 'response',
    responseType: 'blob' as 'json'
    });
  }

  getBatchBySection(sections?:any)
  {
    const data = {
      section_id : sections,
      branchId : this.getBranch(),
    }
    return this.httpRequest.post(this.API_URL+'api/get-batches', data);
  }

  getCategoryList()
  {
    return this.httpRequest.get(this.API_URL+'api/category/list/'+this.getBranch());

  }


  //master report
  getAcademicYar(params:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-academic-year', params);
  }

  getPaymentMode(){
    return this.httpRequest.post(this.API_URL+'api/fees/get-payment-modes', []);
  }

  getFeesCollector(data:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-fees-collector', data);
  }

  getMasterFeesReport(params:any){
    return this.httpRequest.post(this.API_URL+'api/master-fees-report', params);
  }

  downloadMasterFeesReport(params:any, type:any){
    return this.httpRequest.post(this.API_URL+'api/master-fees-report/'+type, params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  storeMasterTemplate(data:any){
    return this.httpRequest.post(this.API_URL+'api/master-template/store/template', data);
  }

  getTemplateList(data=[]){
    return this.httpRequest.post(this.API_URL+'api/master-template/list/template', data);
  }

  getSections(data:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-section-list', data);
  }

  userList(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/get-users', data);
  }

  getPaymentModes(){
    return this.httpRequest.get(this.API_URL+'api/fees/get-payment-modes');
  }


  qrCode(params:any,format:string){
    return this.httpRequest.post(this.API_URL+'api/qr-code/'+format,params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  updateURL(params:any){
    return this.httpRequest.post(this.API_URL+'api/qr-code/generate', params);
  }

  getURL(){
    return this.httpRequest.post(this.API_URL+'api/qr-code/get-urls',{});
  }

  getSectionListByBranch() {
    return this.httpRequest.get(this.API_URL+'api/student-leaving-certificate/section-list-by-branch/'+this.getBranch());
  }

  getCourseList(param:any)
  {
    return this.httpRequest.post(this.API_URL+'api/course-list',param);
  }

  getExcel(format:string,param:any)
  {
    return this.httpRequest.post(this.API_URL+'api/course-wise-fees-update/'+format,param,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deleteTemplateList(id:number){
    return this.httpRequest.post(`${this.API_URL}api/master-template/delete/${id}`, []);
  }

  updateTemplate (id:number,data) {
    return this.httpRequest.post(`${this.API_URL}api/master-template/update/template/${id}`, data);
  }

  getStudentCustomColumns(){
    return this.httpRequest.get(this.API_URL+'api/due-fees/get-student-columns');
  }

  getRouteList(data:any){
    return this.httpRequest.post(this.API_URL+'api/due-fees/get-route-list', data);
  }
  
  downloadFile(res: any, file: any, format: any) {
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob);
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
      }, 200);
      //iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc;
      a.click();
    }
  }

  getExpenseReport (payload) {
    return this.httpRequest.post(`${this.API_URL}api/expense/expense-report`,payload);
  }

  getBatchOnClass(payload:any){
    return this.httpRequest.post( this.API_URL+"api/get-batches-by-classes",payload);
  }

  getClassByMultipleSection(payload: any){
    return this.httpRequest.post(this.API_URL+'api/notice/get-class-list',payload)
  }

  getPdfAndExcelReport (payload,formate) {
    return this.httpRequest.post(`${this.API_URL}api/expense/expense-report/${formate}`,  payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getExpenseCategory () {
    return this.httpRequest.post(`${this.API_URL}api/expense/expense-category`,[]);
  }

  getStudentBirthdayList(params:any){
    return this.httpRequest.post(this.API_URL+'api/student/student-birthday-list', params);
  }

  getStudentBirthdayPdf(params:any, format: string){
    return this.httpRequest.post(this.API_URL+'api/student/student-birthday-list/'+format, params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getUserBirthdayList(params:any){
    return this.httpRequest.post(this.API_URL+'api/faculty/faculty-birthday-list', params);
  }

  getUserBirthdayPdf(params:any, format: string){
    return this.httpRequest.post(this.API_URL+'api/faculty/faculty-birthday-list/'+format, params, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  // Class list
  getClass(payload:any,id:number){
    let url = this.API_URL+'api/class-list/'+ this.getBranch() ;
    if(payload?.user_id){
      url+="?user_id="+payload?.user_id;
    }
    if(payload?.section){
      url+="&section_id="+payload?.section;
    }
    return this.httpRequest.get(url);
  }

  reminderList(payload:any){
    return this.httpRequest.post(this.API_URL+"api/fees-reminder/list",payload)
  }

  quarters(){
    return this.httpRequest.get(this.API_URL+"api/fees-reminder/quarters")
  }

  pdfGenerate(params:any,format:string){
    return this.httpRequest.post(this.API_URL+'api/fees-reminder/generate-pdf',params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  //discount report
  feeDiscountReport(data:any){
    return this.httpRequest.post(this.API_URL+"api/fees/discount-report", data)
  }

  feeDiscountReportDownload(data:any, format:any){
    return this.httpRequest.post(this.API_URL+"api/fees/discount-report/"+format, data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    })
  }

  feeDiscountReportAttachmentsDownload(){
    return this.httpRequest.post(this.API_URL+"api/fees/download-discount-report-attachments", [],{
      observe: 'response',
      responseType: 'blob' as 'json'
    })
  }
  
  getExamTypes(){
    return this.httpRequest.post(this.API_URL+"api/exam-type/list", []);
  }

  getBatchReport(payload: any){
    return this.httpRequest.post(this.API_URL+"api/monthly/report/batch-report", payload, {
      observe: 'response',
      responseType: 'blob' as 'json'
    })
  }

  getExamReport(payload: any){
    return this.httpRequest.post(this.API_URL+"api/monthly/report/general-report", payload, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getFacultyAndPrincipal () {
    return this.httpRequest.post(this.API_URL+"api/get-faculty-and-principal",[]);
  }

  getInquiryFeesReport(payload) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/fees/report`,payload);
  }

  downloadInquiryFeesReport(payload,format) {
    return this.httpRequest.post(`${this.API_URL}api/inquiry/fees/report/${format}`,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getStudentStrenthReport(payload: any) {
    return this.httpRequest.post(`${this.API_URL}api/student-strength-report/`, payload, {
      responseType: 'text'  // Important: Expecting HTML response
    });
  }
  downloadStudentStrengthReport(payload: any, format: string){
    return this.httpRequest.post(`${this.API_URL}api/student-strength-report/${format}`, payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  
  generateStudentMonthlyReport(payload?: any){
    return this.httpRequest.post(this.API_URL+"api/monthly/report/genrate-report", payload);
  }

  getMonthlyReportList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/monthly/report/get-monthly-report-list", payload);
  }

  getStudentMonthlyReportList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/monthly/report/stdudent-list/"+payload.id, payload);
  }

  downloadStudentMonthlyReport(id?: any, payload?: any){
    return this.httpRequest.post(this.API_URL+"api/monthly/report/download-monthly-report/"+id, payload, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deleteStudentMonthlyReport(reportId?: any, studentId?: any){
    const suffix = studentId ? reportId + "/" + studentId : reportId;
    return this.httpRequest.post(this.API_URL+"api/monthly/report/delete-monthly-report/"+ suffix , []);
  }

  getSectionWiseFeesReport(data:any){
    return this.httpRequest.post(`${this.API_URL}api/section-wise-fees-report`, data);
  }

  downloadSectionWiseFeesReport(payload?: any,format?:any){
    return this.httpRequest.post(`${this.API_URL}api/section-wise-fees-report/${format}`, payload, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  studentMonthlyYearlyAttendanceReport(payload: any){
    return this.httpRequest.post(this.API_URL + "api/monthly-yearly/student-attendance-details",payload)
  }
  studentMonthlyYearlyAttendanceReportDownload(payload: any,format:string){
    return this.httpRequest.post(`${this.API_URL}api/monthly-yearly/student-attendance-details/${format}`, payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
  
  getStudentBlankReport(payload: any){
    return this.httpRequest.post(this.API_URL+"api/get/student-blank-report", payload, {
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getBlankReportType(){
    return this.httpRequest.post(this.API_URL+"api/get/reports-list",{});
  }

  getFeesCategoryMonth(data:any){
    return this.httpRequest.post(this.API_URL+"api/get-fees-category-month",data);
  }

  /**
   * Get Wallet Minus Report (HTML, PDF, Excel)
   * @param payload - report filter payload
   * @param format - '', 'pdf', or 'excel'
   */
  getWalletMinusReport(payload: any) {
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.WALLET_MINUS_REPORT}`,payload,{
      observe: 'response',
      responseType: 'text'
    });
  }

  downloadWalletMinusReport(payload: any, format: any) {
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.WALLET_MINUS_REPORT}${format == 'pdf' ? '/pdf' : format == 'excel' ? '/excel' : ''}` ,payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}

