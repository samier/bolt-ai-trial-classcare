import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiVersions } from 'src/app/common-config/static-value';
import { apiUrlConstants } from 'src/app/shared/constants/apiUrl-constants';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class FeesService {
  private API_URL = enviroment.apiUrl;
  private NEW_API_URL = enviroment.newApiUrl;

  constructor(private httpRequest: HttpClient) { }

  getBranchId(){
      return window.localStorage.getItem("branch");
  }


  addDiscountType(payload:any,id:any=null){
    let api_url = this.API_URL+'api/discount-type';
    if(id != null && id != 0){
      api_url = this.API_URL+'api/discount-type/'+id;
      return this.httpRequest.put(api_url,payload);
    }
    return this.httpRequest.post(api_url,payload);
  }

  getAuthorityList(){
    return this.httpRequest.post(this.API_URL+'api/discount-type/get-authority-list',{});
  }

  //api/discount-type/get-authority-list
  getDiscountTypeList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/discount-type/list',payload);
  }

  //leave type functions
  getLeaveTypeList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/leave-type/leave-type-list',params);
  }

  deleteDiscountType(id:any){
    return this.httpRequest.delete(this.API_URL+'api/discount-type/'+id);
  }

  getClassList(){
    return this.httpRequest.post(this.API_URL+'api/import/get-class-list',{});
  }

  getBatchListByClassId(class_id:any){
    return this.httpRequest.post(this.API_URL+'api/import/get-batch-list-by-class-id',{class_id:class_id});
  }
  getStudentListByBatchId(batch_id:any){
    return this.httpRequest.post(this.API_URL+'api/student-discount/student-list',{batch_id:batch_id});
  }

  getStudentList(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/student-list', data);
  }

  getStudentDiscountList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/student-discount/list',payload);
  }

  getFeesTypes(data:any){
    return this.httpRequest.post(this.API_URL+'api/student-discount/fees-type-list',data);
  }

  getFeesTypeMonths(type:any,class_id:any,fees_type_id:any,student_id:any){

    let payload = {
      "fees_type_id":fees_type_id,
      "type":type,
      "class_id":class_id,
      "student_id":student_id
  };

    return this.httpRequest.post(this.API_URL+'api/student-discount/fees-month-list',payload);
  }

  getDiscountTypeListDropdown(){
    return this.httpRequest.post(this.API_URL+'api/student-discount/discount-type-list',{});
  }

  addStudentDiscountForm(payload:any){
    return this.httpRequest.post(this.API_URL+'api/student-discount',payload);
  }

  deleteStudentDiscount(id:any){
    return this.httpRequest.delete(this.API_URL+'api/student-discount/'+id);
  }

  getStudentDiscountDetail(id:number){
    return this.httpRequest.get(this.API_URL+'api/student-discount/'+id);
  }

  addRefundType(payload:any){
    return this.httpRequest.post(this.API_URL+'api/refund-type',payload);
  }

  saveFeesReceiptNo(params:any){
    return this.httpRequest.post(this.API_URL+'api/save-fees-receipt-no',params);
  }

  getFeesReceiptNo(id:any){
    return this.httpRequest.post(this.API_URL+'api/get-fees-receipt-no/'+id, []);
  }

  getDiscountTypeDetail(id:number){
    return this.httpRequest.get(this.API_URL+'api/discount-type/'+id);
  }

  getAssignedFeesStudent(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/get-assigned-fees-student', params);
  }

  assignOptionalFees(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/assign-optional-fees', data);
  }

  updateAssignOptionalFees(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/update-assign-optional-fees', data);
  }

  deleteAssignedFeesStudent(id:any){
    return this.httpRequest.delete(this.API_URL+'api/fees-category/delete-assigned-fees-student/'+id);
  }

  deleteAssignedFeesAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/delete-attachment/'+id, []);
  }

  getSchoolList()
  {
    return this.httpRequest.post(this.API_URL+'api/school-name/list',{});
  }

  getSectionList(sections:any)
  {
    return this.httpRequest.post(this.API_URL+'api/section/list',sections);
  }

  getSections(data:any){
    return this.httpRequest.post(this.API_URL+'api/filter/get-section-list', data);
  }
  getBranch(){
    return window.localStorage.getItem("branch");
  }

  getClasses(section?:any){
    const data = {
      section : section,
    }
    return this.httpRequest.post(this.API_URL+'api/fees/get-classes',data);
  }

  getBatchesList(params:any){
    Object.assign(params,{branchId:this.getBranchId()});
    return this.httpRequest.post(this.API_URL+'api/get-batches-by-classes',params);
  }

  getOptionalFees(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/get-optional-fees', params);
  }

  getAcademicYear(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.get(this.API_URL +  'api/get-academic-year/' + this.getBranchId())
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  searchStudent(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL +  'api/student-list', payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  getStudentFeesHistory(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL +  'api/student/get-fees-history-datatable', payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  saveStudentRefund(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL +  'api/student/fees-refund-store', payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  fetchFeesRefundHistory(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.httpRequest.post(this.API_URL +  'api/student/fees-refund-history', payload)
      .subscribe({
        next: (data) => resolve(data),
        error: (e) => reject(e),
        complete() {
          console.log("is completed");
        },
      })
    });
  }

  deleteRefund(refundId:any,params:any){
    return this.httpRequest.post(this.API_URL+'api/student/delete-fees-refund/'+refundId, params);
  }

  getTrustDetail(){
    return this.httpRequest.get(this.API_URL+'api/fees-category/get-trust-list');

  }

  getBranchList(){
    return this.httpRequest.get(this.API_URL+'api/branch-list');
  }

  sectionList(data?:any){
    return this.httpRequest.post(this.API_URL+'api/section-list', data);
  }

  getFeesCategory(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees-receipt/fee-categories', data);
  }

  getFeesReceiptList(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-fees-receipt-list', data);
  }

  updateFeesReceiptNo(data:any, id:any){
    return this.httpRequest.post(this.API_URL+'api/update-fees-receipt/'+id, data);
  }

  deleteFeesReceiptNo(id:any){
    return this.httpRequest.post(this.API_URL+'api/delete-fees-receipt/'+id, []);
  }

  getFeesDetails(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/get-fees-details',params);
  }

  collectFees(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/collect-fees',params);
  }

  feesReceiptList(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/fees-receipt-list',params);
  }

  deleteOrCancelFees(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/delete-or-cancel-fees',params);
  }

  feesAttachments(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/fees-attachments',params);
  }

  feesRefundAttachments(params:any){
    return this.httpRequest.post(this.API_URL+'api/student/fees-refund-attachments',params);
  }

  deleteRefundAttachement(params:any){
    return this.httpRequest.post(this.API_URL+'api/student/delete-fees-refund-attachments',params);
  }

  deleteAttachement(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/delete-fees-attachments',params);
  }

  feesHistory(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/fees-history',params);
  }

  edit(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/fees-edit',params);
  }

  feesReceipt(params:any){
    return this.httpRequest.post(this.API_URL+'api/fees/fees-receipt',params,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  getUsers(params:any = null){
    return this.httpRequest.post(this.API_URL+'api/fees/users-list',params);
  }

  getPaymentModes(params:any = null){
    return this.httpRequest.post(this.API_URL+'api/fees/get-payment-modes',params);
  }

  getReportPermissionModes(params:any = null){
    return this.httpRequest.post(this.API_URL+'api/fees/get-report-permission-modes',params);
  }

  getReceiptPermissionModes(params:any = null){
    return this.httpRequest.post(this.API_URL+'api/fees/get-recipt-permission-modes',params);
  }
  
  getPermissionsList(params:any = null){
    return this.httpRequest.post(this.API_URL+'api/fees/get-permissions-list',params);
  }

  getFeesReceiptDayWiseReport(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-fees-receipt-day-wise-report', data);
  }

  discountApplicableStudentList(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/discount-applicable-student-list', data);
  }

  generateDiscountReceipt(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/generate-discount-receipt', data);
  }
  
  generateDiscountReceiptDatatable(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/generate-discount-receipt-datatable', data);
  }
  
  generateDiscountReceiptLog(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/generate-discount-receipt-log', data);
  }

  getFeesReceiptDayWiseReportPdf(data:any){
    return this.httpRequest.post(this.API_URL+'api/get-fees-receipt-day-wise-report/pdf', data,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  createBank(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/bank/create', data);
  }
  deleteBank(id:any){
    return this.httpRequest.post(this.API_URL+'api/fees/bank/delete/'+id, []);
  }

  // student bulk discount
  getAppliedDiscounts(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/index', data);
  }

  getAppliedDiscountsLogs(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/log', data);
  }

  studentList(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/student-list', data);
  }

  getFeesCategories(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/fees-categories', data);
  }

  getFeesCategoryMonths(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/fees-category-months', data);
  }

  applyStudentBulkDiscount(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/apply-discount', data);
  }
  
  updateStudentBulkDiscount(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/update-discount/'+data.id, data);
  }

  deleteStudentBulkDiscount(id:any){
    return this.httpRequest.post(this.API_URL+'api/fees/student-bulk-discount/delete-discount/'+id, []);
  }

  optionalFeesLogList(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/optional-fees-log', data);
  }

  optionalFeesStudentLogList(data:any){
    return this.httpRequest.post(this.API_URL+'api/fees-category/optional-fees-student-log', data);
  }
  // DASHBOARD

  getFeesDetailsForDashboard(data){
    return this.httpRequest.post(this.API_URL+'api/dashboard/fees-details', data);
  }

  getFeesCollection(payload) {
    return this.httpRequest.post(`${this.API_URL}api/dashboard/fees-details-amount-type`, payload);
  }

  getFeesRefund(payload) {
    return this.httpRequest.post(`${this.API_URL}api/dashboard/refund-details-amount-type`, payload);
  }

  getDashboardYear() {
    return this.httpRequest.get(`${this.API_URL}api/dashboard/academic-year-list`);
  }

  getDashboardBranch() {
    return this.httpRequest.get(`${this.API_URL}api/get-branch-list`);
  }

  getFeesReportData(payload) {
    return this.httpRequest.post(`${this.API_URL}api/fees/fees-report`,payload);
  }
  
  getFeeCategoryDetails(payload: any){
    return this.httpRequest.post(`${this.API_URL}api/fees-reminder/get-fees-category-details`, payload);
  }

  getFeesCategoryList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/fees-category/index", payload)
  }

  saveOrUpdateAutoFeeReminder(payload: any){
    if(payload.id){
      return this.httpRequest.post(this.API_URL+"api/fees-reminder/update/"+payload.id, payload)
    }else{
      return this.httpRequest.post(this.API_URL+"api/fees-reminder/store", payload);
    }
  }

  getAutoFeeReminderList(payload: any){
    return this.httpRequest.post(this.API_URL+"api/fees-reminder", payload);
  }

  getAutoFeeReminderById(id: any){
    return this.httpRequest.post(this.API_URL+"api/fees-reminder/show/"+id, []);
  }

  deleteAutoFeeReminder(id: any){
    return this.httpRequest.post(this.API_URL+"api/fees-reminder/delete/"+id, []);
  }

  saveChequeDetails(payload: any){
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${payload?.id ? apiUrlConstants.COLLECT_CHEQUE_DETAIL_UPDATE : apiUrlConstants.COLLECT_CHEQUE_DETAIL_CREATE}`, payload);
  }

  getChequeDetailsById(id: any){
    return this.httpRequest.get(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.COLLECT_CHEQUE_DETAIL_EDIT}/${id}`);
  }

  getChequeList(payload: any){
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.COLLECT_CHEQUE_DETAIL_LIST}`, payload);
  }

  deleteChequeDetails(id: any){
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.COLLECT_CHEQUE_DETAIL_DELETE}`, {id});
  }

  getChequeListByStudent(payload: any){
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.STUDENT_CHEQUE_LIST}`, payload);
  }

  downloadChequeReport(payload: any, format: any){
    return this.httpRequest.post(`${this.NEW_API_URL}${apiVersions.v1}${apiUrlConstants.CHEQUE_REPORT}/${format}`, payload, {
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
