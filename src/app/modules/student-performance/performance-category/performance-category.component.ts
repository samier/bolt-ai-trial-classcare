import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentPerformanceService } from '../student-performance.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-performance-category',
  templateUrl: './performance-category.component.html',
  styleUrls: ['./performance-category.component.scss']
})
export class performanceCategoryComponent {
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
    submitted: any = false;
    updated:any = false;
    formData:any = {
      name: null,
    };
    isOpenByClick: boolean = true
  
    updateFormData = {
      id: null,
      name: null,
    };

    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
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
        columns: [
          { data: 'name'},
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }

    loadData(dataTablesParameters?: any, callback?: any) {
      this.StudentPerformanceService.listPerformanceCategory(dataTablesParameters).subscribe(
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
  
  
    submit() {
      this.submitted = true;
      if (this.formData.name != '' && this.formData.name != null) {
        this.StudentPerformanceService.createPerformanceCategory(this.formData).subscribe(
          (resp: any) => {
            if (resp.status) {
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
      if (this.updateFormData.name != null) {
        this.StudentPerformanceService.updatePerformanceCategory(this.updateFormData, this.updateFormData.id).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.toastr.showSuccess(resp.message);
              this.reloadData();
              this.clearForm();
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
        this.StudentPerformanceService.deletePerformanceCategory(id).subscribe(
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
      this.StudentPerformanceService.getPerformanceCategory(id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.updateFormData.id = resp.data.id;
            this.updateFormData.name = resp.data.name;
            
            this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
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
  
    clearForm() {
      this.submitted = false;
      this.updated = false;
      this.formData.name = null;
      this.updateFormData.id = null;
      this.updateFormData.name = null;
    }
}
