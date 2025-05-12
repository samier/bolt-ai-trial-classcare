import { DatePipe } from '@angular/common';
import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-student-requisition-list',
  templateUrl: './student-requisition-list.component.html',
  styleUrls: ['./student-requisition-list.component.scss']
})
export class StudentRequisitionListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  login_id:any=4;
  p: number = 1;
  is_admin = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  closeResult:any="";
  requisition_modal_data:any;
  reasonForRejection:any='';
  constructor(private inventorySerivce:InventoryService,private modalService: NgbModal){
  }
  URLConstants=URLConstants;
  

        /**
       * Write code on Method
       *
       * @return response()
       **/
        open(content:any,id:any) {
          this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
    
            //this.approve(id,2);
            let data = {id:id,status:2,reject_reason:this.reasonForRejection};          
            this.inventorySerivce.approveOrRejectRequisition(data).subscribe((res:any) => {      
              console.log(res); 
              this.reloadData();
            });                     
            console.log('saved');
            this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
            console.log('canceled');
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
        } 
          

      /// to display requisition informations
        open2(content:any,id:any) {
          this.inventorySerivce.getRequisitionFullDetailForStudent(id).subscribe((res:any) => {      
            this.requisition_modal_data=res.data;
            this.modalService.open(content, {centered:true,size:'lg',windowClass : "myCustomModalClass",ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
              let data = {id:id,status:2,reject_reason:this.reasonForRejection}        
              this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });                        
          });            
        } 

        /**
         * Write code on Method
         *
         * @return response()
         */
        private getDismissReason(reason: any): string {
          if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
          } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
          } else {
            return  `with: ${reason}`;
          }
        }

        approve(id:number,status:number){
          if(confirm("Are you sure, You want to approve the selected requisition ?")){
            let data = {id:id,status:status}
            this.inventorySerivce.approveOrRejectRequisition(data).subscribe((res:any) => {      
              console.log(res); 
              this.reloadData();
            }); 
          }
        }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX:true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id'}, 
        { data: 'requisition_date'}, 
        { data: 'user_name' }, 
        { data: 'store_name' }, 
        { data: 'required_by' }, 
        { data: 'priority' }, 
        { data: 'status' }, 
        { data: 'reaject_reason' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.inventorySerivce.getRequisitionListForStudent(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });

      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);      
    });
  }


  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }  

  delete(id:number){
    let c = confirm("Are you sure, You want to delete it ?");
    if(c){
      this.inventorySerivce.deleteRequisition(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
