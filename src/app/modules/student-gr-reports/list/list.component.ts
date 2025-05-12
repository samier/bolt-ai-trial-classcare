import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';
import { StudentGrReportsService } from '../student-gr-reports.service';
import { ReportService } from '../../report/report.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit{

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;

  constructor(
      private fb: FormBuilder,
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private studentGrReportsService: StudentGrReportsService,
      private leavingCertificateService: StudentLeavingCertificateService,
      private reportService: ReportService,
  ) {}

  URLConstants = URLConstants;
  commonDropdownSettings: IDropdownSettings = {};

  classes = [{ id: '', name: 'All' }];
  batches = [{ id: '', name: 'All' }];
  student_status = [
    { id: '', name: 'All' },
    { id: '1', name: 'Active' },
    { id: '0', name: 'InActive' }
  ];
  //student_field_list: = [{ id: '', name: 'All' }];
  student_field_list: any = [];
  list:any = [];
  selectedStudentField: any = [];  
  params = {
    class: null,
    batch: null,
    status: null,
    admission_start_date: '',
    admission_end_date: '',
    student_field: null,    
  };

  ngOnInit() {
    this.reportService.getClassList().subscribe((res: any) => {
      if (res.status) {
        this.classes = this.classes.concat(res.data);
      }
    });

    this.studentGrReportsService.getStudentTableAllFieldList().subscribe((res: any) => {
      this.student_field_list = res?.data?.static_field;
      this.list = res?.data?.dynamic_field;
      console.log(" row1 : ", this.student_field_list);
      console.log(" row2 : ", this.list);
    });

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      /*columns: [
        { data: 'id' }, 
        { data: 'class_name' }, 
        { data: 'batch_name' }, 
        { data: 'gr_number' }, 
        { data: 'first_name' }, 
        { data: 'middle_name' }, 
        { data: 'last_name' }, 
        { data: 'father_name' },
        { data: 'mother_name' }, 
        { data: 'categories' }, 
        { data: 'date_of_birth' }, 
        { data: 'age' }, 
        { data: 'birthPlace' }, 
        { data: 'create_at' }, 
        { data: 'progress' }, 
        { data: 'conduct' }, 
        { data: 'address' }, 
        { data: 'school' }, 
        { data: 'email' }, 
        { data: 'gender' },  
      ]*/
    };   

    this.commonDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };      
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
    };
    this.studentGrReportsService.generateStudentGrReport(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.tbody = resp?.data?.record?.original?.data;
      this.list = resp?.data?.studentField;
      console.log(" row3 : ", this.list);
      console.log(" tbody : ", this.tbody);
      callback({
        recordsTotal: resp?.data?.record?.original?.recordsTotal,
        recordsFiltered: resp?.data?.record?.original?.recordsFiltered,
        data: [],
      });
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  fromDateChange(e:any){
    this.params.admission_start_date = e.target.value;
    this.reloadData();
  }

  toDateChange(e:any){
    this.params.admission_end_date = e.target.value;
    this.reloadData();
  }

  classChange() {
    this.reportService.getBatchesByClass(this.params.class).subscribe(
      (res: any) => {
        this.params.batch = null;
        this.batches = [{ id: '', name: 'All' }];
        this.batches = this.batches.concat(res.data);
      }
    );
    this.reloadData();
  }

  student_field_array:any = [];
  onStudentFieldSelect() {
    this.params.student_field = this.selectedStudentField;
    this.reloadData();
  }
  onStudentFieldSelectAll() {
    this.params.student_field = null;
    this.params.student_field = this.student_field_list;
    this.reloadData();
  }
  onStudentFieldDeSelectAll() {
    this.params.student_field = null;
    this.reloadData();
  }

  downloadPdf(format:string){
    this.studentGrReportsService.downloadStudentReport(this.params, format).subscribe((res: any) => {
      if (res.status) {
        window.open(res.data, '_blank');
      } else {
        this.toastr.showError(res.message);
      }
    });
  }  

}
