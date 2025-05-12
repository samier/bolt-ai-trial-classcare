import { Component, ViewChild } from '@angular/core';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TemplateService } from '../template-management.service';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-leave',
  templateUrl: './exam-report.component.html',
  styleUrls: ['./exam-report.component.scss'],
})
export class ExamReportComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  isOpenByClick: boolean = true

  tbody: any;
  URLConstants = URLConstants;
  constructor(
    private TemplateService: TemplateService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService
  ) {}

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  loading: boolean = false;
  submit = false;
  classList = [];
  selectedClass = [];

  SubjectList = [];
  selectedSubject: any = [];

  examTypes = [];
  examTypesList = [];
  conversionTypes = [
    { id: 'marks', name: 'Marks' },
    { id: 'percentage', name: 'Percentage' },
  ];

  scholastic_type = false;
  update_scholastic_type = false;
  form: any = {
    name: null,
    class_id: [],
    subject_id: [],
    passing_marks: null,
    total_marks: null,
    exam_report_type: null,
    exam_type: [],
    scholastic_type: 1,
    include_in_total_marks: false, 
    attendance: 0,
    marks_type: 1,
  };

  updateForm: any = {
    name: null,
    class: [],
    class_id: null,
    subject: [],
    subject_id: null,
    exam_report_subject_id: null,
    exam_report_id : null,
    passing_marks: null,
    total_marks: null,
    exam_report_type: null,
    exam_type: [],
    scholastic_type: 1,
    include_in_total_marks: false, 
    attendance: 0,
    marks_type: 1,
  };

  examReportTypes = [
    { id: 'marks', name: 'Marks' },
    { id: 'grades', name: 'Grades' },
    { id: 'both', name: 'Both' },
  ];
  reports: any = [];
  image = '';
  template_name = null;
  params: any = {};

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    this.getExamDetails();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'name' },
        { data: 'class' },
        { data: 'subject' },
        { data: 'total_marks' },
        { data: 'passing_marks' },
        { data: 'scholastic_type' },
        { data: 'exam_report_type' },
        { data: 'order' },
        { data: 'action', orderable: false, searchable: false },
      ],
    };
    
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
    };
    this.TemplateService.getExamReports(dataTablesParameters).subscribe(
      (resp: any) => {
        this.tbody = resp.data;
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
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getExamDetails() {
    this.loading = true;
    this.TemplateService.getExamDetails().subscribe((resp: any) => {
      if (resp.status) {
        this.classList = resp.data.classes;
        this.examTypesList = resp.data.exam_types;
      }
    });
  }

  handleChange(event:any, action:any){
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    data.scholastic_type = event.target.value
  }

  handleAttendanceChange(event:any, action:any){
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    data.attendance = event.target.value    
  }

  handleMarksTypeChange(event:any, action:any){
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    data.marks_type = event.target.value  
  }

  save() {
    this.submit = true;
    this.form.class_id = this.selectedClass;
    this.form.subject_id = this.selectedSubject.map((item: any) => item.id);
    let error = document.querySelectorAll('.avl-error');

    if (this.checkForNullValues(this.form) == false && error.length == 0) {
      if (this.form.exam_type.length > 0 && this.checkForNullValues( this.form.exam_type[this.form.exam_type.length - 1] ) == true) {
        this.form.exam_type[this.form.exam_type.length - 1].save = true;
      } else {
        if(this.checkMarksConversion('create')){
          if(this.scholastic_type == false){
            this.form.scholastic_type = null
          }
          this.TemplateService.storeExamReportDetails(this.form).subscribe(
            (resp: any) => {
              if(resp.status){
                this.submit = false;
                this.selectedSubject = []
                this.toastr.showSuccess(resp.message)
                this.clear()
                this.reloadData()
              }
              else{
                this.toastr.showError(resp.message)
              }
            }
          );
        }
        else{
          return this.toastr.showInfo('conversion total must be same as total marks','Info')
        }
      }
    }
    
  }

  update(){
    let error = document.querySelectorAll('.avl-error');
    if (this.checkForNullValues(this.updateForm) == false && error.length == 0) {
      if (this.updateForm.exam_type.length > 0 && this.checkForNullValues( this.updateForm.exam_type[this.updateForm.exam_type.length - 1]) == true) {
        this.updateForm.exam_type[this.updateForm.exam_type.length - 1].save = true;
      } else {
        if(this.checkMarksConversion('update')){
          if(this.update_scholastic_type == false){
            this.updateForm.scholastic_type = null
          }
          this.TemplateService.updateExamReportDetails(this.updateForm, this.updateForm.exam_report_subject_id).subscribe(
            (resp: any) => {
              if(resp.status){
                this.selectedSubject = []
                this.toastr.showSuccess(resp.message)
                this.modalService.dismissAll()
                this.reloadData()
              }
              else{
                this.toastr.showError(resp.message)
              }
            }
            );
        }
        else{
          return this.toastr.showInfo('conversion total must be same as total marks','Info')
        }
      }
    }
    
    
  }

  addExamType(action:any, index?: any) {
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    index ? (data.exam_type[index].save = true) : null;
    if (
      (data.exam_type.length > 0 &&
        this.checkForNullValues(data.exam_type[index]) == false) ||
      index == null
    ) {
      data.exam_type.push({
        exam_type_id: null,
        exam_type_total_marks: null,
        conversion: null,
        conversion_type: null,
        save: false,
      });
    } else {
      data.exam_type[index].save = true;
    }
  }

  handleConversionChange(index: any, action:any) {
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    data.exam_type[index].save = true;
  }

  handleExamType(index: any, id: any, action: any) {
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    if (
      data.exam_type.some(
        (el: any, key: any) => el.exam_type_id == id && key != index
      )
    ) {
      setTimeout(() => {
        this.toastr.showError('Can not select same exam types.');
        data.exam_type[index].exam_type_id = null;
      }, 10);
    } else {
      let examType: any = this.examTypes.find((x: any) => x.id == id);
      data.exam_type[index].exam_type_total_marks = examType.total_mark;
    }
  }

  handleClassChange() {
    this.selectedSubject = [];
    this.form.exam_type = [];
    this.examTypes = [];
    this.addExamType('create')
    this.TemplateService.getSubjectsByClass({
      class_id: [this.selectedClass],
    }).subscribe((resp: any) => {
      if (resp.status) {
        this.SubjectList = resp.data;
      } else {
        if (resp.data == null) {
          this.SubjectList = [];
        }
      }
    });
  }

  handleSubjectChange(data?:any) { 
    if(this.selectedSubject.length == 0){
      this.form.exam_type = [];
      this.examTypes = [];
      this.addExamType('create')
    } 
    let subjects:any = []
    if(data){
      subjects = [{id: data}];
    }else{
      subjects = this.selectedSubject
    }
    
    this.TemplateService.getExamType({
      subject_id: subjects.map((item: any) => item.id),
    }).subscribe((resp: any) => {
      if (resp.status) {
        this.examTypes = resp.data;
      } else {
        this.toastr.showError(resp.message);
      }
    });
  }

  handleDelete(exam_report_subject_id: any, exam_report_id: any) {
    
    
    let confirm = window.confirm(
      'Are you sure you want to delete this report?'
    );
    if (confirm) {
      let data = {
        exam_report_subject_id: exam_report_subject_id,
        exam_report_id: exam_report_id,
      };
      this.TemplateService.deleteExamReport(data).subscribe((resp: any) => {
        
        if (resp.status) {
          this.reloadData();
        }
      });
    }
  }

  open(content: any, id: any) {
    this.TemplateService.getExamReportById(id).subscribe((resp: any) => {
      if (resp.status) {
        this.updateForm.name = resp.data.exam_report.exam_type.name;
        this.updateForm.class = resp.data.exam_report.class.name;
        this.updateForm.class_id = resp.data.exam_report.class_id;
        this.updateForm.subject = resp.data.subject.name;
        this.updateForm.subject_id = resp.data.subject_id;
        this.updateForm.exam_report_subject_id = resp.data.id;
        this.updateForm.exam_report_id = resp.data.exam_report.id
        this.updateForm.passing_marks = resp.data.passing_marks;
        this.updateForm.total_marks = resp.data.total_marks;
        this.updateForm.exam_report_type = resp.data.exam_report_type;
        this.updateForm.scholastic_type = resp.data.scholastic_type;
        this.updateForm.attendance = resp.data.exam_report.attendance_type;
        this.updateForm.marks_type = resp.data.exam_report.marks_type;
        this.updateForm.include_in_total_marks = resp.data.include_in_total_marks;
        this.update_scholastic_type = this.updateForm.scholastic_type != null ? true : false
        this.updateForm.exam_type = resp.data.exam_report_types.map(
          (item: any) => {
            return {
              exam_type_id: item.exam_type_id,
              exam_type_total_marks: item.total_marks,
              conversion: item.conversion,
              conversion_type: item.conversion_type,
              type_name: item.exam_type.name,
            };
          }
        );
        this.handleSubjectChange(this.updateForm.subject_id);
        

      this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xxl' })
        .result.then((result) => {
          
          this.selectedSubject = []
          
        });
      }
      
    });
  }

  remove(action:any,index: any) {
    let data: any;
    if (action == 'update') {
      data = this.updateForm;
    } else {
      data = this.form;
    }
    data.exam_type.splice(index, 1);
  }

  isNaN(marks: any) {
    return isNaN(marks);
  }

  parseInt(number: any) {
    return parseInt(number);
  }

  checkForNullValues(obj: any) {
    for (let key in obj) {
      if(obj['scholastic_type'] != null){
        if (obj[key] === null) {
          return true;
        }
      }
    }
    return false;
  }

  checkMarksConversion(action:any){
    let total = 0;
    let data:any;
    if(action == 'create'){
      data = this.form
    }else{
      data = this.updateForm
    }

    data.exam_type.filter((x:any) => {
      if(x.conversion_type == 'marks'){
        total = total + parseInt(x.conversion)
      }
      else if(x.conversion_type == 'percentage'){
        total = total + ((parseInt(x.exam_type_total_marks) * parseInt(x.conversion))/100)
        
      }
    })
    if(total == data.total_marks){
      return true;
    }else{
      return false;
    }
  }

  updateOrder(order:any, id:any){
    if(isNaN(order)){
      this.toastr.showInfo('Order must be numeric','Info')
      return this.reloadData()
    }else{
      let data = {
        order : order,
      }
      this.TemplateService.updateOrder(data, id).subscribe()
    }
  }

  clear(){
    this.submit = false;
    this.form.name = null;
    this.form.class_id = [];
    this.form.subject_id = [];
    this.form.passing_marks = null;
    this.form.total_marks = null;
    this.form.exam_report_type = null;
    this.form.exam_type = [];
    this.selectedSubject = [];
    this.selectedClass = []
    this.form.scholastic_type = 1;
    this.form.include_in_total_marks = false;
    this.scholastic_type = false;
  }
}
