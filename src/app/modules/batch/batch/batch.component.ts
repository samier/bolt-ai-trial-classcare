import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { TransportService } from '../../transport-management/transport.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddBatchModalComponent } from '../add-batch-modal/add-batch-modal.component';
import { DataTableDirective } from 'angular-datatables';
import { BatchService } from '../batch.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';

@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.scss']
})
export class BatchComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  batchForm : FormGroup = new FormGroup({})
  sectionList: any = []
  classList: any = []
  dtOptionsForBatch: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  batchData : any = []
  isBatch : boolean = false
  URLConstants = URLConstants
  is_showLoading : boolean = false
  user_id: any = window.localStorage?.getItem("user_id");
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _transportService : TransportService,
      private _toastr : Toastr,
      private _modalService : NgbModal,
      private _batchService : BatchService,
      public commonService: CommonService,
      public homeworkService: HomeworkService,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.defineDtoptionForBatch()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getClasses() {
    this.batchForm.controls['class'].reset();
    this.classList = []

    const section = this.batchForm.value ? this.batchForm.value.section : ''
    const payload = {
      academic_year_id : this._transportService.getAcademicYear ,
      branch_id        : this._transportService.getBranch(),
      user_id          : this.user_id,
      ...(this.batchForm?.value && {section_id: this.batchForm?.value?.section ?? ""}) ,
    }
    this.homeworkService.getClass(payload,this.user_id).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      } else {
        this._toastr.showError(res?.message)
      }
    })
  }

  clearFilterData() {
    this.batchForm.reset()
    this.batchForm.controls['section'].patchValue('');
    this.reloadData();
  }

  getData() {
    this.is_showLoading = true
    this.reloadData()
  }

  async addBatch(data=null) {
    const modalRef = this._modalService.open(AddBatchModalComponent,{
      // centered: true,
      backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });

    // Pass data to the modal component
    modalRef.componentInstance.batchData = data;

    await modalRef.result.then((response: any) => {
      if(response.data) {
        this.reloadData();
      }
    })
  }

  deleteBatch(id) {
    let confirm = window.confirm('Are you sure you want to delete this record?');
    if (confirm) {
      this._batchService.deleteBatch(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this._toastr.showSuccess(res.message);
          this.reloadData();
        } else {
          this._toastr.showError(res.message)
        }
      }, (error) => {
        this._toastr.showError(error?.error?.message ?? error?.error?.error ?? error?.message ?? 'An unexpected error occurred');
      });
    }
  }

  editBatch(data){
    this.addBatch(data)
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  
  isOpenByClick: boolean = true
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.batchForm = this._fb.group({
        section: [''],
        class: ['']
      })
    }

    getSectionList() {
      const data ={
        user_id : this.user_id
      }
      this._batchService.getUserWiseSectionList(data).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.sectionList = [{id : "", name:'All Section'}, ...res.data]
          this.getClasses();
        }
      })
    }

    defineDtoptionForBatch() {
      this.dtOptionsForBatch = {
        pagingType: 'full_numbers',
        pageLength: 50,
        lengthMenu: [50, 100, 200],
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        order: [],

        ajax: (dataTablesParameters: any, callback: any) => {
          this.loadDataForBatch(dataTablesParameters, callback);
        },
        columns: [
          { title: 'Batch', data: 'name', name : 'name' },
          { title: 'Class', data: 'class.name', name: 'class.name' },
          { title: 'Class Teacher', data: 'class_teacher.full_name', name: 'class_teacher.first_name' },
          { title: 'Subject', data: 'class_teacher_subject.subject_name', name: 'class_teacher_subject.subject_name', searchable: false, orderable: false},
          { title: 'Action',className:'action-btn-sticky', data: 'batch_order', searchable: false, orderable: false },
        ],
        // language: {
        //   info: '',
        //   zeroRecords: 'No records found!'
        // }
      };
    }
  
    loadDataForBatch(dataTablesParameters?: any, callback?: any) {
      dataTablesParameters = {
        ...dataTablesParameters,
        ...this.batchForm.value
      };
      this._batchService.getBatchData(dataTablesParameters).subscribe(
        (resp: any) => {
          this.isBatch = false
          this.batchData = resp?.data?.original?.data;
          this.is_showLoading = false
          callback({
            recordsTotal: resp?.data?.original?.recordsTotal,
            recordsFiltered: resp?.data?.original?.recordsFiltered,
            data: [],
          });
        }, (error) => {
          this.is_showLoading = false
          this._toastr.showError(error?.error?.error ?? error?.message);
        }
      );
    }

    
  /**
   * @ngdoc method
   * @name reloadData
   * @description
   * reload data-table
   */
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
	
  //#endregion Private methods
}