import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FeesImportService } from '../fees-import.service';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-fees-import-detail',
  templateUrl: './fees-import-detail.component.html',
  styleUrls: ['./fees-import-detail.component.scss']
})
export class FeesImportDetailComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  public importFeesId:any;

  constructor(
    public feesImportService: FeesImportService,
    private route: ActivatedRoute,
    public datePipe: DatePipe,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute
  ) { 
      this.importFeesId = this.route.snapshot.paramMap.get('id');
    }

  ngOnInit(): void {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],      
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,       
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'row_number'},
        { data: 'message'},
        { data: 'created_at'},
        { data: 'updated_at'},        
      ]
    };
  }
  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,   

    };        
    
    this.feesImportService.feesImportDetail(dataTablesParameters,this.importFeesId).subscribe((resp:any) => {
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
