import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPerformanceService } from '../student-performance.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-performance-criteria',
  templateUrl: './performance-criteria.component.html',
  styleUrls: ['./performance-criteria.component.scss']
})
export class performanceCriteriaComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private StudentPerformanceService: StudentPerformanceService,
      private toastr: Toastr,
      private modalService: NgbModal,
      public CommonService : CommonService
    ) {}
    categories: any = [];

    selectedItems: any = [];
    submitted: any = false;
    updated:any = false;
    isOpenByClick: boolean = true

    semester = false;
    semester_update = false;
    semesters = [
      {id: 1, name: 'Semester 1'},
      {id: 2, name: 'Semester 2'},
      {id: 3, name: 'Both'},
    ]
    formData:any = {
      performance_category_id: null,
      name: null,
      is_grade: true,
      is_remark: false,
      semester: 0,
    };
  
    updateFormData = {
      id: null,
      performance_category_id: null,
      name: null,
      is_grade: true,
      is_remark: false,
      semester: 0,
      attendance: true
    };
    dropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.listAllPerformanceCategory();
      this.selectedItems = [];
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'no'},
          { data: 'performance_category'},
          { data: 'name'},
          { data: 'is_grade'},
          { data: 'is_remark'},
          { data: 'semester'},
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }

    listAllPerformanceCategory(){
      this.StudentPerformanceService.listAllPerformanceCategory().subscribe((resp:any)=>{
        if(resp.status){
          this.categories = resp.data
        }
        
      })
    }

    loadData(dataTablesParameters?: any, callback?: any) {
      this.StudentPerformanceService.listPerformanceCriteria(dataTablesParameters).subscribe(
        (resp: any) => {
          this.tbody = resp.data;
          callback ? callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          }) : null;
        }
      );
    }
  
    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }

    handleGradeChange(value:any){
      this.formData.is_grade = value;
      console.log(this.formData)
    }
  
  
    submit() {
      this.submitted = true;
      if (this.formData.name != null && this.formData.performance_category_id != null) {
        this.StudentPerformanceService.createPerformanceCriteria(this.formData).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.semester  = false;
              this.semester_update = false
              this.toastr.showSuccess(resp.message);
              this.clearForm();
              this.reloadData();
            } else {
              this.toastr.showError(resp.message);
            }
          }
        );
      }
    }
  
    update(){
      this.updated = true;
      if (this.updateFormData.name != '' && this.updateFormData.performance_category_id != null) {
        this.StudentPerformanceService.updatePerformanceCriteria(this.updateFormData, this.updateFormData.id).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.semester  = false;
              this.semester_update = false
              this.toastr.showSuccess(resp.message);
              this.clearForm();
              this.reloadData();
            } else {
              this.toastr.showError(resp.message);
            }
          }
        );
      }
    }
  
    delete(id: any) {
      var result = confirm('Are you sure you want delete this record?');
      if (result == true) {
        this.StudentPerformanceService.deletePerformanceCriteria(id).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.toastr.showSuccess(resp.message);
              this.reloadData();
            } else {
              this.toastr.showError(resp.message);
            }
          }
        );
      }
    }
  
    open(content:any, id:any) {
      this.StudentPerformanceService.getPerformanceCriteria(id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.updateFormData.id =  resp.data.id,
            this.updateFormData.performance_category_id =  resp.data.performance_category_id,
            this.updateFormData.name =  resp.data.name,
            this.updateFormData.is_grade =  resp.data.is_grade == 1 ? true : false,
            this.updateFormData.is_remark =  resp.data.is_remark  == 1 ? true : false,
            this.updateFormData.semester =  resp.data.semester,
            this.updateFormData.attendance =  resp.data.attendance == 1 ? true : false,
            this.semester_update = resp.data.semester == 0 ? false : true;
            this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then(
              (result) => {
                if(result == 'update'){
                  this.update()
                }
              },
            );
          } else {
            this.toastr.showError(resp.message);
          }
        }
      );
    }

    handleIsSemester(){
      if(this.semester == true || this.semester_update == true){
        this.formData.semester = 1;
        this.updateFormData.semester = 1;
      }else{
        this.formData.semester = 0;
        this.updateFormData.semester = 0;
      }
    }

    getSemester(sem:any){
      if(sem == 0){
        return 'None';
      }else if(sem == 1){
        return 'Semester 1';
      }else if(sem == 2){
        return 'Semester 2';
      }else{
        return 'Semester 1, Semester 2';
      }
    }
  
    clearForm() {
      this.submitted = false;
      this.updated = false;
      this.formData.performance_category_id = null;
      this.formData.name = null;
      this.formData.is_grade = true;
      this.formData.is_remark = false;
      this.formData.semester = 0;
      this.updateFormData.id = null;
      this.updateFormData.performance_category_id = null;
      this.updateFormData.name = null;
      this.updateFormData.is_grade = true;
      this.updateFormData.is_remark = false;
      this.updateFormData.semester = 0;
    }
}
