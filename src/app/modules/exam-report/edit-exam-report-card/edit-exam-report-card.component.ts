import { Component, OnInit, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamReportService } from '../exam-report.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-edit-exam-report-card',
  templateUrl: './edit-exam-report-card.component.html',
  styleUrls: ['./edit-exam-report-card.component.scss'],
})
export class EditExamReportCardComponent implements OnInit {
  constructor(
    private examReportService: ExamReportService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    public CommonService: CommonService,
  ) {}

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  dtRendered = false;
  tbody: any;
  editable: any;
  data: any = null;
  generating = false;
  errors = [];

  columns: any = [
    { data: 'rollno', orderable: true },
    { data: 'full_name', orderable: true },
    { data: 'exam_type', orderable: false },
  ];
  subjects:any = [];

  reportData = null;
  totalMarks = 0;
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.data = params;
      if (this.data.class == null || this.data.batch == null || this.data.exam_type == null || this.data.exam_type_id == null || this.data.academic_id == null) {
        this.router.navigate([
          this.examReportService.getBranch() + '/exam-report-card/generate',
        ]);
      }
      this.getSubject();
      this.initialize();
    });
  }

  initialize() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: this.columns,
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.data,
    };
    dataTablesParameters['columns'] = this.columns;
    dataTablesParameters['subjects'] = true;

    this.examReportService
      .getStudentMarks(dataTablesParameters)
      .subscribe((resp: any) => {
        this.tbody = resp.data;
        this.editable = resp.data

        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: [],
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then(
            (dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            }
          );
        }, 10);
      });
  }

  getSubject() {
    this.examReportService.getStudentMarks(this.data).subscribe((resp: any) => {
      // this.subjects = resp.data

      
      
      // resp.data.map((x: any, i: any) => {
      //   this.columns.push({ data: x, orderable: false, key: i });
      // });
      for (const key in resp.data) {
        this.columns.push({ data: resp.data[key], orderable: false, key: key });
        this.subjects.push(key)
      }
      this.initialize();
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
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  editRecord(){
    // if(this.checkForError()){
      this.errors = [];
      console.log(this.editable);
      this.examReportService.updateStudentMarks({student: this.editable}).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.reloadData();
        }else{
          this.errors = resp.message
        }
      })
  }

  checkMarks(i:any, j:any, field:any){
    let marks = this.editable[i].exam.subjects[field].marks;
    let total_marks = this.tbody[i].exam.total_marks;
    if(parseInt(marks) > parseInt(total_marks)){
      document.querySelector('#'+this.joinString(field)+i+j)?.classList.add('error')
      return this.toastr.showInfo('obtained Marks cannot be greater then passing marks.', 'Info')
    }else if(isNaN(marks)){
      document.querySelector('#'+this.joinString(field)+i+j)?.classList.add('error')
      return this.toastr.showInfo('Marks must be numeric.', 'Info')
    }else if(marks == '' || marks == null){
      document.querySelector('#'+this.joinString(field)+i+j)?.classList.add('error')
      return this.toastr.showInfo('Marks can not be empty.', 'Info')
    }
    else{
      document.querySelector('#'+this.joinString(field)+i+j)?.classList.remove('error')
      document.querySelector('#'+this.joinString(field)+i+j)?.classList.remove('error-empty')
    }
  }

  checkForError(){
    const elements = document.querySelectorAll('.marks') as NodeListOf<HTMLElement>;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList.contains('error-empty') || elements[i].classList.contains('error')) {
        this.toastr.showError('Please enter marks properly.')
        return false;
      }
    }
    return true;
  }

  generateResult(){
    this.generating = true;
    this.examReportService.generateExamReportCard(this.data).subscribe(async(res:any) => {  
      if(res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if(data.status == false){
          this.toastr.showError(data.message);
        }
      } else {        
        this.downloadFile(res,'exam-report-card', "pdf");        
      }
      this.generating = false;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.generating = false;
    });
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }
  
  cancel(){
    this.router.navigate([
      this.examReportService.getBranch() + '/exam-report-card/generate',
    ]);
  }

  updateString(string: any) {
    return string.replace('_', ' ');
  }

  joinString(string){
    string = string.replaceAll(' ', '-');
    return string.replaceAll('&','and')
  }

  integer(mark:any){
    return parseInt(mark)
  }
  
}
