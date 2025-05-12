import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { oldSchoolManagementService } from '../old-school-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-old-school',
  templateUrl: './old-school.component.html',
  styleUrls: ['./old-school.component.scss']
})
export class oldSchoolComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private oldSchoolService: oldSchoolManagementService,
      private toastr: Toastr,
      private modalService: NgbModal,
      public CommonService: CommonService,
    ) {}
    dropdownList: any = [];
    selectedItems: any = [];
    submitted: any = false;
    updated:any = false;
    formData:any = {
      name: null,
    };

    
  isOpenByClick: boolean = true
  
    updateFormData = {
      school_id: null,
      name: null,
    };

    validationError:any = {

    }
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
      this.selectedItems = [];
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 50,
        lengthMenu : [50,100,200],
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'name' },
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }
  
  
    loadData(dataTablesParameters?: any, callback?: any) {
      this.oldSchoolService.getAllSchoolList(dataTablesParameters).subscribe(
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
      if (
        this.formData.name != null
      ) {
        this.oldSchoolService.createSchool(this.formData).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.toastr.showSuccess(resp.message);
              this.clearForm();
              this.reloadData();
            } else {
              this.validationError = resp.message
            }
          }
        );
      }
    }
  
    update(){
      this.updated = true;
      if (
        this.updateFormData.name != ''
      ) {
        this.oldSchoolService.updateSchool(this.updateFormData, this.updateFormData.school_id).subscribe(
          (resp: any) => {
            if (resp.status) {
              this.toastr.showSuccess(resp.message);
              this.reloadData();
              this.clearForm();
              this.modalService.dismissAll();
            } else {
              this.validationError = resp.message
            }
          }
        );
      }
    }
  
    deleteLecture(lecture_id: any) {
      var result = confirm('Are you sure you want delete this record?');
      if (result == true) {
        this.oldSchoolService.deleteSchool(lecture_id).subscribe(
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
  
    open(content:any, school_id:any) {
      this.oldSchoolService.getSchool(school_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.updateFormData.name = resp.data.name
            this.updateFormData.school_id = resp.data.id
            
            this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result
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
      this.updateFormData.name = null;
      this.validationError = {}
    }
  
}
