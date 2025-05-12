import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamServiceService } from '../exam-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-marks-bulk-edit',
  templateUrl: './marks-bulk-edit.component.html',
  styleUrls: ['./marks-bulk-edit.component.scss'],
})
export class MarksBulkEditComponent {
  constructor(
    private ExamServiceService: ExamServiceService,
    private toastr: Toastr,
    public CommonService: CommonService
  ) {}

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  URLConstants = URLConstants;
  dtRendered = false;
  dropdownList: any = [];
  commonDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    // limitSelection:6,
  };

  tbody: any;
  editable: any;
  sections = [{ id: '', name: 'Please Select Section' }];
  classes = [{ id: '', name: 'Please Select Class' }];
  batches = [{ id: '', name: 'Please Select batch' }];
  examTypes = [{ id: '', name: 'Please Select Exam Type' }];

  params:any = {
    section: null,
    class: null,
    batch: null,
    exam_type: null,
  };

  columns:any = [
    { data: 'rollno', orderable: true }, 
    { data: 'full_name', orderable: true }, 
  ]

  subjects = []
  examDates:any = [];
  errors = [];

  ngOnInit(): void {
    this.getSections();
    this.initializeTable();
  }

  initializeTable(fields:any = null){
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
    //  columns: fields
    };  
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
    };
    dataTablesParameters['columns'] = this.columns
    
    this.ExamServiceService.getStudentMarks(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;     
          
      this.updateRecord(resp.data)
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

  getSections() {
    this.clear();
    this.ExamServiceService.getSections(this.params).subscribe((res: any) => {
      this.sections = this.sections.concat(res.data.sections);
      this.classes = this.classes.concat(res.data.classes);
      this.batches = this.batches.concat(res.data.batches);
      this.examTypes = res.data.examTypes.map((x:any) => {
        return {id:x, name:x}; 
      });
      // group: [{data: 'Is Absent', orderable: false},{data: 'Marks', orderable: false}]
      this.examDates = [
        { subject: 'rollno', start_time: '' }, 
        { subject: 'full_name',start_time: '' }, ...res.data.subjects
      ]
      let subjects:any =[
        { data: 'rollno', orderable: true }, 
        { data: 'full_name', orderable: true }, 
      ]
      res.data.subjects.map((x:any, i:any) => {
        subjects.push({data: x.subject, orderable: false, key: i})
      });
      
      this.columns = subjects;
      this.subjects = res.data.subjects
      
      if(subjects.length > 2){
        this.dtRendered=false;
        this.tbody = [];
        this.initializeTable(this.columns);
        setTimeout(() => {
          this.reloadData();
          this.dtRendered=true;
        }, 100);
      }
    });
  }

  handleSectionChange() {
    this.params.class = null;
    this.params.batch = null;
    this.params.exam_type = null;
    this.tbody = [];
    this.dtRendered = false;
    this.getSections();
  }

  handleClassChange() {
    this.params.batch = null;
    this.params.exam_type = null;
    this.tbody = [];
    this.dtRendered = false;

    this.getSections();
  }

  handleBatchChange() {
    this.params.exam_type = null;
    this.tbody = [];
    this.dtRendered = false;

    this.getSections();
  }

  handleExamTypeChange() {
    this.tbody = [];
    this.dtRendered = false;

    this.getSections();
  }

  updateRecord(data:any){
    this.editable = data;
    
  }

  editRecord(){
    if(this.checkForError()){
      this.ExamServiceService.bulkUpdateMarks({students: this.editable}).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message)
          this.reloadData()
        }else{
          this.errors = res.data
          this.toastr.showError(res.message)
        }
      }) 
    }
    
  }

  checkMarks(i:any, j:any, field:any){
    let obt_marks = this.editable[i].subjects[j].mark;
    let passing_marks = this.tbody[i].subjects[j].total_mark;

    if(obt_marks > parseInt(passing_marks)){
      document.querySelector('#'+field+i+j)?.classList.add('error')
      return this.toastr.showInfo('obtained Marks cannot be greater then passing marks.', 'Info')
    }else if(isNaN(obt_marks)){
      document.querySelector('#'+field+i+j)?.classList.add('error')
      return this.toastr.showInfo('Marks must be numeric.', 'Info')
    }else if(obt_marks == '' || obt_marks == null){
      document.querySelector('#'+field+i+j)?.classList.add('error')
      return this.toastr.showInfo('Marks can not be empty.', 'Info')
    }
    else{
      document.querySelector('#'+field+i+j)?.classList.remove('error')
      document.querySelector('#'+field+i+j)?.classList.remove('error-empty')
    }
  }


  checkForError(){
    const elements = document.querySelectorAll('.marks') as NodeListOf<HTMLElement>;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList.contains('error-empty')) {
        elements[i].classList.add('error')
      }
    }
    
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList.contains('error-empty') || elements[i].classList.contains('error')) {
        this.toastr.showError('Please enter Proper marks.')
        return false;
      }
    }
    return true;
  }

  joinString(string){
    string = string.replaceAll(' ', '-');
    return string.replaceAll('&','and')
  }

  clear() {
    this.sections = [];
    this.classes = [];
    this.batches = [];
    this.examTypes = [];
  }

  updateString(string:any){
    return string.replace('_',' ')
  }

  clearTable(){
    this.params.section = null;
    this.params.class = null;
    this.params.batch = null;
    this.params.exam_type = null;


    this.tbody= null;
    this.editable= null;
    this.dtRendered = false
  }
}
