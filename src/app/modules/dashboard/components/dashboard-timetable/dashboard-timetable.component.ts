import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboardService } from '../../dashboard.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from 'src/app/modules/report/report.service';

@Component({
  selector: 'app-dashboard-timetable',
  templateUrl: './dashboard-timetable.component.html',
  styleUrls: ['./dashboard-timetable.component.scss']
})
export class DashboardTimetableComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  timeTableForm : FormGroup = new FormGroup({});
  start : number = 0;
  length: number = 3;
  timeTableData: any[] = [];
  batchKeys: any[] = [];
  maxLectures: number = 0;
  URLConstants = URLConstants;
  faculties: any[] = [];
  classList: any[] = [];
  batchList: any[] = [];
  isTableLoading: boolean = false;
  isFullTableLoading: boolean = false;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private dashBoardService: DashboardService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getFacultyList();
    this.getClassList();
    this.getBatchList();
    this.isTableLoading = true;
    this.getTimeTable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  onScrollChange() {
    this.start = this.start + this.length ;
    this.isTableLoading = true;
    this.getTimeTable();
  }

  onFilterChange(){
    this.start = 0;
    this.getTimeTable()
  }

  isFacultySelected(fullName: string): boolean {
    const selectedFacultyList = this.timeTableForm?.value?.faculty_id || [];
    return selectedFacultyList.some((faculty: any) => faculty?.name === fullName);
  }
  
  clearDate(){
    this.timeTableForm?.controls['date'].patchValue(new Date());
  }

  formatTimeString(timeStr: string | null): Date | null {
    if (!timeStr) return null;
    const [h, m, s] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, s);
    return date;
  }  

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.timeTableForm = this._fb.group({
      date: [new Date()] ,
      faculty_id:[null],
      class_id: [null],
      batch_id:[null],
    })

    this.timeTableForm?.valueChanges?.pipe(debounceTime(200),takeUntil(this.$destroy)).subscribe((value: any) => {
      if(value){
        this.start = 0;
        this.timeTableData = [];
        this.batchKeys = [];
        this.isFullTableLoading = true;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        this.getTimeTable();
      }
    })
  }

  getTimeTable(){
    const payload = {
      data: this.timeTableForm?.value?.date,
      faculty_id: this.CommonService.getID(this.timeTableForm?.value?.faculty_id),
      batch_id: this.CommonService.getID(this.timeTableForm?.value?.batch_id),
      class_id: this.CommonService.getID(this.timeTableForm?.value?.class_id),
      start  : this.start ,
      length : this.length
    }

    this.dashBoardService.getTimeTable(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {  
      this.isTableLoading = false;
      this.isFullTableLoading = false;
      this.cdr.detectChanges();
      this.cdr.markForCheck();
      if (this.start === 0) {
        this.timeTableData = [];
      }
      if(res?.status){
        for (const key in res.data) {
          if (this.timeTableData[key]) {
            this.timeTableData[key] = [...this.timeTableData[key], ...res?.data[key]];
          } else {
            this.timeTableData[key] = res?.data[key];
          }
        }

        this.batchKeys = Object.keys(this.timeTableData);
        // Determine max lectures across all batches
        this.maxLectures = Math.max(
          ...this.batchKeys.map(batch => this.timeTableData[batch].length)
        );
      }
    },
    (error: any) => {
      this.isTableLoading = false;
      this.isFullTableLoading = false;
    });
  }

  getFacultyList() {
    this.reportService.getFacultyAndPrincipal().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res?.status) {
        this.faculties = res?.data?.faculties?.map((item) => {
          return { id: item?.id, name: item?.full_name }
        })
      }
    })
  }

  getClassList(){
    this.dashBoardService.getClass().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.classList = res?.data
      }
    })
  }

  getBatchList(){
    this.batchList = [];
    this.timeTableForm?.patchValue({batch_id: null})
    const payload = {
      classes: this.CommonService.getID(this.timeTableForm.value?.class_id)
    }
    this.dashBoardService.getBatcheList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data;
      }
    })
  }
	
  //#endregion Private methods
}