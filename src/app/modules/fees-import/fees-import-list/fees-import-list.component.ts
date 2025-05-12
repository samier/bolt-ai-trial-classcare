import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FeesImportService } from '../fees-import.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-fees-import-list',
  templateUrl: './fees-import-list.component.html',
  styleUrls: ['./fees-import-list.component.scss']
})
export class FeesImportListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;

  constructor(
    public feesImportService: FeesImportService,
    public datePipe: DatePipe , 
    public commonService : CommonService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) { }

  
  isOpenByClick: boolean = true

  ngOnInit(): void {
    
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],      
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.FEES_IMPORT_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.FEES_IMPORT_LIST)
          let dataTableState = JSON.parse(state)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },      
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'file_name' },
        { data: 'type'},
        { data: 'records'},
        { data: 'saved' },
        { data: 'status' },
        { data: 'created_at' },       
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }
  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
    };        
    console.log('api');
    
    this.feesImportService.feesImportList(dataTablesParameters).subscribe((resp:any) => {
      console.log('res',resp);      
      this.tbody = resp?.data;      
      
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

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
