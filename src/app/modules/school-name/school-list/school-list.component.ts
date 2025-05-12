import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { SchoolNameService } from '../school-name.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-school-list',
  templateUrl: './school-list.component.html',
  styleUrls: ['./school-list.component.scss']
})
export class SchoolListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  branch:any;

  
  isOpenByClick: boolean = true

  constructor(private schoolNameService:SchoolNameService, public CommonService: CommonService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,      
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,      
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'name' },
        { data: 'location'},
        { data: 'contactNo'},
        { data: 'secondContactNo' },
        { data: 'address' },
        { data: 'city' },
        { data: 'udiseNo' },        
        { data: 'sscIndexNo' },
        { data: 'hscIndexNo' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
    };        
    
    this.schoolNameService.schoolList(dataTablesParameters).subscribe((resp:any) => {
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
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.schoolNameService.deleteRecord(id).subscribe((res:any) => {              
        this.reloadData();
      });             
    }
  }  

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
