import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ResultService } from '../result.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { status } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-teacher-remark-list',
  templateUrl: './teacher-remark-list.component.html',
  styleUrls: ['./teacher-remark-list.component.scss']
})
export class TeacherRemarkListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  importExcelForm: FormGroup = new FormGroup({})
  exportExcelForm: FormGroup = new FormGroup({});
  tbody:any = [];
  selectedFile : any = null;
  importLoading: boolean = false;
  selectedRemark: any = [];
  isLoading:boolean = false;
  statusList:any = status
  remark:any = null
  batches:any = []
  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    public resultService : ResultService,
    private toastr: Toastr,
    private _modalService: NgbModal,
    private _fb : FormBuilder
  ) { }

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initDataTable();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods

  delete(id:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(confirm){
      //deleteStudentRemark
      this.resultService.deleteStudentRemark(id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
        this.reloadData();
      },(error)=>{
        this.toastr.showError(error?.error.error ?? error?.error?.message)
      })
    }
  }

  openImportModal(modalName: any, remark: any) {
    this.initForm();
    this.selectedRemark = remark;
    this._modalService.open(modalName);
  }

  closeModal(){
    this.selectedRemark = [];
    this.importExcelForm.reset();
    this._modalService.dismissAll();
  }

  fileChange(event: any) {
    if (event) {
      this.selectedFile = event.target.files[0]
    }
  }
  
  
  importExcel() {
    this.importExcelForm.markAllAsTouched();
    if(this.importExcelForm.invalid){
      return
    }
    const formData = new FormData();
    
    if (this.selectedRemark) {
      formData.append('file', this.selectedFile);
      formData.append('remark_id', this.selectedRemark.id);
      formData.append('class_id', this.selectedRemark.class_id ?? '');
    }

    this.importLoading = true;
    this.resultService.importRemarksExcel(formData).subscribe(
      (res: any) => {
        this.importLoading = false;
        if (res.status) {
          this.toastr.showSuccess(res?.message);
          this.closeModal();
        } else {
          this.toastr.showError(res.message ?? res.error);
        }
      },
      (error: any) => {
        this.importLoading = false;
        this.toastr.showError(error?.message ?? error?.error ?? error?.error?.message);
      }
    );
  }

  openModal(modalName:any, remark:any){
    this.batches = remark.class.batches
    this.initForm();
    this.remark = remark;
    this._modalService.open(modalName, {
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });
  }
  
  exportExcel(){
    let remark = this.remark 
    const payload = {
      remark_title: remark.remark_title,
      section_id: remark.section_id,
      class_id: remark.class_id,
      batch_id: this.exportExcelForm.value.batch_id,
      result_remarks_id: remark.id,
      status: this.exportExcelForm.value.status
    }
    remark.loading = true
    this.isLoading = true
    this.resultService.exportRemarksExcel(payload).subscribe((res: any) => {
      remark.loading = false
      this.isLoading = false

      // if (res.status) {
      //   this.CommonService.downloadFile(res, 'remarks', 'excel');
      //   this.toastr.showSuccess(res?.message)
      // } else {
      //   this.toastr.showError(res?.message ?? res?.error);
      // }
      if (res?.body?.type == 'application/json') {
        const data = JSON.parse(res.body.text());
        if (data.status == false) {
          this.toastr.showError(data.message);
        }
      } else {
        this.CommonService.downloadFile(res, `Remark-${remark?.class?.name}`, 'excel');
        this.toastr.showSuccess(res?.message)
      }
    },
    (error: any) => {
      this.isLoading = false
      if (error.status === 404) {
        // Handle 404 error
        remark.loading = false
        const errorMessage = 'No student found';
        this.toastr.showError(errorMessage);
    }else{
      remark.loading = false
      this.toastr.showError(error?.message ?? error?.error ?? error?.error?.message);
    }
    });
  }

  closeModel() {
    this._modalService.dismissAll();
    this.exportExcelForm.reset();
    this.exportExcelForm.controls['status'].patchValue(1)
    this.remark = null
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------

  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(){
    this.importExcelForm = this._fb.group({
      file: ['',[Validators.required]],
    })

    this.exportExcelForm = this._fb.group({
      batch_id: [null], 
      status : [1], 
    })
  }

  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: false,
      scrollX: true,
      scrollCollapse: true,
      ordering:false,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { data: 'id' },
        { data: 'remark_title' },
        { data: 'section', name: 'section.name' },
        { data: 'class', name: 'class.name' },
        { data: 'action',orderable:false,searchable:false },
      ],
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    // getStudentRemarksList
    this.resultService.getStudentRemarksList(
      // dataTablesParameters
    ).subscribe((resp: any) => {
      this.tbody = resp.data.original.data
      callback({
        recordsTotal: resp.data.original.recordsTotal,
        recordsFiltered: resp.data.original.recordsFiltered,
        data: [],
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

  //#endregion Private methods

}
