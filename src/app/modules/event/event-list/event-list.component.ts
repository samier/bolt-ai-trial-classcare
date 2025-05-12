import { Component, OnInit, ViewChild} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { EventService } from '../event.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;

  
  isOpenByClick: boolean = true

  constructor(private eventService:EventService, public datePipe: DatePipe, public CommonService: CommonService,) { }

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
        { data: 'event_name' },
        { data: 'start_date' },
        { data: 'end_date' },
        { data: 'event_type.name' },
        { data: 'color' },
        { data: 'assignTo' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  
  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
    };        
    
    this.eventService.eventList(dataTablesParameters).subscribe((resp:any) => {
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
      this.eventService.deleteRecord(id).subscribe((res:any) => {              
        this.reloadData();
      });             
    }
  } 

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
