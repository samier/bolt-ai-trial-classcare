import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemSettingService } from '../system-setting.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-otp-log',
  templateUrl: './otp-log.component.html',
  styleUrls: ['./otp-log.component.scss']
})
export class OtpLogComponent implements OnInit {

  // ------------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // ------------------------------------------------------------------------------------------------------------------

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  $destroy: Subject<void> = new Subject<void>();

  otpLogFrom: FormGroup = new FormGroup({})

  dtOption: DataTables.Settings = {}
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  branchList: any = []
  yearList: any = []
  sectionList: any = []
  classList: any = []
  batchList: any = []

  tableData: any = []

  isShowLoading: boolean = false
  isClearLoading: boolean = false
  filterCount: any = 0;
  filter : boolean = true;

  // ------------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // ------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------
  // #region constructor
  // ------------------------------------------------------------------------------------------------------------------


  constructor(
    public fb: FormBuilder,
    public SystemSetting: SystemSettingService,
    public toaster: Toastr,
    private validationService: FormValidationService,
  ) { }

  // ------------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // ------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // ------------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm()
    this.initDataTable()
    this.fetchBranchList()
    // this.fetchSectionList()
    // this.fetchClassList()
    // this.fetchBatchList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // ------------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // ------------------------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // ------------------------------------------------------------------------------------------------------------------


  // SHOW BTN 
  handleShow() {
    if (this.otpLogFrom.invalid) {
      this.validationService.getFormTouchedAndValidation(this.otpLogFrom)
      this.toaster.showError("Please fill all the required field")
      return;
    }
    this.isShowLoading = true
    this.reloadData()
  }

  // CLEAR BTN
  handleClear() {
    this.otpLogFrom.patchValue({
      branch : null,
      year : null ,
      section: [] ,
      classId: [] ,
      batchId: [] ,
    })
    this.yearList = []
    this.sectionList = []
    this.classList = []
    this.batchList = []

    this.isShowLoading = false
    this.isClearLoading = true
    this.reloadData()
  }

  fetchBranchList() {
    this.SystemSetting.fetchBranchList().subscribe((res: any) => {
      if (res.status) {
        this.branchList = res.data?.map((res: any) => ({ ...res, name: res.branchName, id: res.id }))
      }
    })
  }

  fetchAcademicYear() {

    this.yearList = []
    this.otpLogFrom.controls['year'].patchValue(null)

    this.sectionList = []
    this.otpLogFrom.controls['section'].patchValue(null)

    this.classList = []
    this.otpLogFrom.controls['classId'].patchValue(null)

    this.batchList = []
    this.otpLogFrom.controls['batchId'].patchValue(null)

    const payload = {
      academic_year_id: this.currentYear_id,
      branches: [this.otpLogFrom.controls['branch'].value],
      branch_id: this.branch_id
    }
    this.SystemSetting.fetchAcademicList(payload).subscribe((res: any) => {
      if (res.status) {
        this.yearList = res.data?.map((res: any) => ({ ...res, name: res.year }))
      }
    })
  }

  // SECTION FETCHING
  fetchSectionList() {

    this.sectionList = []
    this.otpLogFrom.controls['section'].patchValue(null)

    this.classList = []
    this.otpLogFrom.controls['classId'].patchValue(null)

    this.batchList = []
    this.otpLogFrom.controls['batchId'].patchValue(null)

    const payload = {
      branch_id: this.branch_id,
      academic_year_id: this.currentYear_id,
      branches: this.otpLogFrom.controls['branch'].value ? [this.otpLogFrom.controls['branch'].value] : [],
    }

    this.SystemSetting.fetchSection(payload).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res.data;
      }
    }, (error: any) => {
      this.toaster.showError(error?.error?.message ?? error?.message)
    });
  }
  // CLASS FETCHING
  fetchClassList() {

    this.classList = []
    this.otpLogFrom.controls['classId'].patchValue([])

    this.batchList = []
    this.otpLogFrom.controls['batchId'].patchValue([])

    const payload = {
      branch_id: this.branch_id,
      academic_year_id: [this.otpLogFrom.controls['year'].value],
      branch: this.otpLogFrom.controls['branch'].value ? [this.otpLogFrom.controls['branch'].value] : [],
      section: this.getID(this.otpLogFrom.controls['section'].value) || [],
    }

    this.SystemSetting.fetchClass(payload).subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      }
    }, (error: any) => {
      this.toaster.showError(error?.error?.message ?? error?.message)
    })

  }

  // BATCH FETCHING
  fetchBatchList() {

    this.batchList = []
    this.otpLogFrom.controls['batchId'].patchValue([])

    const payload = {
      branch_id: this.branch_id,
      academic_year_id: this.currentYear_id,
      branchId: this.otpLogFrom.controls['branch'].value ? [this.otpLogFrom.controls['branch'].value] : [],
      classes: this.getID(this.otpLogFrom.controls['classId'].value) || [] ,
    }

    this.SystemSetting.fetchBatch(payload).subscribe((res: any) => {
      if (res.status) {
        this.batchList = res.data
      }
    })

  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.otpLogFrom.value).forEach((item:any)=>{
      if((this.otpLogFrom.value[item] != '' && this.otpLogFrom.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
  }

  // ------------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // ------------------------------------------------------------------------------------------------------------------


  // ------------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // ------------------------------------------------------------------------------------------------------------------

  // FORM INITIALIZATION
  initForm() {
    this.otpLogFrom = this.fb.group({
      branch  : [null, [Validators.required]],
      year    : [null, [Validators.required]],
      section : [[]],
      classId : [[]],
      batchId : [[]]
    })
     this.otpLogFrom?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
          this.otpLogFrom?.controls['branch']?.markAsPristine();
          this.otpLogFrom?.controls['branch']?.markAsUntouched();
    
          this.otpLogFrom?.controls['year']?.markAsPristine();
          this.otpLogFrom?.controls['year']?.markAsUntouched();
        })
  }

  // DATATABLE INITIALIZATION
  initDataTable() {
    this.dtOption = {
      pagingType: 'full_numbers',
      lengthMenu: [
        [50, 100, 200],
        ['Show 50 entries', 'Show 100 entries', 'Show 200 entries']
      ],
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: true,
      searching: true,
      order: [[0, 'dec']],

      lengthChange: true,
      stateSave: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        { data: 'created_at' },
        { data: 'student_name' },
        { data: 'section_name' },
        { data: 'class_name' },
        { data: 'batch_name' },
        { data: 'mobile_no', orderable: false, searchable: false },
        { data: 'otp', orderable: false, searchable: false },
      ]
    }
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.countFilters()
    const payload = {
      branch_id : this.branch_id,
      academic_year_id : this.currentYear_id,
      selected_branch_id : this.otpLogFrom.controls['branch'].value || null ,
      selected_academic_year_id : this.otpLogFrom.controls['year'].value || null ,
      section_id : this.getID(this.otpLogFrom.controls['section'].value) || [] ,
      class_id :   this.getID(this.otpLogFrom.controls['classId'].value) || [] ,
      batch_id :   this.getID(this.otpLogFrom.controls['batchId'].value) || [] ,
    }

    this.SystemSetting.getDetails(Object.assign(dataTablesParameters, payload)).subscribe((resp: any) => {

      this.tableData = resp?.data;
      this.isShowLoading = false
      this.isClearLoading = false

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

    }, (error) => {
      this.isShowLoading = false
      this.isClearLoading = false
      this.toaster.showError(error?.error?.message ?? error?.message)
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getID(data: any){
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }

  // ------------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // ------------------------------------------------------------------------------------------------------------------

}