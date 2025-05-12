import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { InquiryService } from '../inquiryservice';
import { followUpType } from 'src/app/common-config/static-value';
import {Toastr} from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { AddFollowUpComponent } from '../add-follow-up/add-follow-up.component';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  //

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;

  inquiryFollowUpForm : FormGroup = new FormGroup({})
  addFollowUpF : FormGroup = new FormGroup({})
  branch_id: any = window.localStorage.getItem('branch');
  sectionsList: any = [];
  standardList : any = [];
  tbody : any = []
  inquiryData : any = []
  followUpType = followUpType
  is_loading: boolean = false;
  isClear: boolean  = false;
  is_show: boolean = false;
  URLConstants = URLConstants;
  allChecked: boolean = false;
  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  id: any
  selectedArray : any = []
  
  sendL : boolean = false
  isEdit : boolean = false
  editFollowData : any

  isOpenByClick: boolean = true

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private toster: Toastr,
    public commonService: CommonService,
    private inquiryService : InquiryService,
    private toastr: Toastr,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private validationService: FormValidationService,
    public dateFormateService : DateFormatService
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
   }

   // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    // this.getSectionList()
    // this.getClassesList()
    this.initDatatable()
    this.is_loading = true
  }

   // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  initDatatable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu:[
        [50,100,200],
        ['Show 50 entries','Show 100 entries','Show 200 entries']
      ],
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      order: [[5, 'asc']],

      lengthChange: true,
      stateSave: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data: 'id', orderable: false, searchable: false},
        {data: 'id' },
        {data: 'follow_up_date' },
        {data: 'next_follow_up_date' },
        {data: 'follow_up_type' },
        {data: 'message' },
        {data: 'user_name' },
        {data: 'action', orderable: false, searchable: false},
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    const payload ={
      inquiry_id : this.id,
    }
    
    this.inquiryService.followUpList(Object.assign(dataTablesParameters,payload)).subscribe((resp: any) => {
      this.tbody = resp?.data;
      this.inquiryData =  resp?.inquiry

      callback({
        recordsTotal: resp?.recordsFiltered,
        recordsFiltered: resp?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
      this.is_loading = false

    },(error)=>{
      if(error.error.error == 'Access Denied'){
        return
      }
      this.toastr.showError(error?.error?.message ?? error?.message)
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  handleShow(){
    this.is_show = true
    this.tbody = []
    this.reloadData()
  }

  handleClear(){
  }

  handleSelectAll(event:any){
    this.selectedArray = []
    const isCheck = event.target.checked
    this.tbody.forEach(element => {
      if(isCheck){
        element.selected = true
        this.selectedArray.push(element.id)
      }
      else{
        element.selected = false
      }
    });
  }

  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedArray.push(id);
      
    } else {
      const index: number = this.selectedArray.indexOf(id);
      if (index !== -1) {
        this.selectedArray.splice(index, 1);
      }
    }
    this.allChecked = this.selectedArray?.length == this.tbody?.length;
  }

  deleteInquiry(id:number){

    const isDelete = confirm( "Do you want to Delete Inquiry Follow Up" )

    if(!isDelete) return 

    this.inquiryService.deleteInquiryFollowUp(id).subscribe((res:any)=>{      
      if(res?.status){
        this.toster.showSuccess(res.message)
        this.reloadData()
      }
      else{
        this.toastr.showError(res.message)
      }
    },(error:any)=>{
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  setUrl(url: string) {    
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  downloadPdfAndExcel(format:any)
  {    
    if(this.selectedArray?.length == 0)
    {
      this.toastr.showError("Please select at least one data");
    }else
    {
      if(format == 'pdf')
        {
          this.isPdfLoading = true;      
        }else
        {
          this.isExcelLoading = true;
        }
    
        const payload = {
          branch_id : this.branch_id,
          followUpIds : this.selectedArray,
          document_type : format,
          inquiryIds : [this.id]
        }    
        this.inquiryService.exportData(payload).subscribe((res:any)=>{
          this.commonService.downloadFile(res, 'Inquiry Follow Up', format);
          this.isPdfLoading = false;
          this.isExcelLoading = false;
        },(error) => {
          this.isPdfLoading = false;
          this.isExcelLoading = false;
          this.toastr.showError(error?.error?.message ?? error?.message)
        })
        this.isPdfLoading = false;
        this.isExcelLoading = false;
    }    
  }

  // openAddFollowUp(modalName:any,item?:any){

  //   if(item){
  //     this.editFollowData = item
  //     this.isEdit = true
  //   }
  //   else{
  //     this.isEdit = false
  //   }
    
  //   this.modalService.open(modalName , { centered: true, windowClass: "filter-modal duplicate-modal-section" });
    
  // }

  async openAddFollowUp(data? :any) {
    const modalRef = this.modalService.open(AddFollowUpComponent, {
      // centered: true,
      backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });

    // Pass data to the modal component
    modalRef.componentInstance.editData = data;
    modalRef.componentInstance.id = this.id;
    modalRef.componentInstance.inquiryData = this.inquiryData;

    await modalRef.result.then((response: any) => {
      if (response.status) {
        this.reloadData();
      }
    })
  }

  handleAddFollowUp() {
    this.sendL = true
    if (this.addFollowUpF.invalid) {
      this.validationService.getFormTouchedAndValidation(this.addFollowUpF)
      this.sendL = false
      return;
    }
    const payload: any = {
      inquiry_id: this.id,
      ... this.addFollowUpF.value
    }

    this.inquiryService.addUpdateFollowUp(payload, this.editFollowData.id).subscribe((res: any) => {
      if (res?.status) {
        if (this.id) {
          this.toastr.showSuccess(res?.message);
          this.reloadData()
          this.modalService.dismissAll();
        }
        else {
          this.toastr.showSuccess(res?.message);
        }
        this.sendL = false
      }
      else {
        this.sendL = false
        this.toastr.showError(res?.message);
      }
    },(error:any)=>{
      this.toastr.showError(error.error.message || error.message )
    })
  }
  reset(){
    this.addFollowUpF.reset()
    this.addFollowUpF.controls['date'].patchValue(this.getDate())
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.inquiryFollowUpForm = this._fb.group({
      section: [''] ,
      standard: [''] ,
      type: [''] ,
      date: [''] ,
      nextDate: [''] ,
    })

    this.addFollowUpF = this._fb.group({
      type: [ null ,[Validators.required]],
      message: [ null ,[Validators.required]],
      date: [ this.getDate() ,[Validators.required]],
    })
  }

  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate
  }

  getSectionList() {
    this.inquiryService.getSectionList({ branch: this.branch_id }) .subscribe((res: any) => {
      if (res.status) {
        this.sectionsList = [...this.sectionsList, ...res.data ] ;
      }
    });
  }

  getClassesList(){
    this.inquiryFollowUpForm.controls['standard'].patchValue('')

    const payload = {
      section : this.inquiryFollowUpForm.value.section?.length > 0 ? this.inquiryFollowUpForm.value.section?.map(ele => ele.id) : [],
    }

    this.inquiryService.getClasses(payload).subscribe((res: any) => {
      if(res?.status){
        this.standardList = res?.data
      }
    } )
   
  }

  //#endregion Private methods
}
