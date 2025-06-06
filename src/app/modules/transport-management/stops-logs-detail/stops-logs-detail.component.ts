import { Component,ViewChild, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-stops-logs-detail',
  templateUrl: './stops-logs-detail.component.html',
  styleUrls: ['./stops-logs-detail.component.scss']
})
export class StopsLogsDetailComponent implements OnInit {
  
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public  dateFormateService : DateFormatService,
  ) {}

  URLConstants = URLConstants;
  tbody: any = [];
  id:any;
  stop_id:any;

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'created_at' }, 
        { data: 'for' }, 
        { data: 'name', name:'name' }, 
        { data: 'status' }, 
        { data: 'message' }, 
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {...dataTablesParameters, stop_fare_log_id : this.id}
    this.transportService.stopLogsDetail(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;
      this.stop_id = resp.data[0].stop_fare?.stop_id;
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
}
