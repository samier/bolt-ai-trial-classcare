import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { InventoryService } from '../inventory.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-internal-issue-return-list',
  templateUrl: './internal-issue-return-list.component.html',
  styleUrls: ['./internal-issue-return-list.component.scss']
})
export class InternalIssueReturnListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  login_id:any=4;
  p: number = 1;
  closeResult:any="";
  return_issue_data:any;
  reasonForRejection:any='';
  URLConstants=URLConstants;

  filter: any = false;
  filterCount: any = 0;
  filterForm: FormGroup | any;
  attachment:any = null

  userList:any = [];
  issueList:any = []

  
  constructor(private inventorySerivce:InventoryService,
    private modalService: NgbModal,
    public CommonService: CommonService,
    private toastr: Toastr,
    public dateFormateService: DateFormatService,
    private formBuilder: FormBuilder,
  ){
  }
  
  
  ngOnInit(): void {
    this.initForm();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: false,
      // scrollX:true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },      
     columns: [
        { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
        { data: 'issue_no', name:'internal_issue.issue_no' },
        { data: 'item_issue_for', name:'item_issue_for' },
        { data: 'name' },
        { data: 'issued_by_user' },
        { data: 'return_date' }, 
        { data: 'received_by_user' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
    this.getUserList();
    this.getInternalIssueDropdownList()
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {...dataTablesParameters, ...this.filterForm.value}
    this.inventorySerivce.getInternalIssueReturnList(dataTablesParameters).subscribe((resp:any) => {
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
      }, 100);
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
      this.inventorySerivce.deleteInternalIssueReturn(id).subscribe((res:any) => {      
        if(res.status){
          this.toastr.showSuccess(res.message);
        }else{
          this.toastr.showError(res.message);
        }
        this.reloadData();
      });             
    }
  }

  getInternalIssueDropdownList(){
    this.inventorySerivce.getInternalIssueDropdownList().subscribe((resp:any) => {
      if(resp.status){
        this.issueList = resp.data
      }
    })
  }

  getUserList(){
    this.inventorySerivce.getUserList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.userList = res.data.map((item:any)=>{
          return {id:item.id,name:item.full_name};      
        });
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
   }

   openAttachment(content: any, row: any) {
    this.attachment = {
      id: row.id,
      attachment_url: row.attachment_url,
      attachment_name: row.attachment
    }
    this.modalService.open(content, {
      size: 'lg',
      centered: true
    }).result.then((result) => {
    }, (reason: any) => {
    });
  }

  deleteAttachment(attachment_id: any) {
    let confirm = window.confirm('Are you sure you want to delete this attachment');
    if (confirm) {
      this.inventorySerivce.deleteInternalIssueReturnAttachment(attachment_id).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message)
          this.attachment = {
            id: resp.id,
            attachment_url: null,
            attachment_name: null
          }
          this.reloadData();
        } else {
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  open2(content:any,id:any) {
    this.inventorySerivce.showInternalIssueReturn(id).subscribe((res:any) => {      
      this.return_issue_data=res.data;
      // this.modalService.open(MyModalComponent,  { windowClass : "myCustomModalClass"});
      this.modalService.open(content, { centered: true, size: 'lg', windowClass: "myCustomModalClass", ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        let data = {id:id,status:2,reject_reason:this.reasonForRejection}        
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        
      });                        
    });            
  }

  getFileType(url: string): string {
    return this.CommonService.getFileType(url)
  }

  countFilters() {
    this.filterCount = 0;
    Object.keys(this.filterForm.value).forEach((item: any) => {
      if ((this.filterForm.value[item] != '' && this.filterForm.value[item] != null) || item == 'status') {
        this.filterCount++;
      }
    })
    if (this.filterForm.value?.return_date && this.filterForm.value?.return_date?.startDate == null) {
      this.filterCount--;
    }
  }

  clearAll() {
    this.filterForm.reset();
    this.countFilters()
    this.reloadData();
  }

  initForm() {
    this.filterForm = this.formBuilder.group({
      internal_issue_id: [],
      issue_by: [],
      return_date: [],
      received_by: [],
    });
    this.countFilters()
  }
}
