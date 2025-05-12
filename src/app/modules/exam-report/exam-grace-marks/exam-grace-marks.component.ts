import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';
import { ExamReportService } from '../exam-report.service';

@Component({
  selector: 'app-exam-grace-marks',
  templateUrl: './exam-grace-marks.component.html',
  styleUrls: ['./exam-grace-marks.component.scss'],
})
export class examGraceMarksComponent {
  constructor(
    private examReportService: ExamReportService,
    private toastr: Toastr,
    private route: ActivatedRoute,
    private router: Router,
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

 data:any;

  columns:any = [
    { data: 'rollno', orderable: true }, 
    { data: 'full_name', orderable: true }, 
  ]

  subjects:any = []
  examDates:any = [];
  errors = [];
  grace_marks:any = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.data = params;
      if (this.data.class == null || this.data.batch == null || this.data.exam_type == null || this.data.exam_type_id == null || this.data.academic_id == null) {
        this.router.navigate([
          this.examReportService.getBranch() + '/exam-report-card/generate',
        ]);
      }
      this.getSubject();
      this.initializeTable();
    });
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
      ...this.data,
    };
    dataTablesParameters['columns'] = this.columns
    dataTablesParameters['subjects'] = true;
    
    this.examReportService.getStudents(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;     
      this.grace_marks = resp.grace_marks  
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

  getSubject() {
    this.examReportService.getStudents(this.data).subscribe((resp: any) => {
      if(resp.status == false){
        this.toastr.showError(resp.message)
        this.router.navigate([
          this.examReportService.getBranch() + '/exam-report-card/generate',
        ]);
      }
      for (const key in resp.data) {
        this.columns.push({ data: resp.data[key], orderable: false, key: key });
        this.subjects.push(key)
      }
      this.initializeTable();
      setTimeout(() => {
        this.reloadData();
        this.dtRendered = true;
      }, 100);
    },(err:any)=>{
      this.router.navigate([
        this.examReportService.getBranch() + '/exam-report-card/generate',
      ]);
    });
  }

  updateRecord(data:any){
    this.editable = data;
    this.editable.map((el:any) => {
      let subjects:any = []
      this.subjects.forEach((element:any, key:any) => {
        let grace = this.grace_marks.find((mark:any) => mark.student_id == el.id && mark.subject_id == element);
        subjects[key] = {
          subject_id: element, 
          krupa_gun: grace ? grace.krupa_gun : null, 
          siddhi_gun: grace ? grace.siddhi_gun : null}
      });
      return el.subjects = subjects;
    })
  }

  editRecord(){
    let data = {
      students: this.editable,
      ...this.data,
    }
      this.examReportService.addGraceMarks(data).subscribe((res: any) => {
        if(res.status){
          this.toastr.showSuccess(res.message)
          this.reloadData()
        }else{
          this.errors = res.data
          this.toastr.showError(res.message)
        }
      }) 
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

  cancel(){
    this.router.navigate([
      this.examReportService.getBranch() + '/exam-report-card/generate',
    ]);
  }

  // clearTable(){
  //   this.params.section = null;
  //   this.params.class = null;
  //   this.params.batch = null;
  //   this.params.exam_type = null;


  //   this.tbody= null;
  //   this.editable= null;
  //   this.dtRendered = false
  // }
}
