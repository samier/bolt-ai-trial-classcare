import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../report.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { Toastr } from 'src/app/core/services/toastr';
import { session, sortByF } from 'src/app/common-config/static-value';
import { DataTableDirective } from 'angular-datatables';
import { ExamServiceService } from '../../exam/exam-service.service';

@Component({
  selector: 'app-student-attendance-report-montly-yearly',
  templateUrl: './student-attendance-report-montly-yearly.component.html',
  styleUrls: ['./student-attendance-report-montly-yearly.component.scss']
})

export class StudentAttendanceReportMontlyYearlyComponent implements OnInit, OnDestroy {

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  studentAttendanceForm: FormGroup = new FormGroup({})
  userID: any = window.localStorage.getItem('user_id');
  filterCount: number = 1
  filter: boolean = false
  sectionsListDP: any[] = []
  classListDP: any[] = []
  batchListDP: any[] = []
  sortByDP: any[] = sortByF
  sessionList: any[] = session
  attendanceData: any[] = []
  isShowLoading: boolean = false
  isResetLoading: boolean = false
  isTableLoaded: boolean = false
  isExcelLoading: boolean = false
  isPdfLoading: boolean = false
  isGetReport: boolean = false
  attendanceSession: any

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private ReportService: ReportService,
    private validationService: FormValidationService,
    private examService : ExamServiceService,
    private toaster: Toastr
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getSectionList()
    this.getClass()
    this.getBatchList()
    this.getBranchNotification()
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

  onShow() {
    if (this.studentAttendanceForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.studentAttendanceForm)
      this.toaster.showError("Please fill all the required field")
      return
    }
    this.isShowLoading = true;
    this.isTableLoaded = true;
    this.reloadData();
    this.initDataTable();
  }

  reset() {
    this.countFilters()
    this.studentAttendanceForm.reset()
    this.studentAttendanceForm.controls['sectionF'].patchValue('')
    this.studentAttendanceForm.controls['classF'].patchValue('')
     this.classListDP = [{ id: '', name: 'All Class' }];
    this.batchListDP = []
    this.attendanceData = []
    this.getClass(() => this.studentAttendanceForm.controls['classF'].patchValue(''))
    this.studentAttendanceForm.controls['sortByF'].patchValue("")
    this.studentAttendanceForm.controls['sessionF'].patchValue('1')
    this.getBatchList()
  }

  onSectionChange() {
    this.getClass();
    this.studentAttendanceForm.controls['classF'].patchValue('');
    this.batchListDP = [];
    this.studentAttendanceForm.controls['batchF'].patchValue(null);
  }

  onClassChange() {
    this.getBatchList();
    this.studentAttendanceForm.controls['batchF'].patchValue(null);
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------


  initForm() {
    this.studentAttendanceForm = this._fb.group({
      sectionF: [''],
      classF: [''],
      batchF: [null, [Validators.required]],
      sortByF: [""],
      sessionF : ['1'],
      date: [null]
    })
  }

  getSectionList() {
    this.ReportService.getSectionList({ branch: this.branch_id }).pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res.status) {
          this.sectionsListDP = [{ id: '', name: 'All Section' }].concat([...this.sectionsListDP, ...res.data]);
        }
      });
  }

  getClass(callback?: any) {
    this.classListDP = []
    this.batchListDP = []
    // this.studentAttendanceForm.controls['classF'].patchValue(null)
    this.studentAttendanceForm.controls['batchF'].patchValue(null)
    const payload = {
      user_id: this.user_id,
      ...(this.studentAttendanceForm?.value?.sectionF && { section: this.studentAttendanceForm?.value?.sectionF ?? "" }),
    }
    this.ReportService.getClass(payload, this.user_id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res?.status) {
        this.classListDP = [{ id: '', name: 'All Class' }].concat(res.data);
      }
    })
  }

  getBatchList() {
    this.batchListDP = []
    this.studentAttendanceForm.controls['batchF'].patchValue(null)
    const payload = {
      classes: this.studentAttendanceForm.value.classF ? [this.studentAttendanceForm.value.classF] : []
    }
    this.ReportService.getBatchesList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.batchListDP = res.data;
    });
  }

  initDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      processing: true,
      searching: true,
      ordering: true,
      info: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadAttendanceData(dataTablesParameters, callback);
      },
      columns: [
        // {
        //   title: 'Student Photo & Name',
        //   data: 'full_name',
        //   render: (data, type, row) => {
        //     const imageSrc = type.image ? type.image : '/public/images/student-male.png';
        //     return `
        //       <div class="student-img-container">
        //         <img src="${imageSrc}" class="student-image" alt="" />
        //         <span class="student-name">${data}</span>
        //       </div>
        //     `;
        //   }
        // },
        {
          title: 'Student Photo & Name',
          data: 'full_name',
          render: (data, type, row) => {
            const imageSrc = row.image || '/public/images/student-male.png';
            return `
              <div class="student-img-container">
                <img src="${imageSrc}" class="student-image" alt="Student" />
                <span class="student-name">${data}</span>
              </div>
            `;
          }
        },
        { title: 'Total Attendance', data: 'total_working_days' },
        { title: 'Present', data: 'total_present', className: 'text-present' },
        { title: 'Absent', data: 'total_absent', className: 'text-absent' },
        { title: 'Leave', data: 'total_leave', className: 'text-leave' }
      ],
      language: {
        emptyTable: 'No data available',
        zeroRecords: 'No matching records found'
      }
    };
  }

  buildAttendanceReportPayload(dataTablesParameters?: any): any {
    const startDate = this.studentAttendanceForm?.value?.date?.startDate;
    const endDate = this.studentAttendanceForm?.value?.date?.endDate;
    return {
      ...dataTablesParameters,
      batch_id: this.studentAttendanceForm.value.batchF ? [this.studentAttendanceForm.value.batchF] : [],
      ...(startDate && endDate && {
        startDate: startDate.format('DD-MM-YYYY') || '',
        endDate: endDate.format('DD-MM-YYYY') || ''
      }),
      sort_by: this.studentAttendanceForm.value.sortByF,
      session: this.studentAttendanceForm.value.sessionF

    };
  }

  loadAttendanceData(dataTablesParameters?: any, callback?: any) {
    this.isShowLoading = true;
    this.isResetLoading = false;
    this.countFilters();
    const payload = this.buildAttendanceReportPayload(dataTablesParameters);
    this.ReportService.studentMonthlyYearlyAttendanceReport(payload)
      .pipe(takeUntil(this.$destroy)).subscribe(
        (resp: any) => {
          this.isShowLoading = false;
          this.attendanceData = resp?.data || [];
          // resp?.data?.map((item: any) => ({
          //   full_name: item.full_name,
          //   image: item.image || 'student-male.png',
          //   attendance: item.attendance
          // })) || [];
          callback({
            recordsTotal: this.attendanceData.length,
            recordsFiltered: this.attendanceData.length,
            data: this.attendanceData
          });
          setTimeout(() => {
            this.dtElement?.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            });
          }, 10);
        },
        (error) => {
          this.isShowLoading = false;
          this.toaster.showError(error?.error?.message || 'Failed to load attendance data');
          this.attendanceData = [];
          if (callback) {
            callback({
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        }
      );
  }

  downloadPdfAndExcel(dataTablesParameters: any, format: string) {
    if (this.studentAttendanceForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.studentAttendanceForm)
      this.toaster.showError("Please fill all the required field")
      return
    }
    if (format == 'pdf') {
      this.isPdfLoading = true
    } else {
      this.isExcelLoading = true
    }
    const payload = this.buildAttendanceReportPayload(dataTablesParameters);
    this.ReportService.studentMonthlyYearlyAttendanceReportDownload(payload, format
    ).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.CommonService.downloadFile(res, 'Student-Atendance-Report', format);
    }, (error) => {
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.toaster.showError(error?.error?.message || `Failed to download ${format.toUpperCase()} report`)
    });
  }

  countFilters() {
    this.filterCount = 0;
    const filter = this.studentAttendanceForm?.value;
    Object.keys(filter).forEach((item) => {
      if (item === 'date') {
        if (filter[item]?.startDate && filter[item]?.endDate) {
          this.filterCount++;
        }
      } else if (filter[item] && (Array.isArray(filter[item]) ? filter[item].length : true)) {
        this.filterCount++;
      }
    })
  }

  reloadData() {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }
  }

  getBranchNotification(){
    this.examService.getNotification().pipe(takeUntil(this.$destroy)).subscribe((res: any) =>{
      if (res.status)
      {
        this.attendanceSession = res?.data?.attendance_session;
       }
    });
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
