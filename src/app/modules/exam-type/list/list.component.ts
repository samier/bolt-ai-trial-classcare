import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { ExamTypeService } from '../exam-type.service';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  constructor(private examTypeSerivce:ExamTypeService, public CommonService: CommonService,private _toaster : Toastr){
  }
  URLConstants=URLConstants;
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
        { data: 'name' }, 
        { data: 'status' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };     
  }


  loadData(dataTablesParameters?: any, callback?:any ){
    this.examTypeSerivce.getExamTypeList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }  

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }  

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.examTypeSerivce.deleteRecord(id).subscribe((res:any) => {      
      if (res.status) {
        this._toaster.showSuccess(res.message)
        this.reloadData();
      } else {
        this._toaster.showError(res?.message)
      }
    }, (error) => {
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
    }
  }
}
