import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemComponent } from './item/item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { RouterModule, Routes } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ItemFormComponent } from './item-form/item-form.component';
import { ItemListComponent } from './item-list/item-list.component';
import { StoreComponent } from './store/store.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { AddItemVendorComponent } from './add-item-vendor/add-item-vendor.component';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { RequisitionFormComponent } from './requisition-form/requisition-form.component';
import { RequisitionListComponent } from './requisition-list/requisition-list.component';
import { InventorySettingsComponent } from './inventory-settings/inventory-settings.component';
import { PurchaseOrderFormComponent } from './purchase-order-form/purchase-order-form.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { PurchaseReturnComponent } from './purchase-return/purchase-return.component';
import { PurchaseReturnListComponent } from './purchase-return-list/purchase-return-list.component';
import { InternalIssueFormComponent } from './internal-issue-form/internal-issue-form.component';
import { InternalIssueListComponent } from './internal-issue-list/internal-issue-list.component';
import { InternalIssueReturnFormComponent } from './internal-issue-return-form/internal-issue-return-form.component';
import { InternalIssueReturnListComponent } from './internal-issue-return-list/internal-issue-return-list.component';
import { DiscardItemListComponent } from './discard-item-list/discard-item-list.component';
import { DiscardItemFormComponent } from './discard-item-form/discard-item-form.component';
import { StockAdjustmentFormComponent } from './stock-adjustment-form/stock-adjustment-form.component';
import { StockAdjustmentListComponent } from './stock-adjustment-list/stock-adjustment-list.component';
import { KitListComponent } from './kit-list/kit-list.component';
import { KitFormComponent } from './kit-form/kit-form.component';
import { ItemSummaryComponent } from './item-summary/item-summary.component';
import { FacultyRequisitionComponent } from './faculty-requisition/faculty-requisition.component';
import { FacultyRequisitionListComponent } from './faculty-requisition-list/faculty-requisition-list.component';
import { PermissionGuard } from 'src/app/service/permission.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { PurchaseOrderInvoiceFormComponent } from './purchase-order-invoice-form/purchase-order-invoice-form.component';
import { PurchaseOrderInvoiceListComponent } from './purchase-order-invoice-list/purchase-order-invoice-list.component';

const routes: Routes = [

  //item type
  {
    path: 'item-type',
    component: ItemComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_inventory_item_list', permission: 'has_create'}
  },

  //inventory items
  {
    path: 'item-list',
    component: ItemListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_inventory_item_list', permission: 'has_access'}
  },
  {
    path: 'item-form',
    component: ItemFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_inventory_item_list', permission: 'has_create'}
  },
  {
    path: 'item-form/:id',
    component: ItemFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_inventory_item_list', permission: 'has_edit'}
  },


  {
    path: 'warehouse',
    component: StoreComponent,
    pathMatch: 'full',
  },  

  
  //vendors
  {
    path: 'vendor-form',
    component: VendorFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_vendor_list', permission: 'has_create'}
  }, 
  {
    path: 'vendor-form/:id',
    component: VendorFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_vendor_list', permission: 'has_create'}
  }, 
  {
    path: 'vendor-list',
    component: VendorListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_vendor_list', permission: 'has_access'}
  },  
  {
    path: 'add-item-vendor/:id',
    component: AddItemVendorComponent,
    pathMatch: 'full',
  },  
  {
    path: 'add-purchase/:id',
    component: PurchaseFormComponent,
    pathMatch: 'full',
  },  
  {
    path: 'purchase-list/:id',
    component: PurchaseListComponent,
    pathMatch: 'full',
  }, 

  //requisition
  {
    path: 'requisition-form',
    component: RequisitionFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_requisition_list', permission: 'has_create'}
  }, 
  {
    path: 'requisition-form/:id',
    component: RequisitionFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_requisition_list', permission: 'has_create'}
  }, 
  {
    path: 'requisition-list',
    component: RequisitionListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_requisition_list', permission: 'has_access'}
  },  


  {
    path: 'inventory-settings',
    component: InventorySettingsComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_inventory_setting', permission: 'has_create'}
  },  

  //purchase order
  {
    path: 'purchase-order-form',
    component: PurchaseOrderFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_order_list', permission: 'has_create'}
  }, 
  {
    path: 'purchase-order-form/:id',
    component: PurchaseOrderFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_order_list', permission: 'has_create'}
  }, 
  {
    path: 'purchase-order-list',
    component: PurchaseOrderListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_order_list', permission: 'has_access'}
  },  


  //purchase order invoice verification
  {
    path: 'purchase-order-invoice',
    component: PurchaseOrderInvoiceFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_order_list', permission: 'has_create'}
  }, 
  {
    path: 'purchase-order-invoice/:id',
    component: PurchaseOrderInvoiceFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_order_list', permission: 'has_create'}
  }, 
  {
    path: 'purchase-order-invoice-list',
    component: PurchaseOrderInvoiceListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_order_list', permission: 'has_create'}
  }, 

  // {
  //   path: 'invoice-form/:id',
  //   component: InvoiceFormComponent,
  //   pathMatch: 'full',
  //   canActivate: [PermissionGuard],
  //   data: {moduleName: 'inventory_invoice_order_list', permission: 'has_create'}
  // }, 
  // {
  //   path: 'invoice-list',
  //   component: InvoiceListComponent,
  //   pathMatch: 'full',
  //   canActivate: [PermissionGuard],
  //   data: {moduleName: 'inventory_invoice_order_list', permission: 'has_access'}
  // }, 

  //purchase return 
  {
    path: 'purchase-return',
    component: PurchaseReturnComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_return_order_list', permission: 'has_create'}
  }, 
  {
    path: 'purchase-return/:id',
    component: PurchaseReturnComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_return_order_list', permission: 'has_create'}
  },   
  {
    path: 'purchase-return-list',
    component: PurchaseReturnListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_return_order_list', permission: 'has_access'}
  },       



  //item issue list
  {
    path: 'item-issue',
    component: InternalIssueFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_internal_issue_list', permission: 'has_create'}
  },  
  {
    path: 'item-issue/:id',
    component: InternalIssueFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_internal_issue_list', permission: 'has_create'}
  },
  {
    path: 'item-issue-list',
    component: InternalIssueListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_internal_issue_list', permission: 'has_access'}
  }, 


  //return issued item
  {
    path: 'item-issue-return-form',
    component: InternalIssueReturnFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_internal_issue_return_list', permission: 'has_create'}
  }, 
  {
    path: 'item-issue-return-form/:id',
    component: InternalIssueReturnFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_internal_issue_return_list', permission: 'has_create'}
  },  
  {
    path: 'item-issue-return-list',
    component: InternalIssueReturnListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_internal_issue_return_list', permission: 'has_access'}
  },  


  //discard Item
  {
    path: 'discard-item-form',
    component: DiscardItemFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_discard_item_list', permission: 'has_create'}
  },  
  {
    path: 'discard-item-form/:id',
    component: DiscardItemFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_discard_item_list', permission: 'has_create'}
  },  
  {
    path: 'discard-item-list',
    component: DiscardItemListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_discard_item_list', permission: 'has_access'}
  },  
  {
    path: 'stock-adjustment-form/:id',
    component: StockAdjustmentFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_adjust_stock_item_list', permission: 'has_create'}
  },  
  {
    path: 'stock-adjustment-list',
    component: StockAdjustmentListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_adjust_stock_item_list', permission: 'has_access'}
  }, 
  {
    path: 'kit-form',
    component: KitFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_kit_list', permission: 'has_create'}
  },
  {
    path: 'kit-form/:id',
    component: KitFormComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_kit_list', permission: 'has_create'}
  },  
  {
    path: 'kit-list',
    component: KitListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_kit_list', permission: 'has_access'}
  },  
  {
    path: 'item-summary',
    component: ItemSummaryComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_item_summary', permission: 'has_access'}
  }, 
  {
    path: 'faculty-requistion-form/:id',
    component: FacultyRequisitionComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_return_order_list', permission: 'has_create'}
  },  
  {
    path: 'faculty-requistion-list',
    component: FacultyRequisitionListComponent,
    pathMatch: 'full',
    canActivate: [PermissionGuard],
    data: {moduleName: 'inventory_purchase_return_order_list', permission: 'has_access'}
  },    
];

@NgModule({
  declarations: [
    ItemComponent,
    ItemFormComponent,
    ItemListComponent,
    StoreComponent,
    VendorFormComponent,
    VendorListComponent,
    AddItemVendorComponent,
    PurchaseFormComponent,
    PurchaseListComponent,
    RequisitionFormComponent,
    RequisitionListComponent,
    InventorySettingsComponent,
    PurchaseOrderFormComponent,
    PurchaseOrderListComponent,
    PurchaseReturnComponent,
    PurchaseReturnListComponent,
    InternalIssueFormComponent,
    InternalIssueListComponent,
    InternalIssueReturnFormComponent,
    InternalIssueReturnListComponent,
    DiscardItemListComponent,
    DiscardItemFormComponent,
    StockAdjustmentFormComponent,
    StockAdjustmentListComponent,
    KitListComponent,
    KitFormComponent,
    ItemSummaryComponent,
    FacultyRequisitionComponent,
    FacultyRequisitionListComponent,
    PurchaseOrderInvoiceFormComponent,
    PurchaseOrderInvoiceListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    DataTablesModule,
    RouterModule.forChild(routes),
    NgMultiSelectDropDownModule.forRoot(),
    SharedModule
  ]
})
export class InventoryManagementModule { }
