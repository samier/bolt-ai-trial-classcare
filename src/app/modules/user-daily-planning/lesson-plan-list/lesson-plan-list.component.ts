import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HomeworkService } from '../../homework/homework.service';
import { UserDailyPlanningService } from '../user-daily-planning.service';
import { DataTableDirective } from 'angular-datatables';
import { DateFormatService } from 'src/app/service/date-format.service';
import { lessonPlanStatus } from 'src/app/common-config/static-value';
import { BatchService } from '../../batch/batch.service';

@Component({
  selector: 'app-lesson-plan-list',
  templateUrl: './lesson-plan-list.component.html',
  styleUrls: ['./lesson-plan-list.component.scss']
})
export class LessonPlanListComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  lessonPlanFilter : FormGroup = new FormGroup({});
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  user_id: any = window.localStorage.getItem('user_id');
  user_role: any = window.localStorage.getItem('role');
  URLConstants = URLConstants;
  chapter_id: any;
  sectionsList: any = [];
  classList: any = [];
  batchList: any = [];
  facultiesList: any = [];
  subjectList: any = [];
  chapterList: any = [];
  statusList: any = lessonPlanStatus;
  tbody: any = [];
  isShowLoading: boolean = false;
  isResetLoading: boolean = false;
  filter: boolean = true;
  filterCount: any = 0;
  hasDelete: boolean = this.CommonService.hasPermission('faculty_lesson_plan', 'has_delete');
  hasEdit: boolean = this.CommonService.hasPermission('faculty_lesson_plan', 'has_edit');

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
    private batchService: BatchService,
    private toastr: Toastr,
    public dateFormateService: DateFormatService
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
    this.lessonPlanFilter?.reset();
    this.resetFieldsAndLists(
      ['section_id','class_id', 'batch_id', 'subject_id', 'user_id', 'chapter_id'],
      ['classList', 'batchList', 'chapterList', 'subjectList', 'facultiesList']
    );
    this.lessonPlanFilter?.markAsUntouched();
    this.reloadData();
  }

  resetFieldsAndLists(fields: string[], lists: string[]) {
    lists.forEach(list => this[list] = []);
    fields.forEach(field => this.lessonPlanFilter.controls[field].patchValue(null));
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
  

  onStatusChange(id: any, event: any){
    const selectedValue = Number((event.target as HTMLSelectElement).value);
    const payload = {
      id: id,
      status: selectedValue
    }
    this.userDailyPlanningService.updateLessonPlanStatus(payload).subscribe((res:any)=>{
      if(res?.status){
        this.toastr.showSuccess(res?.message);
      }
      else{
        this.toastr.showError(res?.message)
      }
    },(error:any)=>{
      this.toastr.showError(error.error.message ?? error.message ?? 'An unexpected error occured' )
    })
  }

  onDelete(id: any){
    this.userDailyPlanningService.deleteLessonPlan(id).subscribe((res: any) => {
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.reloadData();
      }
      else{
        this.toastr.showError(res?.message)
      }
    },
    (error: any) => {
      this.toastr.showError(error.error.message ?? error.message ?? 'An unexpected error occured')
    })
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.lessonPlanFilter = this._fb.group({
      section_id: [null],
      class_id: [null],
      batch_id: [null],
      subject_id: [null],
      user_id: [null],
      chapter_id: [null],
      mark: [null],
      date: [null],
      no_of_lecture: [null],
      status: [null],
    })
  }
	
  initDataTable(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100 ,200],
      serverSide: true,
      processing: true,
      searching: true,
  
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
  
      columns: [
        { data: '', orderable: false, searchable: false },
        { data: 'subject' ,name :'subject.name' },
        { data: 'user_name',name : 'user.first_name' },
        { data: 'chapter_name',name : 'chapter.chapter_name' },
        { data: 'mark' },
        { data: 'start_date' },
        { data: 'end_date' },
        { data: 'status_name', orderable: false, searchable: false},
        { data: 'no_of_lecture' },
        { data: 'action', orderable: false, searchable: false }
      ]
    }
  }

  loadData(dataTablesParameter: any, callback: any) : void {
    this.countFilters();
    const startDate = this.lessonPlanFilter?.value?.date?.startDate ?? null;
    const endDate = this.lessonPlanFilter?.value?.date?.endDate ?? null;
    const payload = {
      ...dataTablesParameter,
      ...this.lessonPlanFilter.value,
      section_id: this.getID(this.lessonPlanFilter?.value?.section_id),
      class_id: this.getID(this.lessonPlanFilter?.value?.class_id),
      batch_id: this.getID(this.lessonPlanFilter?.value?.batch_id),
      user_id: this.getID(this.lessonPlanFilter?.value?.user_id),
      subject_id: this.getID(this.lessonPlanFilter?.value?.subject_id),
      chapter_id: this.getID(this.lessonPlanFilter?.value?.chapter_id),
      status: this.getID(this.lessonPlanFilter?.value?.status),
      start_date: startDate?.format('DD-MM-YYYY'),
      end_date: endDate?.format('DD-MM-YYYY'),
    }
    this.userDailyPlanningService.getLessonPlanList(payload).subscribe((res: any) => {
      this.isShowLoading = false;
      this.isResetLoading = false;
      this.tbody = res?.data?.original?.data;
      callback({
        recordsTotal: res?.data?.original.recordsTotal,
        recordsFiltered: res?.data?.original.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.column(9).visible(this.hasEdit || this.hasDelete);
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
    const filter = this.lessonPlanFilter?.value;
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
        this.sectionsList = res?.data
      }
    })
  }

  getClassList(){
    const payload = {
      user_id: this.user_id,
      section: this.getID(this.lessonPlanFilter?.value?.section_id) ?? null
    };
    this.homeWorkService.getClassByMultipleSection(payload).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
      }
    })    
  }

  getBatchList(){
    const payload = {
      classes: this.getID(this.lessonPlanFilter?.value?.class_id) ?? null
    }
    this.homeWorkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data
      }
    })
  }

  getFacultiesList(){
    const payload = {
      batch_id: this.getID(this.lessonPlanFilter?.value?.batch_id) ?? [],
      subject_id: this.getID(this.lessonPlanFilter?.value?.subject_id) ?? [],
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
      class_id: this.lessonPlanFilter?.value?.class_id ?? null,
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
      subject_id: this.getID(this.lessonPlanFilter?.value?.subject_id) ?? [],
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
