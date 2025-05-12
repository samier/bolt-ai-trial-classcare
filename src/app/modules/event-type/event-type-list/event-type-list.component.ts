import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { EventTypeServiceService } from '../event-type-service.service';

@Component({
  selector: 'app-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;

  
  isOpenByClick: boolean = true

  constructor(private eventTypeService:EventTypeServiceService) { }

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
        { data: 'color' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
    };        
    
    this.eventTypeService.eventTypeList(dataTablesParameters).subscribe((resp:any) => {
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

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.eventTypeService.deleteRecord(id).subscribe((res:any) => {              
        this.reloadData();
      });             
    }
  } 

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
