import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';
import { UserDailyPlanningService } from '../user-daily-planning.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewCompletedLectureComponent } from '../view-completed-lecture/view-completed-lecture.component';
import { lectureStatus } from 'src/app/common-config/static-value';
import { DateFormatService } from 'src/app/service/date-format.service';
import { BatchService } from '../../batch/batch.service';

@Component({
  selector: 'app-lectures-list',
  templateUrl: './lectures-list.component.html',
  styleUrls: ['./lectures-list.component.scss']
})
export class LecturesListComponent implements OnInit {
    //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  lectureFilter : FormGroup = new FormGroup({});
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  user_id: any = window.localStorage.getItem('user_id');
  user_role: any = window.localStorage.getItem('role');
  URLConstants = URLConstants;
  sectionsList: any = [];
  classList: any = [];
  batchList: any = [];
  facultiesList: any = [];
  subjectList: any = [];
  chapterList: any = [];
  statusList: any = lectureStatus;
  tbody: any = [];
  isShowLoading: boolean = false;
  isResetLoading: boolean = false;
  filter: boolean = true;
  filterCount: any = 0;
  hasDelete: boolean = this.CommonService.hasPermission('faculty_lecture_plan', 'has_delete');
  hasEdit: boolean = this.CommonService.hasPermission('faculty_lecture_plan', 'has_edit');
  
  isOpenByClick: boolean = true

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private homeWorkService: HomeworkService,
    private userDailyPlanningService: UserDailyPlanningService,
    public dateFormateService: DateFormatService,
    private batchService: BatchService,
    private toastr: Toastr,
    private _modalService: NgbModal
  ) {}
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.initDataTable();
    this.getSectionsList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  

  onShow(){
    this.isShowLoading = true;
    this.reloadData();
  }

  reset(){
    this.isResetLoading = true;
    this.lectureFilter?.reset();
    this.resetFieldsAndLists(
      ['section_id','class_id', 'batch_id', 'subject_id', 'user_id', 'chapter_id'],
      ['classList', 'batchList', 'chapterList', 'subjectList', 'facultiesList']
    );
    this.lectureFilter?.markAsUntouched();
    this.reloadData();
  }

  resetFieldsAndLists(fields: string[], lists: string[]) {
    lists.forEach(list => this[list] = []);
    fields.forEach(field => this.lectureFilter.controls[field].patchValue(null));
  }
  
  onSectionChange() {
    this.resetFieldsAndLists(
      ['class_id', 'batch_id', 'subject_id', 'user_id', 'chapter_id'],
      ['classList', 'batchList', 'chapterList', 'subjectList', 'facultiesList']
    );
    this.getClassList();
  }
  
  onClassChange() {
    this.resetFieldsAndLists(
      ['batch_id', 'subject_id', 'user_id', 'chapter_id'],
      ['batchList', 'chapterList', 'subjectList', 'facultiesList']
    );
    this.getBatchList();
    this.getSubjectList();
  }

  onBatchChange(){
    this.resetFieldsAndLists(
      ['user_id'],
      ['facultiesList']
    );
    if (this.user_role !== 'ROLE_FACULTY') this.getFacultiesList();
  }
  
  onSubjectChange() {
    this.resetFieldsAndLists(
      ['chapter_id', 'user_id'],
      ['chapterList', 'facultiesList']
    );
    if (this.user_role !== 'ROLE_FACULTY') this.getFacultiesList();
    this.getChapterList();
  }

  async openModal(id: any){
    const modalRef = this._modalService.open(ViewCompletedLectureComponent,{
      centered: true,
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
    
    modalRef.componentInstance.lectureId = id;

    await modalRef.result.then((response: any) => {
      if(response.data) {
        this.reloadData();
      }
    })
  }

  deleteLecture(id: any){
    this.userDailyPlanningService.deleteLecture(id).subscribe((res: any) => {
      if(res?.status){
        this.reloadData();
        this.toastr.showSuccess(res?.message)
      }else{
        this.toastr.showError(res?.message)
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.erros?.message)
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.lectureFilter = this._fb.group({
      section_id: [null],
      class_id: [null],
      batch_id: [null],
      subject_id: [null],
      user_id: [null],
      chapter_id: [null],
      status: [null],
      date: [null]
    })
  }
	
  initDataTable(){
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100 ,200],
      serverSide: true,
      processing: true,
      searching: true,
      order: [[0, 'desc']],
  
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
  
      columns: [
        { data: 'id' ,name: 'id', orderable: false, searchable: false },
        { data: 'class_name', name: 'classes.name' },
        { data: 'batch_name' , name:'batch.name'},
        { data: 'user_name' , name:'user.first_name'},
        { data: 'subject' , name:'subject.name' },
        { data: 'chapter_name', name:'chapter.chapter_name' },
        { data: 'lecture_name' },
        { data: 'status_name', orderable:false , searchable:false },
        { data: 'remark_date' ,name:'remark_date'},
        { data: 'action', orderable: false, searchable: false }
      ] 
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    const startDate = this.lectureFilter?.value?.date?.startDate ?? null;
    const endDate = this.lectureFilter?.value?.date?.endDate ?? null;
    this.countFilters();
    const payload = {
      ...dataTablesParameter,
      section_id: this.getID(this.lectureFilter?.value?.section_id),
      class_id: this.getID(this.lectureFilter?.value?.class_id),
      batch_id: this.getID(this.lectureFilter?.value?.batch_id),
      user_id: this.getID(this.lectureFilter?.value?.user_id),
      subject_id: this.getID(this.lectureFilter?.value?.subject_id),
      chapter_id: this.getID(this.lectureFilter?.value?.chapter_id),
      status: this.getID(this.lectureFilter?.value?.status),
      start_date: startDate?.format('DD-MM-YYYY'),
      end_date: endDate?.format('DD-MM-YYYY'),
    }
    this.userDailyPlanningService.getLecturesList(payload).subscribe((res: any) => {
      this.isShowLoading = false;
      this.isResetLoading = false;
      this.tbody = res?.data?.original?.data
      callback({
        recordsTotal: res?.data?.original.recordsTotal,
        recordsFiltered: res?.data?.original.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    },
    (error: any) => {
      this.isShowLoading = false;
      this.isResetLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occurred');
    })
  }

  reloadData(){
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  countFilters(){
    this.filterCount = 0;
    const filter = this.lectureFilter?.value;
    Object.keys(filter).forEach((item) => {
      if (item === 'date') {
        if (filter[item]?.startDate && filter[item]?.endDate) {
          this.filterCount++;
        }
      }else if (filter[item] && (Array.isArray(filter[item]) ? filter[item].length : true)) {
        this.filterCount++;
      }
    })
  }

  getSectionsList(){
    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).subscribe((res: any) => {
      if(res?.status){
        this.sectionsList = res?.data;
      }
    })
  }

  getClassList(){
    const payload = {
      user_id: this.user_id,
      section: this.getID(this.lectureFilter?.value?.section_id) ?? null
    };
    this.homeWorkService.getClassByMultipleSection(payload).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
      }
    })    
  }

  getBatchList(){
    const payload = {
      classes: this.getID(this.lectureFilter?.value?.class_id) ?? null
    }
    this.homeWorkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data
      }
    })
  }

  getFacultiesList(){
    const payload = {
    batch_id: this.getID(this.lectureFilter?.value?.batch_id) ?? [],
    subject_id: this.getID(this.lectureFilter?.value?.subject_id) ?? [],
  }
  this.userDailyPlanningService.getFacultyList(payload).subscribe((res: any) => {
      if(res?.status){
        this.facultiesList = res?.data?.map((faculty) => {
          return {
            id: faculty.id,
            name: faculty.full_name,
          }
        })
      }
    })
  }

  getSubjectList(){
    const payload = {
      class_id: this.lectureFilter?.value?.class_id ?? null,
    }
    this.batchService.getClassWiseSubject(payload).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.subjectList = res.data.map((ele) => {
          return {
            id: ele.subject_id,
            name: ele.subject_name
          }
        })
      }
    })
  }

  getChapterList(){
    const payload = {
      subject_id: this.getID(this.lectureFilter?.value?.subject_id) ?? [],
    }
    this.userDailyPlanningService.getChapterList(payload).subscribe((res: any) => {
      if(res?.status){
        this.chapterList = res?.data.map((chapter) => {
          return {
            id: chapter.id,
            name: chapter.chapter_name
          }
        }
      )}
    })
  }

  getID(obj:any){
    if(!obj || obj?.length ==0 ){
      return
    }
    const ids = obj?.map(obj => obj.id) ?? []
    return ids
  }

  //#endregion Private methods
}