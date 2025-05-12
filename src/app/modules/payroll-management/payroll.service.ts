import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private API_URL = enviroment.apiUrl;
  constructor(private httpRequest: HttpClient) { }

  getUserList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/payroll/user/user-list',payload);   
  }

  addUpdateSalary(payload:any){
    return this.httpRequest.post(this.API_URL+'api/payroll/user/salary',payload);
  }

  getSalaryDetails(payload:any){    
    return this.httpRequest.post(this.API_URL+'api/payroll/user/get-salary-detail',payload);
  }

  getCodeList(){  
    return this.httpRequest.post(this.API_URL+'api/payroll-category/getpayrolllist-with-opearots',{});  
  }

  validateFormula(formula:any){  
    return this.httpRequest.post(this.API_URL+'api/payroll-category-formula/validate',{formula_value:formula});  
  }  

  addPayrollCategory(payload:any,id:any=null){
    let url = 'api/payroll-category/store';
    if(id != null && id != 0){
        url = 'api/payroll-category/update/'+id; 
    }
    return this.httpRequest.post(this.API_URL+url,payload);
  }  

  deletePayrollCategory(id:any){
    return this.httpRequest.get(this.API_URL+'api/payroll-category/delete/'+id);
  }

  getPayslipList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/payslip/list',payload);   
  }

  payslipApprove(paradata:any,id:any) {       
    return this.httpRequest.post(this.API_URL+'api/payslip/approve/'+id,paradata);
  }

  
  payslipReject(paradata:any,id:any) {
    return this.httpRequest.put(this.API_URL+'api/payslip/payroll/salary-slip/reject/'+id,paradata);
  }

  approveAllPayslip(selectedPayslip:any) {
    return this.httpRequest.post(this.API_URL+'api/payslip/approve',{selectedPayslip:selectedPayslip});
  }

  rejectAllpayslip(paradata:any) {
    return this.httpRequest.post(this.API_URL+'api/payslip/reject',paradata);
  }
  deleteAllPayslip(selectedPayslip:any) {
    return this.httpRequest.post(this.API_URL+'api/payslip/delete',{selectedPayslip:selectedPayslip});
  }
  
  getPayrollCategoryList(param:any){
    return this.httpRequest.post(this.API_URL+'api/payroll-category/list',param);
  }

  getPayrollCategory(id:any){
    return this.httpRequest.get<DataTablesResponse>(this.API_URL+'api/payroll-category/edit/'+id);   
  }

  getEarningList(){
    return this.httpRequest.post(this.API_URL+'api/payrollgroup/payrollgroup/earning-list',{});   
  }

  getDeductionList(){
    return this.httpRequest.post(this.API_URL+'api/payrollgroup/payrollgroup/deduction-list',{});   
  }

  addUpdatePayrollGroup(payload:any,id:any=null){
    let url = 'api/payrollgroup/payrollgroup/create';
    if(id != null && id != 0){
        url = 'api/payrollgroup/payrollgroup/update/'+id; 
    }
    return this.httpRequest.post(this.API_URL+url,payload);
  }    

  getPayrollGroupList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/payrollgroup/payrollgroup',payload);   
  }  

  deletePayrollGroup(id:any){
    return this.httpRequest.post(this.API_URL+'api/payrollgroup/delete/'+id,{});
  }

  getPayrollGroup(id:any){
    return this.httpRequest.post(this.API_URL+'api/payrollgroup/payrollgroup/show/'+id,{});   
  }

  getPayrollDropDownList(){
    return this.httpRequest.post(this.API_URL+'api/assign-payroll-group/payrollgroup',{});
  }

  assignPayrollGroup(payload:any,id:any=null){
    let url = 'api/assign-payroll-group/create';
    if(id != null && id != 0){
        url = 'api/assign-payroll-group/update/'+id; 
    }
    return this.httpRequest.post(this.API_URL+url,payload);
  } 

  getAssignPayrollGroup(id:any){
    return this.httpRequest.post(this.API_URL+'api/assign-payroll-group/show',{role_id:id});
  }
  getAssignedPayrollGroupList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/assign-payroll-group/list',payload);   
  }  

  checkPayrollGroupAssigned(payload:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/check-payroll-group-assigned',payload);   
  }

  generatePayslip(payload:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/generate-payslip',payload);
  }

  storePayslip(payload:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/store-payslip-data',payload,{
      observe: 'response',
      responseType: 'blob' as 'json'
    });   
  }

  viewPayslip(id:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/view-payslip/'+id,{},{
      observe: 'response',
      responseType: 'blob' as 'json'
    });  
  }

  deletePayslip(id:any){
    return this.httpRequest.get(this.API_URL+'api/payslip/delete/'+id);
  }

  getPayslipListForStaff(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/payslip/payslip-for-staff-list',payload);   
  }

  viewPayslipForStaff(id:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/view-payslip-for-staff/'+id,{},{
      observe: 'response',
      responseType: 'blob' as 'json'
    });  
  }  

  getAttendanceList(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/payroll-attendance/user/attendance',payload);   
  }

  getMonthwiseList(payload:any){    
    return this.httpRequest.post(this.API_URL+'api/payslip/get-monthwise-list',payload);
  }  

  getRoleList(){
    return this.httpRequest.post(this.API_URL+'api/payslip/role-list',{});
  }  
  getFieldList(id:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/field-list',{payroll_group_id:id});
  }

  getUseListWithCalculation(payload:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/payslip/payroll-calculation-user-list',payload);   
  }

  generatePayslipBulk(payload:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/generate-payslip-in-bulk',payload);   
  }

  updateMonthlyPayrollAttendance(payload:any){
    return this.httpRequest.post(this.API_URL+'api/payroll-attendance/update-monthly-user-attendance',payload);   
  }
  
  getMonthlyWorkinDays(payload:any){    
    return this.httpRequest.post(this.API_URL+'api/payroll-attendance/get-monthly-working-day',payload);
  } 
  
  updateMonthlyWorkinDays(payload:any){    
    return this.httpRequest.post(this.API_URL+'api/payroll-attendance/update-monthly-working-day',payload);
  }   

  getDropdownUserList(){
    return this.httpRequest.post(this.API_URL+'api/payslip/user-list',{});
  }
  getDropdownPayrollList(){
    return this.httpRequest.post(this.API_URL+'api/assign-payroll-group/payrollgroup',{});
  }
  
  viewAllPayslip(date:any){
    return this.httpRequest.post(this.API_URL+'api/payslip/view-all-payslip',{date:date},{
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
