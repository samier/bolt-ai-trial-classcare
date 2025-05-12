import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { Subject } from 'rxjs';
import { HomeworkService } from '../homework.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-notice-list',
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.scss']
})
export class NoticeListComponent implements OnInit {
  //#region Public | Private Variables

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  attachmentType: string="";
  noticeForm : FormGroup = new FormGroup({})
  notice:any = []

  is_show:boolean = false
  is_clear:boolean = false

  sections  : any[] = [{ id: "", name: 'All Section' }];
  faculty   : any = []
  classes   : any = []
  noticeDropDown : any[] = [
    {name:"School Notice"       , id:1 },
    {name:"Notice for Employee" , id:2 },
    {name:"Notice for Class"    , id:3 },
  ]
  page:number = 0
  length:number = 10

  $destroy: Subject<void> = new Subject<void>();
  isNotice:boolean = false

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public commonService: CommonService,
    public homeworkService : HomeworkService,
    private route: ActivatedRoute,
    public CommonService: CommonService,
    private formBuilder: FormBuilder,
    private toastr: Toastr,

  ) {
    const params = this.route?.snapshot?.routeConfig?.path;
    let parts = params?.split('-')[0];
    this.attachmentType = parts ?? ''
  }
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.notice = []
    this.page   = 0
    this.length = 10
    this.initForm()
    this.getSectionList()
    this.getClass()
    this.getFacultyList()
    // this.noticeForm = this.formBuilder.group({})
    this.getNotice()
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
    this.noticeForm.controls['classId'].patchValue([])
    this.classes = []
    this.getClass()
  }
  onClassChange(){

  }
  onNoticeChange(){
  }
  show(show = false){
    
    const classIDs= this.getID(this.noticeForm.value.classId) ?? []

    const payload = {
      
      attachmentType : "notice",
      branchId       : this.branch_id ,
      academicYear   : this.currentYear_id ,
      start          : this.page ? ((this.page * this.length) - 1) : 0,
      length         : this.length,
      sectionId      : this.noticeForm?.value?.section_id ,
      classId        : classIDs ,
      workDate       : null,
      submissionDate : null,      
      createdBy      : this.noticeForm?.value?.faculty_id ?? null ,
      ...( this.noticeForm?.value?.noticeType && { noticeType : this.noticeForm?.value?.noticeType } )
    }
    if (this.noticeForm.value.date) {
      const startDate = this.noticeForm?.value?.date?.startDate?.format('YYYY-MM-DD')
      const endDate = this.noticeForm?.value?.date?.endDate?.format('YYYY-MM-DD')

      payload.workDate = startDate ?? null
      payload.submissionDate = endDate ?? null
    }
    if(show){
      this.notice    = []
      payload.start  = 0
      payload.length = this.length
      this.is_show   = true
    }
    this.noticeListApi(payload)
  }

  handleClear(){
    this.notice = []
    this.page   = 0
    this.length = 10
    this.noticeForm?.controls['section_id'].patchValue( "" ) 
    this.getClass()
    this.noticeForm?.controls['date'].patchValue( null )
    this.noticeForm?.controls['faculty_id'].patchValue( null )
    this.noticeForm?.controls['classId'].patchValue( [] )
    this.noticeForm?.controls['noticeType'].patchValue( null )

    this.getNotice()
  }
  delete(id:number , card:any ){
    const isDelete = window.confirm(`Are you sure ,You want to delete ${card} Notice`)
    if(isDelete){
      this.homeworkService.deleteNotice(id).subscribe((res:any)=>{
        if(res?.status){
          this.toastr.showSuccess("Notice deleted Successfully");
        }
        this.page   = 0
        this.length = 10
        this.notice = []
        this.getNotice()
      })
    }
  }
  openLinkInNewTab(url:string) {
    window.open(url,'_blank')
  }
  download(url: string, filename) {
    let dataurl = url.replace(/&amp;/g, '&');
    const link = document.createElement("a");
    link.href = dataurl;
    link.download = filename;
    link.target = "_blank";
    link.click();
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.noticeForm = this.formBuilder.group({
      section_id : [ "" ],
      classId    : [ [] ] ,
      date       : [ null ],
      faculty_id : [ null ],
      noticeType : [ null ]
    })
  }
  getNotice() {
    this.show()
  }

  getID(obj:any){
    if(!obj || obj?.length ==0 ){
      return
    }
    const ids = obj?.map(obj => obj.id)
    return ids
  }
  onScroll(){
    this.page++
    this.show()
  }
  // API CALLING FUNCTION

  // NOTICE DATA
  noticeListApi(payload:any){
    this.isNotice = true

    this.homeworkService.getNoticeList(payload).subscribe((res:any)=>{
      if(res.status){
        // this.notice = res?.data?.original?.data
        const tempNotice = res?.data?.original?.data?.map((obj: { create_at: any; }) => {
          const data = this.data_time(obj?.create_at)
          return {
            ...obj,
            date : data[0],
            time : data[1],
          }
        } ) 
        this.isNotice = false

        this.notice = [...this.notice,...tempNotice]
        this.is_show = false
      }
      this.is_show = false

    }, (error) => {
      this.isNotice = false

    })
  }
  data_time(data: any) {
    const utcDate = new Date(data);

    const options = {
      timeZone: 'Asia/Kolkata',
      day    : '2-digit' as '2-digit' ,
      month  : '2-digit' as '2-digit',
      year   : 'numeric' as 'numeric' ,
      hour   : '2-digit' as '2-digit',
      minute : '2-digit' as '2-digit',
    };

    const istDateStr = utcDate.toLocaleString('en-IN', options);

    const [date, time]       = istDateStr.split(', ');
    const [day, month, year] = date.split('/');

    const formattedDate = `${day}-${month}-${year}`;

    return [formattedDate , time]
  }
  // Section dropdown data
  getSectionList() {
    this.homeworkService
      .getSectionList({ branch: this.branch_id })
      .subscribe((res: any) => {
        if (res.status) {
          this.sections = [...this.sections, ...res.data];
        }
      });
  }
  // CLASS DROPDOWN
  getClass(){
    const payload = {
      academic_year_id : this.currentYear_id ,
      branch_id        : this.branch_id ,
      user_id          : this.user_id,
      ...(this.noticeForm?.value?.section_id &&{section_id: this.noticeForm?.value?.section_id ?? ""}) ,
    }
    this.homeworkService.getClass(payload,this.user_id).subscribe((res: any) => { 
      if(res?.status){
        this.classes = res?.data;
      }
    } )
  }
  // Faculty dropdown data
  getFacultyList() {
    this.homeworkService
      .getFacultyList()
      .subscribe((res: any) => {
        this.faculty = res.data;
      });
  }
  //#endregion Private methods
}