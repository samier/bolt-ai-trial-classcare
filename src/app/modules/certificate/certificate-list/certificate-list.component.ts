import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { FormBuilder, Validators } from '@angular/forms';
import { certificateService } from '../certificate.service';
import { CommonService } from 'src/app/core/services/common.service';
import { FieldValueComponent } from '../field-value/field-value.component';

@Component({
  selector: 'certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss'],
})
export class certificateComponent {
  dtOptions: DataTables.Settings = {};
  URLConstants = URLConstants;
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  isOpenByClick: boolean = true

  constructor(
    private toastr: Toastr,
    private fb: FormBuilder,
    private certificateService: certificateService,
    public commonService: CommonService,
    private modalService: NgbModal,
  ) {}

  tbody:any
  sections = [];
  classes = [];
  batches = [];
  students = [];
  templates = [];
  dropdownSettings: IDropdownSettings = {};
  parameters:any = [];

  form = this.fb.group({
    section_id: [null],
    class_id: [null, [Validators.required]],
    batch_id: [null, [Validators.required]],
    student_id: [[], [Validators.required]],
    templete_id: [null, [Validators.required]],
  });

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }

  ngOnInit() {
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
        { data: 'section' },
        { data: 'class'},
        { data: 'batch'},
        { data: 'student_name' },
        { data: 'templete_name' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'full_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.getSectionAndClass();
    this.getTemplate();

    
  }

  loadData(dataTablesParameters?: any, callback?:any ){         
    this.parameters = dataTablesParameters;
    this.certificateService.certificateList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;      
      
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

  getSectionAndClass() {
    this.certificateService
      .getSectionAndClass(this.form.value.section_id)
      .subscribe((resp: any) => {
        if (resp.status) {
          this.sections = resp.data.sections;
          this.classes = resp.data.classes;
        }
      });
  }

  handleSectionChange() {
    
    this.form.patchValue({
      class_id: null,
      batch_id: null,
      student_id: [],
      templete_id: null,
    });
    console.log(this.form.controls);
    this.getSectionAndClass();
  }

  handleClassChange() {
    this.form.patchValue({
      batch_id: null,
      student_id: [],
      templete_id: null,
    });

    let data = {
      classes : [this.form.value.class_id],
    }
    this.certificateService.getBatchesList(data).subscribe((resp:any) => {
      this.batches = resp.data
    })
  }

  handleBatchChange(){
    this.form.patchValue({
      student_id: [],
      templete_id: null,
    });
    let data = {
      batches : [this.form.value.batch_id],
    }
    this.certificateService.getStudentList(data).subscribe((resp:any) => {
      this.students = resp.data
    })
  }

  getTemplate(){
    this.certificateService.getTemplate().subscribe((resp:any) => {
      this.templates = resp.data
    })
  }

  addFieldsValue(){
    const template:any = this.templates.find((template:any)=>template.id == this.form?.value?.templete_id);
    if(template?.variables?.length == 0){
      this.submit();
      return;
    }
    const modalRef = this.modalService.open(FieldValueComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.template = template;
    modalRef.result?.then((response:any) => {
      if(response && response?.status){
        this.submit(response?.values);
      }
    });
  }

  submit(values:any = null) {
    const params:any = Object.assign({}, this.form.value);
    params.values = values;
    params.student_id = this.form.value.student_id?.map((el:any) => el.id);
    this.certificateService.generateCertificate(params).subscribe((resp:any) => {
      this.downloadFile(resp, 'certificate', 'pdf');
      this.form.reset();
      this.reloadData();
    })
  }

  delete(id:any){
    let confirm = window.confirm('Are you sure you want to delete this certificate.?')
    if(confirm){
      this.certificateService.deleteCertificate(id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message);
          this.reloadData();
        }
      })
    }
  }

  printCertificate(id:any){
    this.certificateService.printCertificate(id).subscribe((resp:any) => {
      this.downloadFile(resp, 'certificate', 'pdf');
    })
  }

  clear(){
    this.form.reset();
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf' || format == 'pdf2') {
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
}
