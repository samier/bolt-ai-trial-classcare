import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { documentManagerService } from '../document-manager.service';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  URLConstants = URLConstants;
  constructor(
    private documentManagerService: documentManagerService,
    public CommonService: CommonService
  ) {}

  private modalService=inject(NgbModal);
  document_types: any = [];

  isOpenByClick: boolean = true

  closeResult='';

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' }, 
        { data: 'name' }, 
        { data: 'document_for' }, 
        { data: 'document_date' }, 
        { data: 'status' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    this.documentManagerService.getDocumentTypeList(dataTablesParameters).subscribe((resp:any) => {
      this.document_types = resp.data;
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

  remove(id:any): void{
    if(confirm('are you sure you want to delete this document type ?')){
      this.documentManagerService.deleteDocumentType(id).subscribe((res) => {  
        this.reloadData()
      }); 
    }
  }

  open(content: TemplateRef<any>){
    this.modalService.open(content,{ariaLabelledBy:'modal-basic-title'}).result.then(
      (result) =>{
        this.closeResult='Closed with: ${result}';
      },
      (reason) =>{
        this.closeResult='Dismissed ${this.getDismissReason(reason)}';
      },
    );
  }

  private getDismissReason(reason:any):string{
     switch(reason){
      case ModalDismissReasons.ESC:
				return 'by pressing ESC';
			case ModalDismissReasons.BACKDROP_CLICK:
				return 'by clicking on a backdrop';
			default:
				return `with: ${reason}`;
     }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  replaceUlr(url:any){
    if(url){
      return url.replaceAll('&amp;', '&')
    }
  }

}
