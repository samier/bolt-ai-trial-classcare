import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ComplainService } from '../complain.service';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComplainThreadComponent } from '../complain-thread/complain-thread.component';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-complain-list',
  templateUrl: './complain-list.component.html',
  styleUrls: ['./complain-list.component.scss']
})
export class ComplainListComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  complainForm: FormGroup = new FormGroup({})
  dtOptions : DataTables.Settings = {}
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null

  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  userID   : any = window.localStorage.getItem('user_id');

  filterCount : number = 0
  filter: boolean = true

  is_showLoading: boolean = false
  is_resetLoading: boolean = false
  is_loading: boolean = false
  attachment_loading: boolean = false;

  isComplain: boolean = false;

  sectionList : any = [ { id:'', name:"All Section" } ]
  classList   : any = []
  batchList   : any = []
  studentList : any = []
  employeeList : any = []
  attachments:any = [];
  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };

  priorityList : any = [
    { id : 1 , name:"Low" },
    { id : 2 , name:"Normal" },
    { id : 3 , name:"High" }
  ]
  statusList : any = [
    { id: 1, name: 'Open' },
    { id: 2, name: 'In Progress' },
    { id: 3, name: 'Close' },
    { id: 4, name: 'Reopen' },
  ]

  statuses : any = [
    { id: 1, name: 'Open' },
    { id: 2, name: 'In Progress' },
    { id: 3, name: 'Close' },
    { id: 4, name: 'Reopen' },
  ];

  tbody : any = []
  type: number = 1;

  totalRecords : number = 0
  searchComplain : any = ''
  draw : any = 1
  length : any = 50
  columns: any = [
    {
      data: "title",
      name: "",
      searchable: true,
      orderable: false,
      search: {
        value: "",
        regex: false
      }
    },
    {
      data: "created_by_student.first_name",

      name: "",
      searchable: true,
      orderable: false,
      search: {
        value: "",
        regex: false
      }
    },
    {
      data: "complain_for_user.first_name",
      name: "",
      searchable: true,
      orderable: false,
      search: {
        value: "",
        regex: false
      }
    }
  ]

  search : any = {
    value : '',
    regex : false
  }
  searchSubject = new Subject<string>();
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private ComplainService : ComplainService,
    private toaster : Toastr,
    private _modalService : NgbModal,
    public dateFormateService : DateFormatService
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.card()
    this.onSectionChange()
    this.classChange()
    this.batchChange()
    this.getEmployeeList()
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.handleSearchComplain();
    });
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

  handleClear(){
    this.is_resetLoading = true
    this.classList   = []
    this.batchList   = []
    this.studentList = []
    this.complainForm.reset()
    this.complainForm.controls['sectionF'].patchValue(null)

    this.classChange()
    this.batchChange()
    this.tbody = []
    this.draw = 1
    this.searchComplain = ''
    this.card()
  }

  handleShow(){
    this.is_showLoading = true
    this.draw = 1
    this.tbody = []
    this.card()
  }

  // Status Change
  onStatusChange(itemId: number, event: Event) {
    const selectedValue = Number((event.target as HTMLSelectElement).value);
    const payload = {
      status: selectedValue
    }
    this.ComplainService.updateStatus(itemId,payload).subscribe((res:any)=>{
      if(res.status){
        this.toaster.showSuccess(res.message);
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error.error.message || error.message )
    })
    // const item = this.tbody.find((task) => task.id === itemId);
    // if (item) {
    //   item.status = +selectedValue; // Convert string to number
    // }
  }

  // FOR COMPLAIN DELETE
  HandleComplainDelete(complain:any){
    const con = confirm(`Are you sure Want to delete ${complain.title} Complain`)
    if(con){
      this.ComplainService.deleteComplain(complain.id).subscribe((res:any)=>{
        if(res.status){
          this.toaster.showSuccess(res.message)
        }
        else{
          this.toaster.showError(res?.message)
        }
      },(error:any)=>{
        this.toaster.showError(error?.error?.message ?? error?.message)
      })
    }
  }

  onSectionChange(){

    this.classList   = []
    this.batchList   = []
    this.studentList = []

    this.complainForm.controls['classF'].patchValue(null)
    this.complainForm.controls['batchF'].patchValue(null)
    this.complainForm.controls['studentF'].patchValue(null)

    this.ComplainService.fetchSection().subscribe((res:any)=>{
      if (res.status) {
        this.sectionList = [...this.sectionList, ...res.data];
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  classChange(){

    this.classList   = []
    this.batchList   = []
    this.studentList = []

    this.complainForm.controls['classF'].patchValue([])
    this.complainForm.controls['batchF'].patchValue([])
    this.complainForm.controls['studentF'].patchValue([])

    const payload = {
      userID           : this.userID,
      ...( this.complainForm?.value?.sectionF && { sectionID: this.complainForm?.value?.sectionF ?? [] } ) ,
    }
    this.ComplainService.fetchClass(payload).subscribe((res:any)=>{
      if(res.status){
        this.classList = res.data;
      }
      else{
        this.toaster.showError(res.message)
      }

    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  batchChange(){

    this.batchList = []
    this.studentList = []

    this.complainForm.controls['batchF'].patchValue(null)
    this.complainForm.controls['studentF'].patchValue(null)

    const payload = {
      // classes  : this.complainForm.controls['classF'].value || []  
      classes  : this.getID( this.complainForm.controls['classF'].value ) || []  
    }
    this.ComplainService.fetchBatch(payload).subscribe((res:any)=>{
      if(res.status){
        this.batchList = res.data
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  getEmployeeList(){
    const payload = {
      // role_id   : this.getID(this.addNoticeForm?.value?.roleId) ,
    }
    this.ComplainService.fetchEmployeeList(payload).subscribe((res:any)=>{
      this.employeeList = res?.data?.map((obj:any)=>{
        return {
          ...obj,
          name: obj?.full_name
        }
      })
    })
  }

  studentChange(){

    this.studentList = []
    this.complainForm.controls['studentF'].patchValue(null)

    const payload = {
      batches  : this.getID( this.complainForm.controls['batchF'].value ) || []  
    }
    this.ComplainService.fetchStudent(payload).subscribe((res:any)=>{
      if(res.status){
        this.studentList = res.data
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }
  switch_to(type: any, isInit?) {
    this.type = type;
  }

  attachment(content:any, row:any,attachments : any){
    this.attachment_loading = true;
    this.attachments = null;
    // this.attachments = this.tbody.find(item => item.id == row).attachments
    this.attachments = attachments
    this.attachments?.forEach(element => {
      if(element.attachment_url){
        element.attachment_url = element.attachment_url.replace(/&amp;/g, '&');
      }
    });
    this.attachment_loading = false;
    this._modalService.open(content,{
      size: 'lg',
      centered: true
    })
  }

  // CARD LIST
  card(){
    this.isComplain = true
    const payload = {
      length      : this.length ,
      draw        : this.draw,
      start       : (this.draw-1)*this.length ,
      columns     : this.columns,
      search      : this.search ,
      type        : 2 ,
      section_id  : this.complainForm.controls['sectionF'].value ? [this.complainForm.controls['sectionF'].value] : [],
      classIds    : this.getID(this.complainForm.controls['classF'].value),
      batchIds    : this.getID(this.complainForm.controls['batchF'].value),
      studentIds  : this.getID(this.complainForm.controls['studentF'].value),
      ids         : this.getID(this.complainForm.controls['complainForEmpF'].value),
      priority    : this.complainForm.controls['priorityF'].value && this.complainForm.controls['priorityF'].value.length > 0 
                    ? this.complainForm.controls['priorityF'].value.map((item: any) => item.id) : [],
      status      : this.complainForm.controls['statusF'].value && this.complainForm.controls['statusF'].value.length > 0 
                    ? this.complainForm.controls['statusF'].value.map((item: any) => item.id) : [],
      start_date  : this.complainForm?.value?.dateF?.startDate ? this.complainForm?.value?.dateF?.startDate?.format('YYYY-MM-DD') : null ,
      end_date    : this.complainForm?.value?.dateF?.endDate ? this.complainForm?.value?.dateF?.endDate?.format('YYYY-MM-DD') : null
    }
    this.countFilters();

    this.ComplainService.complainList(payload).subscribe((resp: any) => {
      this.totalRecords = resp.recordsTotal
      this.tbody = [...this.tbody, ...resp.data]
      this.is_showLoading = false
      this.is_resetLoading = false
      this.isComplain = false
    },(error:any)=>{
      this.is_showLoading = false
      this.is_resetLoading = false
      this.isComplain = false
    })
  }

  // ON SCROLL
  onScrollChange(){
    this.draw = this.draw + 1
    this.card()
  }

  onSearchChange() {
    this.searchSubject.next(this.searchComplain);
  }

  // SEARCH BOX
  handleSearchComplain(){
    this.draw = 1
    this.search.value = this.searchComplain
    this.tbody = []
    this.card()
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.complainForm = this._fb.group({

      sectionF  : [null],
      classF    : [null],
      batchF    : [null],
      studentF  : [null],
      priorityF : [null],
      dateF     : [null],
      statusF   : [null],
      complainForEmpF  : [null]
      // complainTo : [1]
    })
  }

  // COUNT FILTER
  countFilters(){
    this.filterCount = 0;
    Object.keys(this.complainForm.value).forEach((item:any)=>{
      if((this.complainForm.value[item] != '' && this.complainForm.value[item] != null)){
        this.filterCount++;
      }
    })
    if(this.complainForm.value?.dateF && this.complainForm.value?.dateF?.startDate == null){
      this.filterCount--;
    }
  }

  openLinkInNewTab(data:any){

  }

  getID(data: any){
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
