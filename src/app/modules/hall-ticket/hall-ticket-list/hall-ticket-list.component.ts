import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HallTicketService } from '../hall-ticket.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-hall-ticket-list',
  templateUrl: './hall-ticket-list.component.html',
  styleUrls: ['./hall-ticket-list.component.scss']
})
export class HallTicketListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  hallticketGenerateForm : FormGroup = new FormGroup({})
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody: any;
  URLConstants = URLConstants;
  batchList: any = [];
  examList: any = [];
  examTypeList = [];
  hallTicket: any = []
  facultyAndPrincipal:any = []

  editID : any = null
  is_loading : boolean = false

  isOpenByClick: boolean = true
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _modalService: NgbModal,
      public hallTicketService: HallTicketService,
      private toastr: Toastr,
      private _validationService : FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getBatch();
    this.initHallticketTable();
    this.getFacultyAndPrincipal();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  openModel(modalName: any, id?: any) {
    if(id){
      this.editID = id;
      this.hallTicketService.getHallTicketById(id).subscribe((res: any) => {
        if(res?.status){
          
          this.hallTicket = Object.assign({}, ...res?.data);
          this.hallticketGenerateForm.patchValue({
            batch_id: this.hallTicket?.batch_id ?? null,
            exam_type_id: Number(this.hallTicket?.exam_type) ?? null,
            venue: this.hallTicket?.venue ?? null,
            faculty_id: this.hallTicket?.faculty_id ?? null,
            principal_id: this.hallTicket?.principal_id ?? null,
          })
          this.examTypeChange(()=>this.hallticketGenerateForm?.controls['exam_name_id']?.patchValue(this.hallTicket?.exam_name_id ?? null))
        }
      })
    }
    else{
      this.hallticketGenerateForm.reset();
    }
    this._modalService.open(modalName);
  }


  closeModel() {
    this.editID = null
    this._modalService.dismissAll();
    this.hallticketGenerateForm.reset();
  }
  deleteHallTicket(item:any){
    const confirm = window.confirm("Do you want to Delete ")
    if(confirm){
      this.hallTicketService.deleteHallTicket(item?.id).subscribe((res:any)=>{
        if (res.status) {
          this.toastr.showSuccess(res.message)
          this.reloadData()
        } else {
          this.toastr.showError(res.message)
        }
      }, (error) => {
        this.toastr.showError(error?.error?.message ?? error?.message)
      })
    }
  }

  generateHallTicket() {

    if(this.hallticketGenerateForm.invalid){
      this._validationService.getFormTouchedAndValidation(this.hallticketGenerateForm);
      return;
    }

    const payload = {
      batch_id     : this.hallticketGenerateForm.value.batch_id || null ,
      exam_type    : +this.hallticketGenerateForm.value.exam_type_id || null ,
      exam_name_id : this.hallticketGenerateForm.value.exam_name_id || null ,
      venue        : this.hallticketGenerateForm.value.venue || "" ,
      faculty_id   : this.hallticketGenerateForm.value.faculty_id || null ,
      principal_id : this.hallticketGenerateForm.value.principal_id || null ,
      hall_ticket_details: [ this.hallticketGenerateForm.value ] ,
    }
    this.is_loading = true
    this.hallTicketService.generateHallTicket(payload,this.editID).subscribe((res:any) => {
      if (res.status){
        this.closeModel();
        this.reloadData()
        this.toastr.showSuccess(res?.message ?? res.data.message);
        this.is_loading = false
      } else {
        this.toastr.showError(res?.message ?? res.data.message);
        this.is_loading = false
      }
    }, (err:any) => {
      this.toastr.showError(err.error.message);
      this.is_loading = false
    });
  }

  examTypeChange(callback?:any) {

    if (this.hallticketGenerateForm.value.batch_id && this.hallticketGenerateForm.value.exam_type_id) {
      this.examList = []
      this.hallticketGenerateForm.controls['exam_name_id'].reset()
      const payload = {
        batch_id : this.hallticketGenerateForm.value.batch_id,
        exam_type_id : this.hallticketGenerateForm.value.exam_type_id
      }
  
      this.hallTicketService.getExamOnTypeAndBatch(payload).subscribe((res: any) => {
        this.examList = res.data
        if(callback){
          callback()
        }
      });
    }
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.hallticketGenerateForm = this._fb.group({
      batch_id: [null,[Validators.required]],
      exam_type_id : [null,[Validators.required]],
      exam_name_id : [null,[Validators.required]],
      venue : [null],
      faculty_id : [null],
      principal_id : [null],
    })
  }

  getBatch() {
    this.hallTicketService.getBatchList().subscribe((res: any) => {
      this.batchList = res.data;
    });

    this.hallTicketService.getExamTypeList().subscribe((res: any) => {
      this.examTypeList = res.data;
    });

    
  }

  initHallticketTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
       ajax: (dataTablesParameters: any, callback) => {
         this.loadData(dataTablesParameters, callback);
       },
       
      columns: [
        { title : 'Batch Name', data: 'batch.name' },
        { title: 'Exam Type', data: 'examType.name' },
        { title : 'Exam Name', data: 'examName.exam_name'},
        { title: 'Action', data: 'action', orderable: false, searchable: false },
      ],
      // columns: [ 
      //   { data: 'examName.exam_name'},
      //   { data: 'batch.name' },
      //   { data: 'examType.name' },
      //   { data: 'action', orderable: false, searchable: false },
      // ],
    };
  }

  loadData(dataTablesParameters, callback) {
    this.hallTicketService.getAHallTicket(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data.original.data;
      callback({
        recordsTotal: resp.data.original.recordsTotal,
        recordsFiltered: resp.data.original.recordsFiltered,
        data: []
      });
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  } 

  getFacultyAndPrincipal () {
    this.hallTicketService.getFacultyAndPrincipal().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) {
        this.facultyAndPrincipal = res.data
      }
    })
  }
  
	
  //#endregion Private methods
}
