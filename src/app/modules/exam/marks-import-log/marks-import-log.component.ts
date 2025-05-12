import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FeesImportService } from '../../fees-import/fees-import.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { ExamServiceService } from '../exam-service.service';

@Component({
  selector: 'app-marks-import-log',
  templateUrl: './marks-import-log.component.html',
  styleUrls: ['./marks-import-log.component.scss']
})
export class MarksImportLogComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  tbody:any;
  examID:any;
  imported_mark_id:any

  constructor(
    public feesImportService: FeesImportService,
    public datePipe: DatePipe , 
    public commonService : CommonService,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public examService: ExamServiceService,
  ) { }

  ngOnInit(): void {
    this.imported_mark_id = this.activatedRouteService.snapshot.paramMap.get('id') || null
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
       { data: 'student_roll_number', name: 'student.student_roll_number.rollno' },       
        { data: 'gr_number', name:'gr_number'},
        { data: 'student_name', name:'student_name'},
        { data: 'class', name:'student.class.name'},
        { data: 'batch', name:'student.batch_detail.name'},
        { data: 'subject', name:'subject.name'},
        { data: 'row_number' },
        { data: 'old_value'},
        { data: 'new_value' },
        { data: 'message' },       
        { data: 'status' },
      ],
      order : [[4,'asc']],
    };
  }
  URLConstants=URLConstants;

  loadData(dataTablesParameters?: any, callback?:any ){    
    dataTablesParameters = {      
      ...dataTablesParameters,     
      ...{imported_mark_id: this.imported_mark_id}
    };        
    this.examService.importedMarksLogs(dataTablesParameters).subscribe((resp:any) => {   
      this.tbody = resp?.data;      
      this.examID = resp?.exam_id
      
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
