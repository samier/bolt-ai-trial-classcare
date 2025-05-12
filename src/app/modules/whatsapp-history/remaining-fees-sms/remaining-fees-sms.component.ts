import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { WhatsappHistoryService } from '../whatsapp-history.service';
import { HomeworkService } from '../../homework/homework.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { student_status } from 'src/app/common-config/static-value';
import { BatchService } from '../../batch/batch.service';

@Component({
  selector: 'app-remaining-fees-sms',
  templateUrl: './remaining-fees-sms.component.html',
  styleUrls: ['./remaining-fees-sms.component.scss']
})
export class RemainingFeesSmsComponent implements OnInit {
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any;
  filter: boolean = true
  isShowLoading: boolean = false;
  isResetloading : boolean = false;
  isInitialCall: boolean = true;
  allChecked: boolean = false;
  isSending: boolean = false;
  sectionsList: any = []
  classesList: any = []
  batchesList: any = []
  statusList: any = student_status
  message: any = {
    send_father: 0,
    send_mother: 0,
    send_student: 0
  }
  remainingFeeForm : FormGroup = new FormGroup({});
  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  selectedStudents: Set<{ id: number; remaining_fees: number }> = new Set();
  filterCount: any = 1;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      public activatedRouteService: ActivatedRoute,
      private toaster:Toastr,
      private _modalService: NgbModal,
      private whatsAppHistoryService: WhatsappHistoryService,
      public dateFormateService: DateFormatService,
      private homeworkService: HomeworkService,
      private batchService: BatchService
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.initDatatable();
    this.getSectionList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  onSectionChange(){
    this.remainingFeeForm?.controls['class_id'].patchValue(null); 
    this.remainingFeeForm?.controls['batch_id'].patchValue(null); 
    this.classesList = [];
    this.batchesList = [];
    this.getClassList();
  }
  
  onClassChange(){
    this.batchesList = [];
    this.remainingFeeForm?.controls['batch_id'].patchValue(null);
    this.getBatchList();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onShow(){
    this.isShowLoading = true;
    this.reloadData();
  }

  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.selectedStudents.clear();
  
    this.tbody.forEach(student => {
      student.selected = checked;
      if (checked) {
        this.selectedStudents.add({ id: student.student_id, remaining_fees: student.remaining_fees });
      }else{
        this.selectedStudents.delete({ id: student.student_id, remaining_fees: student.remaining_fees});
      }
    });
  }

  handleSelect(event: any, student: any) {
    if (event.target.checked) {
      this.selectedStudents.add({
        id: student.student_id,
        remaining_fees: student.remaining_fees
      });
    } else {
      this.selectedStudents.forEach((s) => {
        if (s.id === student.student_id) {
          this.selectedStudents.delete(s);
        }
      });
    }
    
    this.allChecked = this.selectedStudents.size === this.tbody?.length;
  }

  
  selectionCancel(){
    this.allChecked = false;
    this.tbody.forEach(element => {
      element.selected = false
    });
  }

  clearAll(){
    this.remainingFeeForm?.reset();
    this.remainingFeeForm?.markAsUntouched();
    this.getSectionList();
    this.classesList = [];
    this.batchesList = [];
    this.isResetloading = true;
    this.isInitialCall = true;
    this.reloadData();
  }

  openModal(modalName: any){
    if(this.selectedStudents.size === 0){
      this.toaster.showError('Please Select At least One Student');
      return;
    }
    this._modalService.open(modalName)
  }

  closeModel() {
    this.message.send_father = 0;
    this.message.send_mother = 0;
    this.message.send_student = 0;
    this.allChecked = false;
    this.selectedStudents.clear();
    this.selectionCancel();
    this._modalService.dismissAll();
  }

  saveBroadcast(type: any){
    const payload = {
      ...type == 'sms' && ({
        is_father_message: this.message?.send_father ? 1 : 0,
        is_mother_message: this.message?.send_mother ? 1 : 0,
        is_student_message: this.message?.send_student ? 1 : 0
      }),
      student: Array.from(this.selectedStudents),
    } 
    this.isSending = true;
    this.whatsAppHistoryService.sendRemainingFeeNotification(payload, type).subscribe((res: any) => {
      if(res?.status){
        this.isSending = false;
        Object.keys(this.message).forEach(key => this.message[key] = 0);
        this.selectedStudents.clear()
        this.toaster.showSuccess(res?.message)
        this.selectionCancel()
        this._modalService.dismissAll();
      }else{
        this.isSending = false;
        Object.keys(this.message).forEach(key => this.message[key] = 0);
        this.selectedStudents.clear();
        this.selectionCancel()
        this.toaster.showError(res?.message)
        this._modalService.dismissAll();
      }
    },
    (error: any) => {
      this.isSending = false;
      this.selectedStudents.clear();
      Object.keys(this.message).forEach(key => this.message[key] = 0);
      this._modalService.dismissAll();
      this.selectionCancel()
      this.toaster.showError(error?.message ?? error?.error?.message);
    });
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.remainingFeeForm = this._fb.group({
      section_id: [null],
      class_id: [null],
      batch_id: [null],
      student_type: [null]
    })
  }

  initDatatable(){
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      order: [[4,'asc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        {data: null, orderable: false, searchable: false },
        {data: 'student_id'},
        {data: 'student_rollNo'},
        {data: 'student_name'},
        {data: 'batch_name'},
        {data: 'total_fees'},
        {data: 'discount', orderable: false},
        {data: 'paid_fees', orderable: false},
        {data: 'remaining_fees'},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    const payload = {
      ...dataTablesParameters,
      ...this.remainingFeeForm?.value
    };
    this.whatsAppHistoryService.getRemainingFeeList(Object.assign(payload)).subscribe(
      (res: any) => {
        this.isResetloading = false;
        this.isShowLoading = false;
        this.allChecked = false;
        this.selectedStudents.clear();
        this.tbody = res?.data?.original?.data;
        callback({
          recordsTotal: res?.data?.original?.recordsTotal,
          recordsFiltered: res?.data?.original?.recordsFiltered,
          data: []
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      },(error)=> {
        this.selectedStudents.clear();
        this.isResetloading = false;
        this.isShowLoading = false;
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    )
  }

  countFilters(){
    this.filterCount = 1;
    Object.keys(this.remainingFeeForm.value).forEach((item:any)=>{
      const filter = this.remainingFeeForm.value[item]
      if((filter != '' && filter != null && item != 'student_type' )){
        this.filterCount++;
      }
    })
  }

  getSectionList(){
    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).subscribe((res: any) => {
      if(res.status){
        this.sectionsList = res?.data;
        this.getClassList();
      }
    })
  }

  getClassList(){
    const payload = {
      section_id: this.remainingFeeForm?.value?.section_id ?? null,
      user_id: this.user_id ?? null,
    }
    this.homeworkService.getClass(payload, 0).subscribe((res: any) => {
      if(res.status){
        this.classesList = res?.data
      }
    })    
  }
  
  getBatchList(){
    const payload = {
      branchId: this.branch_id,
      classes: this.remainingFeeForm?.value?.class_id ? [this.remainingFeeForm?.value?.class_id] : [],
    } 
    this.homeworkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res.status){
        this.batchesList = res?.data;
      }
    })
  }
//#endregion Private methods
}
