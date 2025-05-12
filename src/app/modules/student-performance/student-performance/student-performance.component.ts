import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPerformanceService } from '../student-performance.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-student-performance',
  templateUrl: './student-performance.component.html',
  styleUrls: ['./student-performance.component.scss'],
})
export class StudentPerformanceComponent {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  constructor(
    private StudentPerformanceService: StudentPerformanceService,
    private toastr: Toastr,
    private modalService: NgbModal,
    public CommonService: CommonService
  ) {}
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

  editable: any;
  sections = [{ id: '', name: 'Please Select Section' }];
  classes = [{ id: '', name: 'Please Select Class' }];
  batches = [{ id: '', name: 'Please Select batch' }];
  examTypes = [{ id: '', name: 'Please Select Exam Type' }];
  criteria = [{ id: '', name: 'Please Select Criteria' }];

  params: any = {
    section: null,
    class: null,
    batch: null,
    exam_type: null,
    performance_criteria : null
  };

  columns: any = [
    { data: 'rollno', orderable: true },
    { data: 'full_name', orderable: true },
  ];

  criteria_details:any = null;
  errors:any = [];
  loading = false;

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
    // this.loading = false;
    this.getFilters()
    this.initializeTable();
  }

  initializeTable(fields: any = null) {
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
       columns: fields
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.loading = true;
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params
    };
    dataTablesParameters['length'] = -1;
    dataTablesParameters['columns'] = this.columns
    this.StudentPerformanceService.getStudents(dataTablesParameters).subscribe((resp: any) => {
      this.tbody = resp.data;
      this.editable = resp.data.map((x:any) => {
          return {
            id: x.id,
            performance_criteria_id : this.params.performance_criteria,
            rollno: x.rollno, 
            full_name: x.full_name,
            details: {
              grade_sem_1: x.details ? x.details.grade_sem_1 : null, 
              remark_sem_1: x.details ? x.details.remark_sem_1 : null, 
              grade_sem_2: x.details ? x.details.grade_sem_2 : null, 
              remark_sem_2: x.details ? x.details.remark_sem_2 : null,
              attendance: x.details && x.details.attendance ? x.details.attendance : { sem_1 : {total_days: null, present_day: null}, sem_2 : {total_days: null, present_day: null}}
              }
          } 
      })
      
      callback({
        recordsTotal: 1,
        recordsFiltered: 1,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
          this.loading = false;
        });
      }, 10);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getFilters() {
    this.clear();
    this.StudentPerformanceService.getFilters(this.params).subscribe((res: any) => {
      this.sections = this.sections.concat(res.data.sections);
      this.classes = this.classes.concat(res.data.classes);
      this.batches = this.batches.concat(res.data.batches);
      this.criteria = this.criteria.concat(res.data.criteria);
      this.examTypes = this.examTypes.concat(res.data.examTypes);
      this.criteria_details = res.data.criteria_detail
      
      this.columns = [
        { data: 'rollno', orderable: true },
        { data: 'full_name', orderable: true },
      ]
      if(this.criteria_details?.semester == 0){
        if(this.criteria_details?.is_grade == 1){
          this.columns.push({ data: 'grade', orderable: false })
        }
        if(this.criteria_details?.is_remark == 1){
          this.columns.push({ data: 'remark', orderable: false })
        }
      }
      else{
        if(this.criteria_details?.semester == 1 || this.criteria_details?.semester == 3){
          if(this.criteria_details?.is_grade == 1){
            this.columns.push({ data: 'semester_1_grade', orderable: false })
          }
          if(this.criteria_details?.is_remark == 1 && this.criteria_details?.attendance == 0){
            this.columns.push({ data: 'semester_1_remark', orderable: false })
          }
          else{
            this.columns.push({ data: 'semester_1_attendance', orderable: false })
          }
        }
        if(this.criteria_details?.semester == 2 || this.criteria_details?.semester == 3){
          if(this.criteria_details?.is_grade == 1){
            this.columns.push({ data: 'semester_2_grade', orderable: false })
          }
          if(this.criteria_details?.is_remark == 1 && this.criteria_details?.attendance == 0){
            this.columns.push({ data: 'semester_2_remark', orderable: false })
          }
          else{
            this.columns.push({ data: 'semester_2_attendance', orderable: false })
          }
        }
      }      
      if (this.criteria_details != null) {
        this.dtRendered = false;

        this.initializeTable(this.columns);
        setTimeout(() => {
          this.reloadData();
          this.dtRendered = true;
        }, 10);
      }
    });
  }

  handleSectionChange() {
    this.params.class = null;
    this.params.batch = null;
    this.params.exam_type = null;
    this.params.performance_criteria = null;
    this.dtRendered = false;
    this.getFilters();
  }

  handleClassChange() {
    this.params.batch = null;
    this.params.exam_type = null;
    this.params.performance_criteria = null;
    this.dtRendered = false;
    this.getFilters();
  }

  handleBatchChange() {
    this.params.exam_type = null;
    this.params.performance_criteria = null;
    this.dtRendered = false;
    this.getFilters();
  }

  handleExamTypeChange() {
    this.params.performance_criteria = null;
    this.dtRendered = false;
    this.getFilters();
  }

  handleCriteriaChange(){
    // this.editable = [];
    this.dtRendered = false;
    this.getFilters();
  }

  handleInput(field:any, i:any){
    if(this.criteria_details.is_default == 0){
      let errorInput:any = document.getElementById(i+field)
      if(this.editable[i].details[field] != null){
        document.querySelector('#'+field+i)?.classList.remove('error')
        if (errorInput) {
          errorInput.style.display = 'none';
        }
      }
      if (this.editable[i].details[field] == ''){
        document.querySelector('#'+field+i)?.classList.add('error')
        if (errorInput) {
          errorInput.innerHTML = 'Remark is required.'
          errorInput.style.display = 'block';
        }
      }
    }
    else if(this.criteria_details.attendance == 1){
      let attendance = this.editable[i].details.attendance[field];
      let errorInput:any = document.getElementById(i+field)
      
      if(attendance.total_days == '' || parseInt(attendance.total_days) < parseInt(attendance.present_day)){
        if (errorInput) {
          errorInput.innerHTML = 'Total days must be grater then present days.'
          errorInput.style.display = 'block';
          errorInput.classList.add('error-attn')
        }
      }
      else{
        if (errorInput) {
          errorInput.style.display = 'none';
          errorInput.classList.remove('error-attn')
        }
      }
    }
  }

  editRecord(){
    if(this.criteria_details.is_default == 0){
      this.editable.forEach((el:any, i:any) => {
       for (const val in el.details){
        if(el.details[val] == null){
          document.querySelector('#'+val+i)?.classList.add('error')
        }
      }
    });
    }
    if(this.criteria_details.attendance == 1){
      const elements = document.querySelectorAll('.error-attn') as NodeListOf<HTMLElement>;
      if(elements.length > 0){
        return this.toastr.showError('Please fill details properly.')
      }
    }
    let data = {
      students: this.editable,
      criteria : this.criteria_details
    }
    this.StudentPerformanceService.studentPerformance(data).subscribe((resp:any) => {
      if(resp.status){
        this.errors = [];
        this.toastr.showSuccess(resp.message)
      }else{
        this.errors = resp.message
        this.toastr.showError('Please fill details properly.')
      }
    })
  }

  formatName(name:any){
    return name.replaceAll('_', ' ')
  }

  clear() {
    this.sections = [];
    this.classes = [];
    this.batches = [];
    this.examTypes = [];
    this.criteria = [];
    this.errors = [];
  }
}
