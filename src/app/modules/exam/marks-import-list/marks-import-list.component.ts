import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FeesImportService } from '../../fees-import/fees-import.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ExamServiceService } from '../exam-service.service';

@Component({
  selector: 'app-marks-import-list',
  templateUrl: './marks-import-list.component.html',
  styleUrls: ['./marks-import-list.component.scss']
})
export class MarksImportListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  examID:any

  constructor(
    public feesImportService: FeesImportService,
    public datePipe: DatePipe , 
    public commonService : CommonService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public examService: ExamServiceService,
  ) { }

  ngOnInit(): void {
    this.examID = this.activatedRouteService.snapshot.paramMap.get('id') || null
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
      stateSave: true, 
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
       { data: 'created_at' },       
        { data: 'exam_name', name:'exam_name.exam_name'},
        { data: 'file_name' },
        { data: 'total_records'},
        { data: 'saved_records' },
        { data: 'status' },
        { data: 'error_message' },       
        { data: 'action',orderable:false,searchable:false }
      ],
      order: [[0, 'desc']],
    };
  }
  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
      ...{exam_name_id: this.examID}
    };        
    this.examService.importedMarksList(dataTablesParameters).subscribe((resp:any) => {   
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
}
