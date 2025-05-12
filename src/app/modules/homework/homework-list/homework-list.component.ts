import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { HomeworkService } from '../homework.service'
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { Toastr } from 'src/app/core/services/toastr';
import { IDropdown } from 'src/app/types/interfaces';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute } from '@angular/router';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-homework-list',
  templateUrl: './homework-list.component.html',
  styleUrls: ['./homework-list.component.scss']
})
export class HomeworkListComponent implements OnInit {
  //#region Public | Private Variables

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  homeworkForm: FormGroup | any;

  sections: any = [{ id: "", name: 'All Section' }];
  classes: any = [];
  batches: any = [];
  subjects: IDropdown[] = [];
  faculty: any = []
  homework: any = []
  submitted : any
  submitL: boolean = false
  showL: boolean = false
  isHomeWork: boolean = true
  clearL: boolean = false
  $destroy: Subject<void> = new Subject<void>();

  URLConstants=URLConstants;
  shortTime: string|undefined;
  attachmentType: string="";
  currentPage : number = 1
  paginationConfig = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  }

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    public homeworkService: HomeworkService,
    private fb: FormBuilder,
    private formBuilder: FormBuilder,
    private validationService: FormValidationService,
    private toastr: Toastr,
    private route: ActivatedRoute,
    public  dateFormateService : DateFormatService,

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
    this.initForm();
    this.homework = []
    this.currentPage = 1
    this.homeworkList()
    this.getSectionList()
    this.getClass()
    // this.getClassList("")
    this.getFacultyList()
  }

  ngOnDestroy(): void {
    // this.$destroy.next();
    // this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------


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
  // Class dropdown data

  getClass(){
    const payload = {
      academic_year_id : this.currentYear_id ,
      branch_id        : this.branch_id ,
      user_id          : this.user_id,
      ...(this.homeworkForm?.value?.section_id &&{section_id: this.homeworkForm?.value?.section_id ?? ""}) ,
    }
    this.homeworkService.getClass(payload,this.user_id).subscribe((res: any) => { 
      if(res?.status){
        this.classes = res?.data;
      }
    } )
  }

  // getClassList(params: any) {
  //   this.homeworkService
  //     .getClassList(params)
  //     .subscribe((res: any) => {
  //       this.classes = res.data;
  //     });
  // }
  // Batch dropdown data
  getBatchList(id: number) {
    this.homeworkService
      .getBatchesList({ classes: [id] })
      .subscribe((res: any) => {
        this.batches = res.data;
      });
  }
  // Subject DropDown data
  getSubjectList(ids: any) {
    const payLoad = {
      branchId: this.branch_id,
      academicYear: this.currentYear_id,
      batchId: ids
    }
    this.homeworkService
      .getSubjectList(payLoad)
      .subscribe((res: any) => {
        if (res.data) {
          this.subjects = res.data.map((ele) => {
            return { id: ele.subject_id, name: ele.subject_name }
          })
        }
      })
  }
  // Faculty dropdown data
  getFacultyList() {
    this.homeworkService
      .getFacultyList()
      .subscribe((res: any) => {
        this.faculty = res.data;
      });
  }
  getHomeworkList(payLoad:any){
    this.isHomeWork = true
    this.homeworkService
      .getHomeWork(payLoad)
      .subscribe((res: any) => {
        this.paginationConfig.totalItems = res.data.total
        let tempHomework =  Object.keys(res?.data?.data)?.map((dt: string) => ({ date: dt, data: res?.data?.data[dt] }))?.flatMap((d: any)=> d?.data);
        tempHomework = this.formatSubmissionDate(tempHomework);
        this.homework = [...this.homework,...tempHomework ]
        this.showL  = false
        this.clearL = false
        this.isHomeWork = false
      });
    
  }

  // Section Change
  onSectionChange() {
    this.classes = []
    this.batches = []
    this.subjects = []
    this.homeworkForm.controls.class_id.patchValue([])
    this.homeworkForm.controls.batch_id.patchValue([])
    this.homeworkForm.controls.subject_id.patchValue([])
    this.getClass()
    // this.getClassList(this.homeworkForm.value.section_id)
  }

  // Class Change
  onClassChange() {
    this.batches = []
    this.subjects = []
    this.homeworkForm.controls.batch_id.patchValue([])
    this.homeworkForm.controls.subject_id.patchValue([])
    this.getBatchList(this.homeworkForm.value.class_id)
  }

  // Batch Change
  onBatchChange() {
    this.subjects = []
    this.homeworkForm.controls.subject_id.patchValue([])
    const ids = this.homeworkForm.value.batch_id.length > 0 ? this.homeworkForm.value.batch_id.map(ele => ele.id) : []
    this.getSubjectList(ids)
  }

  // Subject Change
  onSubjectChange() {

  }
  onFacultyChange() {
  }

  submit() {
    this.submitted = true;
    this.showL=true
    this.homework = []
    this.currentPage = 1
    this.show()
  }

  show(){
    let payLoad = {
      branchId       : this.branch_id ,
      academicYear   : this.currentYear_id,
      sectionId      : this.homeworkForm?.value?.section_id ,
      classId        : this.homeworkForm?.value?.class_id ,
      batchId        : this.getID(this.homeworkForm?.value?.batch_id) ,
      subjectId      : this.homeworkForm?.value?.subject_id ,
      workDate       : null,
      submissionDate : null,
      isDraft        : this.homeworkForm?.value?.draft ? 1 : 0 , 
      attachmentType : this.attachmentType,
      page : this.currentPage, //this.paginationConfig.currentPage
      createdBy : this.homeworkForm?.value.faculty_id,
      homework_type  : this.homeworkForm.value.homework_type,
    }
    
    if (this.homeworkForm.value.date) {
      const startDate = this.homeworkForm?.value?.date?.startDate?.format('YYYY-MM-DD')
      const endDate = this.homeworkForm?.value?.date?.endDate?.format('YYYY-MM-DD')

      payLoad.workDate = startDate 
      payLoad.submissionDate = endDate
    }
    this.getHomeworkList(payLoad)
  }

  handleClear() {
    this.homework = []
    this.currentPage = 1
    this.clearL = true
    this.homeworkForm.controls.section_id.patchValue( "" ) 
    this.homeworkForm.controls.class_id.patchValue( null )
    this.homeworkForm.controls.batch_id.patchValue( [] )
    this.homeworkForm.controls.subject_id.patchValue( null )
    this.homeworkForm.controls.faculty_id.patchValue( null )
    this.homeworkForm.controls.draft.patchValue( false )
    this.homeworkForm.controls.date.patchValue( null )

    // this.getClassList("")
    this.getClass()
    this.homeworkList()
  }

  homeworkList() {
    const payLoad = {
      branchId: this.branch_id,
      academicYear: this.currentYear_id,
      isDraft: "0",
      attachmentType: this.attachmentType,
      page : this.paginationConfig.currentPage
    }
    this.getHomeworkList(payLoad)
  }

  formatSubmissionDate(objects?: any) {
    return objects?.map(obj => {
      let newObj = obj;

      if (obj?.hasOwnProperty('submission_date')) {
        obj.submission_date = obj?.submission_date?.split(' ')[0];
      }
      if (obj.hasOwnProperty('work_date')) {

        const [date, time] = obj.work_date.split(' ');

        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const isPM = hour >= 12;
        const formattedHours = hour % 12 || 12;
        const ampm = isPM ? 'PM' : 'AM';
      
        const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

        newObj.work_date = date;
        newObj.time = formattedTime;
        // newObj.work_date = newObj?.work_date?.split(' ')[0];
      }

      return newObj;
    });
  }

  delete(id: number, tittle: string) {
    const isDelete = confirm("Do you want to Delete " + tittle)
    if (isDelete) {
      this.homeworkService
        .deleteHomeWork(id)
        .subscribe((res: any) => {
          if (res?.status) {
            this.toastr.showSuccess(res?.message);
            this.homeworkList()
          }
          else {
            this.toastr.showError(res?.message);
          }
        });
    }
  }
  download(url:string){
    window.open(url,'_blank')
  }

  openLinkInNewTab(url:string) {
    window.open(url,'_blank')
  }

  onPageChange(event) {
    this.paginationConfig.currentPage = event
    // this.homeworkList()
    this.show()
  }
  onScrollChange() {
    this.currentPage++
    this.show()
  }

  draftToggle(){
    this.homework = []
    this.currentPage = 1
    this.show()
    // const payLoad = {
    //   branchId: this.branch_id,
    //   academicYear: this.currentYear_id,
    //   isDraft: this.homeworkForm.value.draft ? 1 : 0,
    //   attachmentType: this.attachmentType,
    //   page : this.paginationConfig.currentPage
    // }
    // this.getHomeworkList(payLoad)
  
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.homeworkForm = this.formBuilder.group({
      section_id: [""],
      class_id: [null],
      batch_id: [null],
      subject_id: [null],
      faculty_id: [null],
      date: [null],
      draft: [false]
    });
    this.homeworkForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
      this.homeworkForm.controls['batch_id'].markAsPristine();
      this.homeworkForm.controls['batch_id'].markAsUntouched();
  })
  }
  
  getID(data:any){
    if(data == null || data?.length == 0){
      return []
    }
    return data.map(item =>item.id)
  }

  //#endregion Private methods
}