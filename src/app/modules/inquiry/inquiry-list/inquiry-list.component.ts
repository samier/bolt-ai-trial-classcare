import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { InquiryService } from '../inquiryservice';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import {Toastr} from 'src/app/core/services/toastr';
import moment from 'moment';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { InquiryFeesModelComponent } from '../inquiry-fees-model/inquiry-fees-model.component';
import { inquiryDownloadFields } from 'src/app/common-config/static-value';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-inquiry-list',
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.scss']
})
export class InquiryListComponent implements OnInit {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  $destroy: Subject<void> = new Subject<void>();
  inquiryForm : FormGroup = new FormGroup({})
  responsibleForm : FormGroup = new FormGroup({})

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  sectionsList: any = [{id:'',name:"All Section"}];
  standardList : any = []

  tbody : any = []
  selectedArray : any = []
  messageArray : any = []
  employeeList : any = []
  isOpenByClick: boolean = true
  statusList :any = [
    // { id : '' , name : "All Status"},
    { id : 0 , name : "New"},
    // { id : 1 , name : "Qualified"},
    { id : 2 , name : "In-Process"},
    { id : 3 , name : "Confirm"},
    { id : 4 , name : "Rejected"},
    { id : 5 , name : "Admission Confirm"},
  ]
  
  message = {
    send_for_father   : true,
    send_for_mother   : true,
    send_for_student  : true
  }

  is_show         : boolean = false;
  is_clear        : boolean = false;
  is_multiDelete  : boolean = false;
  is_singleDelete : boolean = false;
  is_sendSms      : boolean = false;
  
  allChecked: boolean = false;

  isPdfLoading: boolean = false;
  isExcelLoading: boolean = false;
  is_loading: boolean = false;
  isClear: boolean  = false;

  selectedOption:any = 3;  
  note: string = '';            
  loading: boolean = false;

  isMultipleMessage!: boolean ;
  rejectReason : string = '';
  reject_by: string = '';
  selectedData : any | null = null
  isRejectReason : boolean = false
  countData : any = null
  isPdfLoadingStatusLog: boolean = false;
  isExcelLoadingStatusLog: boolean = false;
  filter : boolean = false;
  filterCount: number = 0;

  isFollowUpEXCEL : boolean = false
  isFollowUpPDF : boolean = false

  selectedItem! : any
  selectedStatus : boolean = false
  selectedStatusId! : number
  mainData! : any
  isAdmin:boolean = localStorage.getItem('role')?.includes('ROLE_ADMIN') ?? false
  // downloadFields : any = inquiryDownloadFields
  downloadFields : any = []
  isVisibility : boolean = false
  isInquirySetting : boolean = true
  dtRender : boolean = false
  isDownloadRecipt = false

  formList : any = []
  inquiryFieldData: any;
  isReportPDF : boolean = false
  isReportEXCEL : boolean = false

  reasonList : any = []
  reasonId : any
  reason_for_rejection : any

  is_admin : any = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  responsibleUserList : any
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private toster: Toastr,
    private _modalService: NgbModal,
    public commonService: CommonService,
    private inquiryService : InquiryService,
    private toastr: Toastr,
    private cdr: ChangeDetectorRef,
    private route: Router,
    public dateFormateService : DateFormatService
  ) { }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getNotificationSetting()
    this.initForm();
    this.getEmployeeList()
    // this.initExamTable();
    this.getSectionList()
    this.getClassesList()
    this.is_loading = true
    this.getNotificationSetting()
    // this.initDatatable();
    this.getFormList()

    this.getRejectReasonList()
    this.getAllEmployee()
    // this.getShowFieldData();
    // this.inquiryList()
    this.getPDFDownloadFields();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
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
      // scrollX : true,
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      order: [[2, 'desc']],

      lengthChange: true,
      stateSave: true,
      // scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: this.getCollumn()
    };
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters();
    const payload ={
      branch_id  : this.branch_id ,
      status     : this.inquiryForm?.value?.status?.length > 0 ? this.inquiryForm?.value?.status.map(ele => ele.id) : null ,
      // section_id : this.inquiryForm?.value?.section?.length > 0 ? this.inquiryForm?.value?.section.map(ele => ele.id) : null, 
      section_id : this.inquiryForm.controls['section'].value ? [this.inquiryForm.controls['section'].value] :[]  , 
      // class_id   : this.inquiryForm?.value?.standard?.length > 0 ? this.inquiryForm?.value?.standard : null ,
      class_id   : this.getID(this.inquiryForm.controls['standard'].value) || [] ,
      start_date : this.inquiryForm?.value?.date?.startDate?.format('DD-MM-YYYY') || '',
      end_date   : this.inquiryForm?.value?.date?.endDate?.format('DD-MM-YYYY') || '',
      is_visible : this.inquiryForm?.value?.is_visible,
      form_builder_id : this.inquiryForm.value.form_builder_id?.length ? this.inquiryForm.value.form_builder_id.map(ele => ele.id) : [],
      ...( this.is_admin && { assign_user_id : this.responsibleForm.value.assign_user_id } )
    }
    
    this.inquiryService.inquiryList(Object.assign(dataTablesParameters,payload)).subscribe((resp: any) => {
      this.tbody = resp?.data;
      this.countData = resp?.countData;

      this.allChecked = false
      this.selectedArray = []

      this.tbody.forEach(element => {
        let inquiry_fees_status
        let inquiry_fees_download = null
        if(element.fees_status.length > 0){
          inquiry_fees_status = element.fees_status.map(ele => ele.status)
          inquiry_fees_download = element.fees_status.find(ele => ele.status == 1) ?? null
        }
        element['inquiry_fees_download'] = inquiry_fees_download ? true : false
        element['inquiry_fees_status'] = inquiry_fees_status?.length > 0 ? inquiry_fees_status.includes(2) ? 0 : 1 : 0
        // const section = this.sectionsList?.find(ele=>ele.id==element.class?.section_id)?.name
        const status  = this.statusList?.find(ele=>ele.id===+element.status)?.name
        // const discussWith  = this.employeeList?.find(ele=>ele.id==element.discussion_with)?.name
        // element['section_name']=section
        element['status_name']=status
        // element['discussion_with_name']=discussWith
        element['selected']=false
        element['is_dropDown']=false
        this.allChecked && element.selected ==true
      });

      this.mainData = JSON.parse(JSON.stringify(this.tbody));
      
      // this.tbody = this.tbody.map(product => ({ ...product, selected: false }));

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
      this.is_show    = false
      this.is_clear   = false
      this.is_loading = false

    },(error)=>{
      this.is_show  = false
      this.is_clear = false
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
  countFilters(){
    this.filterCount = 0;
    Object.keys(this.inquiryForm.value).forEach((item:any)=>{
      if((this.inquiryForm.value[item] != '' && this.inquiryForm.value[item] != null)){
        this.filterCount++;
      }
    })
    if(this.inquiryForm.value?.date && this.inquiryForm.value?.date?.startDate == null){
      this.filterCount--;
    }
  }
  
  handleShow(){
    this.is_show = true
    this.tbody = []
    this.reloadData()
  }

  exportInquiry(format){
    if(this.selectedArray?.length == 0){
      this.toster.showError("please check the checkbox")
      return
    }
    this.downloadPdfAndExcel(format)
  }

  followUp(format){
    if(this.selectedArray?.length == 0){
      this.toster.showError("please check the checkbox")
      return
    }
    if (format == 'pdf') {
      this.isFollowUpPDF = true;
    } 
    else {
      this.isFollowUpEXCEL = true;
    }
    const payload = {
      branch_id : this.branch_id,
      // followUpIds : this.selectedArray,
      document_type : format,
      inquiryIds : this.selectedArray
    }

    this.inquiryService.exportData(payload).subscribe(async (res: any) => {
      if (res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if (data.status == false) {
          this.toastr.showError(data.message);
        }
      } else {
        this.commonService.downloadFile(res, 'Inquiry Follow Up', format);
      }
      this.isFollowUpPDF = false;
      this.isFollowUpEXCEL = false;
    },async (error) => {
      if(error?.error?.type == 'application/json') {
        const data = JSON.parse(await error?.error.text());
        if(!data.status){
          this.toastr.showError(data.message)
        }
      }
      else{
        this.toastr.showError(error?.error?.message ?? error?.message)
      }
      this.isFollowUpPDF = false;
      this.isFollowUpEXCEL = false;
    })
    this.isFollowUpPDF = false;
    this.isFollowUpEXCEL = false;
  }

  downloadPdfAndExcel(format){

    if (format == 'pdf') {
      this.isPdfLoading = true;
    } 
    else {
      this.isExcelLoading = true;
    }
    
    const payload = {
      branch_id : this.branch_id ,
      academic_year_id : this.currentYear_id ,
      inquiryIds : this.selectedArray,
      type : format,
      status     : this.inquiryForm?.value?.status?.length > 0 ? this.inquiryForm?.value?.status.map(ele => ele.id) : null ,
      section_id : this.inquiryForm?.value?.section ? [this.inquiryForm?.value?.section] :[]  , 
      class_id   : this.getID(this.inquiryForm?.value?.standard) || [] ,
      start_date : this.inquiryForm?.value?.date?.startDate?.format('DD-MM-YYYY') || '',
      end_date   : this.inquiryForm?.value?.date?.endDate?.format('DD-MM-YYYY') || '',
      is_visible : this.inquiryForm?.value?.is_visible,
      download_fields : this.getID(this.inquiryForm?.value?.download_fields) || []
    }
  
    this.inquiryService.exportExcel(payload).subscribe((res:any)=>{
      this.isPdfLoading = false;
      this.isExcelLoading = false;
      this.commonService.downloadFile(res, 'Inquiry', format);
    },(error) => {
      this.isPdfLoading = false;
      this.isExcelLoading = false;
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
    this.isPdfLoading = false;
    this.isExcelLoading = false;
  }

  multiDelete(){
    if(this.selectedArray?.length == 0){
      this.toster.showError("please check the checkbox")
      return
    }

    const isDelete = confirm( "Do you want to Delete Inquiry" )
    
    if(!isDelete) return
    
    this.is_multiDelete = true

    const payload = {
      branch_id : this.branch_id,
      inquiry_ids : this.selectedArray
    }

    this.inquiryService.multiDelete(payload).subscribe((res:any)=>{
      if(res?.status){
        this.toster.showSuccess(res.message)
        this.is_multiDelete = false
        this.selectedArray = []
        this.reloadData()
      }
      else{
        this.toastr.showError(res.message)
        this.is_multiDelete = false
      }
    },(error:any)=>{
      this.is_multiDelete = false
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  getEmployeeList(){
    const payload = {
      branch_id : this.branch_id ,
    }

    this.inquiryService.getEmployeeList(payload).subscribe((res:any)=>{
      this.employeeList = res?.data?.map((obj : any) => ({...obj,name: obj.full_name}))
    },(error:any)=>{
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  deleteInquiry(id:number){

    const isDelete = confirm( "Do you want to Delete Inquiry" )

    if(!isDelete) return

    this.is_singleDelete = true

    this.inquiryService.deleteInquiry(id).subscribe((res:any)=>{
      
      if(res?.status){
        this.toster.showSuccess(res.message)
        this.is_singleDelete = false

        this.reloadData()
      }
      else{
        this.toastr.showError(res.message)
      }
      this.is_singleDelete = false

    },(error:any)=>{
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }
  
  // Modal Open
  openModal(modalname:any = null,isMulti:boolean ,id:any=null){
    // 0 -> Multi
    // 1 -> Single

    if(isMulti){
      if(this.selectedArray?.length == 0){
        this.toster.showError("Please Check the Checkbox")
        return
      }
      this.messageArray = this.selectedArray
    }
    else{
      this.messageArray = [id]
    }
    this._modalService.open(modalname);
  }

  // SMS Send
  sendMessage( ) {

    if(!this.note?.trim()?.length){
      this.toastr.showError("Please Enter the Valid Message ")
      this.note = ''
      return
    }
    if( !this.message.send_for_father && !this.message.send_for_mother && !this.message.send_for_student ){
      this.toastr.showError("Please Select Father or Mother or student")
      return
    }

    this.is_sendSms = true

    const payload = {
      branch_id : this.branch_id,

      send_for_father  : this.message.send_for_father ? 1: 0 ,
      send_for_mother  : this.message.send_for_mother ? 1: 0 ,
      send_for_student : this.message.send_for_student ? 1: 0 ,

      message   : this.note,
      inquiries : this.messageArray 
    }

    this.inquiryService.sendSMS(payload).subscribe((res:any)=>{

      if(res.status){
        this.toster.showSuccess(res.message)

        this.message.send_for_father = true
        this.message.send_for_mother = true
        this.message.send_for_student = true
        this.note = ''

        this.is_sendSms = false
        this.closeModel()
      }else{
        this.toster.showError(res.message)
        this.is_sendSms = false
      }

    },(error:any)=>{
      this.is_sendSms = false
      this.toastr.showError(error?.error?.message ?? error?.message)
    })

  }

  // MODAL THINGS
  closeModel() {
    this.is_sendSms = false
    this.note = ''
    this.selectedOption = ''
    this.rejectReason= ''

    this.messageArray = []
    this._modalService.dismissAll()
  }

  handleClear(){
    this.is_clear = true
    this.inquiryForm.reset()
    this.inquiryForm.controls['date'].patchValue('')
    this.inquiryForm.controls['section'].patchValue('')
    this.inquiryForm.controls['standard'].patchValue('')
    this.inquiryForm.controls['status'].patchValue('')
    this.inquiryForm.controls['is_visible'].patchValue(0)
    this.inquiryForm.controls['form_builder_id'].patchValue(null)
    this.getClassesList()
    this.tbody = []
    this.reloadData()
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

  handleStatus(item: any, statusChange: boolean = false, status: any = null, modalName: any = '') {
    const obj = this.tbody?.find((obj: any) => obj.id == item.id);
  
    if (!obj) {
      return;
    }
    obj.is_dropDown = !obj.is_dropDown;

    if(statusChange){
      if(status == 4){
        this.selectedItem = item 
        this.selectedStatusId = status

        this.openRejectModal(modalName,item)
        this.cdr.detectChanges()  
      }else{
        this.updateStatus(item ,status)
      }
    }
  }
  
  updateStatus(item: any, status: any ){
      const payload = {
        branch_id: this.branch_id,
        status: status
      };
  
      this.inquiryService.statusChange(payload, item.id).subscribe(
        (res: any) => {
          if(res.status){
            this.toster.showSuccess(res.message);
            if(status == 3){
              this.route.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.STUDENT_ADD}`,item.id])
            }
            else{
              this.reloadData();
            }
          }
          else{
            this.toster.showError(res.message);
          }
        },
        (error: any) => {
          this.toastr.showError(error?.error?.message ?? error?.message);
        }
      );
  }

  sendSMS(array){
    const payload = {
      branch_id: 1,
      send_for : 3,
      message : "hello",
      inquiries : [1]
    }
    this.inquiryService.sendSMS(payload).subscribe((res:any)=>{

    },(error:any)=>{
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }
  
  closeRejectModel() {
    this.tbody=this.mainData
    this.rejectReason = ''
    this.reject_by = ''
    this._modalService.dismissAll()
  }

  closeReciptDownloadModel() {
    this.selectedData = null
    this._modalService.dismissAll()
  }

  openRejectModal (modalname,item) {
    this.selectedData = item
    this.rejectReason = ''
    this.reasonId = null
    this._modalService.open(modalname);
  }

  openReciptDownloadModel(modalname,item) {
    this.selectedData = item
    this.selectedData.fees_status.forEach(element => {
      element.selected = false
    });
    this._modalService.open(modalname);
  }

  handleFeesStatus(value:any){
    this.reject_by = value;
  }

  reject() {
    if(this.reject_by == ''){
      this.toastr.showError('Please select reject by');
      return
    }
    if(!this.reason_for_rejection){
      this.toastr.showError('Please Select Reason for rejection');
      return
    }
    if(this.rejectReason.trim() == ''){
      this.toastr.showError('Please enter rejection Remark');
      return
    }
    this.isRejectReason = true

    const payload = {
      status: 4,
      date_for_rejection: moment().format('DD-MM-YYYY'),
      reject_by: this.reject_by,
      reason_for_rejection: this.rejectReason,
      reject_remark_id : this.reason_for_rejection ,
    };

    this.inquiryService.statusChange(payload, this.selectedData.id).subscribe((res: any) => {
        this.toster.showSuccess(res.message);
        this.selectedData = null
        this.isRejectReason = false
        this.closeRejectModel()
        this.reloadData()
      },(error: any) => {
        this.selectedData = null
        this.isRejectReason = false
        this.toastr.showError(error?.error?.message ?? error?.message)
      }
    );
  }

  downloadRecipt() {

    const downloadCategoryList = this.selectedData.fees_status.filter((ele) => ele.selected)

    if (downloadCategoryList.length > 0) {
      this.isDownloadRecipt = true
      const payload = {
        inquiry_id: this.selectedData.id,
        fees_category: downloadCategoryList.map((ele) => ele.id) ?? []
      }

      this.inquiryService.downloadFeesRecipt(payload).subscribe(async (res: any) => {
        this.isDownloadRecipt = false
        if (res?.body?.type == 'application/json') {
          const data = JSON.parse(await res.body.text());
          if (data.status == false) {
            this.toastr.showError(data.message);
          }
        } else {
          this.commonService.downloadFile(res, 'inquiry_fees_recipt', 'pdf');
        }
        this.selectedData = null
        this.closeReciptDownloadModel()
      }, (error: any) => {
        this.isDownloadRecipt = false
        this.selectedData = null
        this.toastr.showError(error?.error?.message ?? error?.message)
      }
      );

    } else {
      this.toastr.showError('Please select at least 1 category !!')
    }

  }

  onCheckboxChange(event: Event| null, item?: any) {
    let newValue
    let checkbox = event?.target as HTMLInputElement;
    if(event){
      // if(this.selectedArray?.length == 0 && !item){
      //   this.toster.showError("please check the checkbox");
      //   checkbox.checked = !checkbox.checked;
      //   return
      // }
       newValue = checkbox.checked;
    } else {
      newValue = this.isVisibility;
    }
  
    let confirmMessage = !newValue
      ? 'If you disable this toggle button, the inquiry will no longer be visible to other users in the inquiry list.'
      : 'If you enable this toggle button, the inquiry will become visible to other users in the inquiry list.';
  
    const confirm = window.confirm(confirmMessage);
    
    if (confirm) {
      item ? item.is_visible = newValue ? 2 : 1 : '';

      const payload = { 
        is_visible: newValue ? 2 : 1,
        inquiries : item ? [item.id] : this.selectedArray
      };

      this.inquiryService.visibilityUpdate(payload).pipe(takeUntil(this.$destroy)).subscribe(
        (res: any) => {
          if (res.status) {
            this.isVisibility = false
            this.toastr.showSuccess(res?.message);
            this.reloadData()
          } else {
            if(event){
              checkbox.checked = !checkbox.checked;
            }
            this.toastr.showError(res?.message);
          }
        },
        (error) => {
          checkbox.checked = !checkbox.checked;
          this.toastr.showError(error?.error?.message ?? error?.message);
        }
      );
    } else {
      // Revert the checkbox to its original value if not confirmed
      checkbox.checked = item.is_visible == 2 ? true : false;
    }
  }

  exportInquiryStatusLog(format){
    if(this.selectedArray?.length == 0){
      this.toster.showError("please check the checkbox")
      return
    }
    this.downloadPdfAndExcelOfStatusLog(format)
  }

  downloadPdfAndExcelOfStatusLog(format){

    if (format == 'pdf') {
      this.isPdfLoadingStatusLog = true;
    } 
    else {
      this.isExcelLoadingStatusLog = true;
    }
    
    const payload = {
      branch_id : this.branch_id ,
      academic_year_id : this.currentYear_id ,
      ids : this.selectedArray,
      type : format
    }
  
    this.inquiryService.exportStatusLog(payload).subscribe(async (res: any) => {

      if (res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if (data.status == false) {
          this.toastr.showError(data.message);
        }
      } else {
        this.commonService.downloadFile(res, 'Inquiry Status Log', format);
      }

      this.isPdfLoadingStatusLog = false;
      this.isExcelLoadingStatusLog = false;
    }, async (error) => {
      if(error?.error?.type == 'application/json') {
        const data = JSON.parse(await error?.error.text());
        if(!data.status){
          this.toastr.showError(data.message)
        }
      }else{
        this.toastr.showError(error?.error?.message ?? error?.message)
      }

      this.isPdfLoadingStatusLog = false;
      this.isExcelLoadingStatusLog = false;
    })
    this.isPdfLoadingStatusLog = false;
    this.isExcelLoadingStatusLog = false;
  }

  async openFeesPaymentModel(item) {
    const modalRef = this._modalService.open(InquiryFeesModelComponent, {
      // centered: true,
      size: 'lg',
      backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });

    const filteredData = item?.fees_status.filter((ele)=> ele?.status !== 1)
    // Pass data to the modal component
    const data = {
      type : 'list',
      id : item.id,
      class_name : item.class,
      class_id : item.class_id,
      student_name : item.student_name,
      feesDetails : filteredData
    }

    modalRef.componentInstance.inquiryData = data;

    await modalRef.result.then((response: any) => {
      if (response.status) {
        this.reloadData();
      }
    })
  }

  downloadReport(format:any){
    if(format == 'pdf'){
      this.isReportPDF = true
    }else{
      this.isReportEXCEL = true
    }
    let data = {
      section_id : this.inquiryForm?.value?.section ? [this.inquiryForm?.value?.section] :[]  , 
      class_id   : this.getID(this.inquiryForm?.value?.standard) || [] ,
      start_date : this.inquiryForm?.value?.date?.startDate?.format('DD-MM-YYYY') || '',
      end_date   : this.inquiryForm?.value?.date?.endDate?.format('DD-MM-YYYY') || '',
    }

    this.inquiryService.downloadReport(data,format).subscribe((res:any)=>{
      this.commonService.downloadFile(res,'Inquiry Report',format)
      this.isReportPDF = false
      this.isReportEXCEL = false
    }, (error:any)=>{
      this.isReportPDF = false
      this.isReportEXCEL = false
      if(error.status == 404){
        this.toastr.showError('No Data Found!')
      }else{
        this.toastr.showError('Something went wrong')
      }
    })
  }

  isActiveStatus(id: number): boolean {
    const statusList = this.inquiryForm?.value?.status;
    return Array.isArray(statusList) && statusList?.some((status: any) => status.id == id);
  }

  handleStatusClicked(obj: any) {
    const selectedArray = this.inquiryForm.value.status || [];
  
    const index = selectedArray.findIndex((item: any) => item.id == obj.id);
  
    if (index !== -1) {
      selectedArray.splice(index, 1);
    } else {
      selectedArray.push(obj);
    }
  
    this.inquiryForm.controls['status'].patchValue([...selectedArray]);
  
    this.tbody = []
    this.reloadData()

  }

  isDateToday(obj:any) {
    if (!obj || obj.inquiry_follow_up?.length == 0 ) return false;

    const today = new Date().setHours(0, 0, 0, 0);
    const isTrue = obj.inquiry_follow_up?.some((followUp:any)=> today == new Date(followUp.next_follow_up_date).setHours(0, 0, 0, 0) )
    return isTrue;
  }

  // CRUD DROPDOWN
  selectionChange(event) {
    this.reason_for_rejection = event?.id
  }
  createAndUpdateData(event) {
    if(!event?.id && !event?.name ){
      alert("Please add Reject Reason in search")
      return
    }
    const payload = {
      reason : event.name
    }

   this.inquiryService.addEditReason( payload , event?.id ).subscribe((res:any)=>{
     if(res?.status){
      this.reasonId = res.data.id
      this.reason_for_rejection = res.data.id
       event?.id ?  this.toastr.showSuccess("Updated Successfully") : this.toastr.showSuccess("Created Successfully")
       this.getRejectReasonList( event?.name )
      }
      else if(res?.status == false){
        alert(res?.message?.name)
      }
   })
  }
  deleteData(event:any) {
    this.inquiryService.deleteReason( event ).subscribe((res:any)=>{
      if(res?.status){
        this.toastr.showSuccess(res?.message)
        this.getRejectReasonList()
      }
      else{
        this.toastr.showError(res?.message)
      }
   },(error:any)=>{
    this.toastr.showError(error?.error?.message || error?.message)
   })
  }

  getRejectReasonList(name:any=''){
    this.inquiryService.getListReason().subscribe((res:any)=>{
      if(res.status){
        this.reasonList = res.data?.map((data:any)=>({id:data.id,name:data.reason}))
        if(name){
          this.reasonId = this.reasonList?.find(ele=>ele.name == name )?.id
        }
      }

    },(error:any)=>{
      this.toastr.showSuccess(error?.error?.message || error?.message)
    })
  }

  getAllEmployee() {
    this.inquiryService.getAllEmployee().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.responsibleUserList = res.data.map((ele:any) => {
          return {
            id: ele.id,
            name: ele.full_name
          }
        })
        this.responsibleUserList?.unshift({id:'',name:'Select All'})
      }
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.inquiryForm = this._fb.group({
        date: [ null ] ,
        section: [''] ,
        standard: [''] ,
        status: [[]],
        download_fields: [],
        is_visible: [0],
        form_builder_id : [null],
      })
      this.responsibleForm = this._fb.group({
        assign_user_id : [ null ]
      })
    }

    // Section dropdown data
    getSectionList() {
      this.inquiryService.getSectionList({ branch: this.branch_id }) .subscribe((res: any) => {
        if (res.status) {
          this.sectionsList = [...this.sectionsList, ...res.data ] ;
        }
      });
    }

    // Class dropdown data
    getClassesList(){
      this.standardList = []
      this.inquiryForm.controls['standard'].patchValue('')

      const payload = {
        academic_year_id : this.currentYear_id ,
        branch_id        : this.branch_id ,
        ...(this.inquiryForm?.value?.section && { section : this.inquiryForm?.value?.section || ""}) ,
      }
      this.inquiryService.getClass(payload).subscribe((res: any) => { 
        if(res?.status){
          this.standardList = [ ...this.standardList  , ...res?.data ]
        }
      } )
     
    }
    getID(data: any){
      if (data == null || data?.length == 0) {
        return []
      }
      return data.map((item:any) => item.id)
    }

    setUrl(url: string) {
      return '/' + window.localStorage.getItem("branch") + '/' + url;
    }

    getNotificationSetting () {
      this.inquiryService.getInquiryFeesSetting().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status || res.data){
          this.isInquirySetting = res.data.collect_inquiry_fees
        }
        // this.dtRender  = true
        this.getShowFieldData()
      })
    }

    getShowFieldData () {
      this.inquiryService.getFieldData().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.inquiryFieldData = res.data;
        this.dtRender  = true
        this.initDatatable();
      })
    }

    getCollumn(): Array<any> {
      const hasPermission = this.commonService.hasPermission('inquiry_inquiry_visibility', 'has_edit') ||
                            this.commonService.hasPermission('inquiry_inquiry_visibility', 'has_access');
    
      // Define the common columns
      const columnData = [
        { data: 'id', orderable: false, searchable: false },
        { data: 'inquiry_no' },
        { data: 'create_at' },
        { data: 'class', name:'class.name' },
        { data: 'section', name:'class.section.name' },
        { data: 'student_name' },
        // { data: 'student_mobile' },
        { data: 'parent_mobile' },
        { data: 'mother_number' },
        // { data: 'discussion_with' },
        {data: 'inquiryFormBuilder.form_name' },
        { data: 'status' },
      ];
    
      // Add 'visibility' column if the user has permission
      if (hasPermission) {
        columnData.push({ data: 'visibility', orderable: false, searchable: false });
      }

      // Conditionally add 'inquiry_fees_status' if enabled in settings
      if (this.isInquirySetting) {
        columnData.push({ data: 'fees_status' });
      }

      if(this.inquiryFieldData?.format_data_details?.discussion_with?.is_visible){
        columnData.push({ data: 'discussion_with' });
      }
      // Add common columns after the permission-based one
      columnData.push(
        // { data: 'status' },
        { data: 'update_at' },
        { data: 'action', orderable: false, searchable: false }
      );
        
      return columnData;
    }

    getFormList() {
      this.inquiryService.getFormList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if (res.status) {
          this.formList = res.data.map((ele)=>{
            return { id: ele.id, name: ele.form_name }
          })
        }
      })
    }

    getPDFDownloadFields() {
      this.inquiryService.getPDFDownloadFields().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status) {
          this.downloadFields = res?.data;
        }
      })
    }
	
  //#endregion Private methods
}

