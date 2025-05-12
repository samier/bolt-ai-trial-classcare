import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IDropdown } from 'src/app/types/interfaces';

@Component({
  selector: 'app-transport-transfer-student-list',
  templateUrl: './transport-transfer-student-list.component.html',
  styleUrls: ['./transport-transfer-student-list.component.scss']
})
export class TransportTransferStudentListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  
  constructor(
    private transportService: TransportService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    private _fb:FormBuilder
  ) {}

  URLConstants = URLConstants;
  tbody: any = [];
  id:any =  null;

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      scrollX: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.VEHICLE_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.VEHICLE_LIST)
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
        this.getlist(dataTablesParameters,callback)
      },
     columns: [
        { data: 'roll no' }, 
        { data: 'student_name' }, 
        { data: 'class' }, 
        { data: 'batch' }, 
        { data: 'status' }, 
        { data: 'message' }, 
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    this.transportService.getTransportTransferStudentList(dataTablesParameters, this.id).subscribe((resp:any) => {
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

}
