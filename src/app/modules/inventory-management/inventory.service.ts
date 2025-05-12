import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private API_URL = enviroment.apiUrl;
  protected data:any;
  public branch_id  = window.localStorage?.getItem("branch");

  constructor(private httpRequest: HttpClient) { }

  addItemType(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory-item-type/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/inventory-item-type/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }

  ItemTypeList(params:any){
      return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory-item-type/index',params);
  }  

  getDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-item-type/get/'+id,{});
  }

  delete(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-item-type/delete/'+id,{});
  }

  addStore(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory-store/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/inventory-store/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }

  StoreList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory-store/index',params);
  }  

  getStoreDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-store/get/'+id,{});
  }

  deleteStore(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-store/delete/'+id,{});
  }  

  addVendor(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory-vendor/store';    
    console.log(record_id);
    console.log("tset");
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/inventory-vendor/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);

  }

  vendorList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory-vendor/index',params);
  }  

  getVendorDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor/get/'+id,{});
  }

  deleteVendor(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor/delete/'+id,{});
  }  

  VendorItemList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory-vendor-item/index',params);
  }  
  addVendorItem(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory-vendor-item/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/inventory-vendor-item/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }

  getStatesAndCities(){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor/get-states-and-cities',{});    
  }

  getItemTypeList(){
    return this.httpRequest.post(this.API_URL+'api/inventory-item-type/list',{});
  }
  getItemTypeListByVendor(data:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-item-type/list-by-vendor',data);
  }
  getVendorTypeList(){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor/list',{});
  }
  getMeasurementTypeList(){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor/measurement-type-list',{});
  }
  getStoreTypeList(){
    return this.httpRequest.post(this.API_URL+'api/inventory-store/list',{});
  }
  getVendorItemDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor-item/get/'+id,{});
  }

  deleteVendorItem(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-vendor-item/delete/'+id,{});
  }

  addItem(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/inventory/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }  
  getItemList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory/index',params);
  }  
  getInventoryItemDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory/get/'+id,{});
  }
  deleteItem(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory/delete/'+id,{});
  }

  deleteItemAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory/delete-attachment/'+id,{});
  }

  addPurchaseOrder(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory-purchase-details/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/inventory-purchase-details/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  } 
  getPurchaseDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-purchase-details/get/'+id,{});
  }
  getPurchaseList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory-purchase-details/index',params);
  }  
  deletePurechaseOrder(id:any){
    return this.httpRequest.post(this.API_URL+'api/inventory-purchase-details/delete/'+id,{});
  }

  getInventoryList(){
    return this.httpRequest.post(this.API_URL+'api/inventory/list',{});
  }

  addRequisition(payload:any,record_id:any){
    let url = this.API_URL+'api/requisition/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/requisition/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }  

  addRequisitionForFaculty(payload:any,record_id:any){
    let url = this.API_URL+'api/requisition/store-faculty'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/requisition/update-faculty/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }  

  getRequisitionDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/requisition/show/'+id,{});
  }

  getUserList(){
    return this.httpRequest.post(this.API_URL+'api/requisition/userlist',{});
  }

  getStudentList(){
    return this.httpRequest.post(this.API_URL+'api/requisition/student-list',{});
  }

  getLocationList(){
    return this.httpRequest.post(this.API_URL+'api/requisition/location-list',{});
  }

  getRequisitionList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/requisition/index',params);
  } 
  
  getRequisitionListForFaculty(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/requisition/index',params);
  } 
  
  getRequisitionFullDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/requisition/show-requisition/'+id,{});
  }
  approveOrRejectRequisition(payload:any){    
    return this.httpRequest.post(this.API_URL+'api/requisition/approve-or-reject',payload);
  }
  deleteRequisition(id:any){
    return this.httpRequest.post(this.API_URL+'api/requisition/delete/'+id,{});
  }
  setRequisitionApprover(payload:any){
    return this.httpRequest.post(this.API_URL+'api/requisition/requisition-setting',payload);
  }
  getRequisitionApprover(){
    return this.httpRequest.post(this.API_URL+'api/requisition/get-requisition-setting',{});
  }

  getPaymentTypeList(){
    return this.httpRequest.post(this.API_URL+'api/purchase-order/payment-list',{});
  }

  getRequsitionList(){
    return this.httpRequest.post(this.API_URL+'api/requisition/requisition-list',{});
  }

  getRequsitionListByVendor(data:any){
    return this.httpRequest.post(this.API_URL+'api/requisition/requisition-list-by-vendor',data);
  }

  addPO(payload:any,record_id:any){
    let url = this.API_URL+'api/purchase-order/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/purchase-order/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  } 

  getPurchaseOrderList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/purchase-order/index',params);
  }  

  getPurchaseOrderDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-order/show/'+id,{});
  }

  getPOFullDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-order/show-purchase-order/'+id,{});
  }

  deletePurchaseOrder(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-order/delete/'+id,{});
  }
  downloadPurchaseOrder(id:any){
    //return this.httpRequest.post(this.API_URL+'api/purchase-order/pdf/'+id,{});
    return this.httpRequest.post(this.API_URL+'api/purchase-order/pdf/'+id,{},{
      observe: 'response',
      responseType: 'blob' as 'json'
    });
  }

  deletePurchaseOrderAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-order/delete-attachment/'+id,{});
  }

  getPurchaseOrderNo(){
    return this.httpRequest.post(this.API_URL+'api/purchase-order/get-purchase-order-no',{});
  }

  getPurchaseOrderDropdownList(data?:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/purchase-order-list',data);
  }

  getPurchaseOrderDetailDropdownList(data:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/purchase-order-detail-list',data);
  }

  getInvoiceNo(){
    return this.httpRequest.post(this.API_URL+'api/invoice/get-invoice-no',{});
  }

  addInvoice(payload:any,record_id:any){
    let url = this.API_URL+'api/invoice/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/invoice/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  } 
  
  getInvoiceOrderDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/show/'+id,{});
  }

  getInvoiceOrderList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/invoice/index',params);
  }  

  deleteAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/delete-attachment/'+id,{});
  }

  deleteInvoice(id:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/delete/'+id,{});
  }

  getInvoiceFullDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/view/'+id,{});
  }

  getInvoiceOrderDropdownList(){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/invoice-list',{});
  }

  getInvoiceListByPo(data:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/get-invoice-list-by-po',data);
  }

  getInvoiceDetails(data:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/get-invoice-details',data);
  }

  getPurchaseOrderListForReturn(){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/purchase-order-list',{});
  }

  getInvoiceDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/invoice/show/'+id,{});
  }  

  addPurchaseReturn(payload:any,record_id:any){
    let url = this.API_URL+'api/purchase-return/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/purchase-return/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }   

  getPurchaseReturnDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/show/'+id,{});
  }  

  getPurchaseReturnList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/purchase-return/index',params);
  }  

  deletePurchaseReturn(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/delete/'+id,{});
  }  

  deletePurchaseReturnAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/purchase-return/delete-attachment/'+id,{});
  }  

  addInternalIssue(payload:any,record_id:any){
    let url = this.API_URL+'api/internal-issue/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/internal-issue/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  } 
   
  getRequisitionDetailWithAvilableQty(id:any){
    return this.httpRequest.post(this.API_URL+'api/requisition/show-with-available-qty/'+id,{});
  }

  getInternalIssueDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/show/'+id,{});
  }  

  getKitItems(data:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/get-kit-details',data);
  }

  getInternalIssueList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/internal-issue/index',params);
  }

  deleteInternalIssue(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/delete/'+id,{});
  }  

  deleteInternalIssueAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/delete-attachment/'+id,{});
  }  

  getInternalIssueNo(){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/get-issue-no',{});
  }

  addInternalIssueReturn(payload:any,record_id:any){
    let url = this.API_URL+'api/internal-issue-return/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/internal-issue-return/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  } 

  getInternalIssueReturnList(data:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue-return/index',data);
  }

  showInternalIssueReturn(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue-return/show/'+id,{});
  }

  deleteInternalIssueReturn(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue-return/delete/'+id,{});
  }  

  deleteInternalIssueReturnAttachment(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue-return/delete-attachment/'+id,{});
  }  
  
  fetchItemList(item_type:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/item-list',{'item_type_id':item_type});
  }

  fetchItemListWithAvailableItem(item_type:any){
    return this.httpRequest.post(this.API_URL+'api/discard-details/item-list',{'item_type_id':item_type});
  }  

  
  getInternalIssueDropdownList(){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/internal-issue-dropdown',{});
  }  

  getInternalIssueDropdownListForEdit(){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/internal-issue-dropdown-for-edit',{});
  }  

  getInternalIssueItemList(id:any){
    return this.httpRequest.post(this.API_URL+'api/internal-issue/show-with-available-item/'+id,{});
  }  

  getDiscardItemTypeList(){
    return this.httpRequest.post(this.API_URL+'api/discard-details/discard-item-type-list',{});
  }
  
  addDiscardItems(payload:any,record_id:any){
    let url = this.API_URL+'api/discard-details/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/discard-details/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }

  getDescardItemDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/discard-details/get/'+id,{});
  }

  getDiscardItemList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/discard-details/index',params);
  }    

  deleteDiscardItems(id:any){
    return this.httpRequest.post(this.API_URL+'api/discard-details/delete/'+id,{});
  }  

  getDiscardFullDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/discard-details/show-discard-details/'+id,{});
  }  

  getAvailableItem(id:any){
    return this.httpRequest.post(this.API_URL+'api/stock-adjustment/get-available-item/'+id,{});
  }  

  addStockAdjustment(payload:any,record_id:any){
    let url = this.API_URL+'api/stock-adjustment/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/stock-adjustment/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }  

  getStockAdjustmentDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/stock-adjustment/get/'+id,{});
  }  

  getStockAdjustmentList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/stock-adjustment/index',params);
  }   

  getStockAdjustmentFullDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/stock-adjustment/show-details/'+id,{});
  }    

  deleteStockAdjustment(id:any){
    return this.httpRequest.post(this.API_URL+'api/stock-adjustment/delete/'+id,{});
  }    

  addKit(payload:any,record_id:any){
    let url = this.API_URL+'api/item-kit/store'; 
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/item-kit/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }   

  getKitListDropdown(){
    return this.httpRequest.post(this.API_URL+'api/item-kit/list',{});
  }
  
  getKit(id:any){
    return this.httpRequest.post(this.API_URL+'api/item-kit/get/'+id,{});
  }   

  getKitList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/item-kit/index',params);
  } 

  getKitFullDetail(id:any){
    return this.httpRequest.post(this.API_URL+'api/item-kit/show-details/'+id,{});
  }  

  deleteKit(id:any){
    return this.httpRequest.post(this.API_URL+'api/item-kit/delete/'+id,{});
  }   

  getItemSummaryList(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/inventory/item-list',params);
  }  

  getStudentStoreTypeList(){
    return this.httpRequest.post(this.API_URL+'api/inventory-store/list2',{});
  }
  getStudentListForStudent(){
    return this.httpRequest.post(this.API_URL+'api/inventory/students-list',{});
  }

  getItemTypeListForStudent(){
    return this.httpRequest.post(this.API_URL+'api/inventory-item-type/item-type-list',{});
  }

  fetchItemListForStudent(item_type:any){
    return this.httpRequest.post(this.API_URL+'api/inventory/get-item-list',{'item_type_id':item_type});
  }    

  addRequisitionForStudent(payload:any,record_id:any){
    let url = this.API_URL+'api/inventory-requisition/student-store';     
    if(record_id != 0 && record_id != null){
      url = this.API_URL+'api/requisition-for-student/update/'+record_id; 
    }
    return this.httpRequest.post(url,payload);
  }  
  
  getRequisitionDetailForStudent(id:any){
    return this.httpRequest.post(this.API_URL+'api/requisition-for-student/show/'+id,{});
  }  

  getRequisitionListForStudent(params:any){
    return this.httpRequest.post<DataTablesResponse>(this.API_URL+'api/requisition-for-student/index',params);
  }  

  getRequisitionFullDetailForStudent(id:any){    
    return this.httpRequest.post(this.API_URL+'api/show-requisition-for-student/'+id,{});
  }  


  getExpenseHeadList(){
    return this.httpRequest.post(this.API_URL+'api/head/list/expense', []);
  }
}

class DataTablesResponse {
  data: any = [];
  draw: number = 0;
  recordsFiltered: number = 0;
  recordsTotal: number = 0;
}