import { Component, ElementRef, OnInit, Pipe, ViewChild } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, FormArray, } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ReportService } from '../../report/report.service';
import { AttendanceManagementService } from '../attendance-management.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DomSanitizer } from '@angular/platform-browser';
import { fields, months } from 'src/app/common-config/static-value';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-present-attendance-blank-sheet-report',
  templateUrl: './present-attendance-blank-sheet-report.component.html',
  styleUrls: ['./present-attendance-blank-sheet-report.component.scss'],
})
export class PresentAttendanceBlankSheetReportComponent implements OnInit {
  @Pipe({ name: 'safeHtml' })

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  datatableElement: DataTableDirective | null = null;

  params: any = {
    branch_id: this.branch_id,
    academic_year_id: this.currentYear_id,
    class_id: [],
    batch_id: [],
    fields:[],
    // section_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  };

  months = months

  form: FormGroup | any;
  formSubmitted: boolean = false;
  sections = [{ id: '', name: 'All Section' }];
  classes: any = [];
  selectedClasses: any = [];
  batches: any = [];
  selectedBatches: any = [];
  htmlContent: any
  selectedMonth: number | null = null;
  today: Date = new Date();
  oneTime: any = false;
  show: any = false;
  pfd: any = false;
  years: number[];
  classID: any = [];
  sectionID:any = []
  fields = fields
  constructor(
    private attendanceManagementService: AttendanceManagementService,
    private toastr: Toastr,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    public commonService: CommonService,
  ) {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  fieldsDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'name',
    textField: 'column',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
  }

  initForm() {
    this.form = this.formBuilder.group({
      section_id: new FormControl(""),
      class_id: new FormControl([], [Validators.required]),
      batch_id: new FormControl([], [Validators.required]),
      fields: new FormControl([]),
      selectedMonth: new FormControl(new Date().getMonth() + 1, [Validators.required]),
      selectedYear: new FormControl(new Date().getFullYear(), [Validators.required]),
    });
  }
  get f() {
    return this.form.controls;
  }

  onSectionChange() {
    this.classes = []
    this.batches = []
    this.form.controls.class_id.patchValue([])
    this.form.controls.batch_id.patchValue([])

    if (this.form.value.section_id == "") {
      this.attendanceManagementService.getClassList("").subscribe((res: any) => {
          this.classes = res.data;
      });
    }
    else{

      this.attendanceManagementService.getClassList(this.form.value?.section_id).subscribe((res: any) => {
        this.classes = res.data;
      });
    }
  }

  // class function
  class_array: any = [];
  onClassChange() {
    this.batches = []
    this.form.controls.batch_id.patchValue([])

    this.class_array = this.form?.value?.class_id;

    let ids = this.class_array.map((item: any) => item.id);
    this.params.class_id = ids;
    this.attendanceManagementService
      .getBatchesList({ classes: ids })
      .subscribe((res: any) => {
        this.batches = res.data;
      });
  }

  onClassChangeALL(item: any) {
    this.batches = []
    this.form.controls.batch_id.patchValue([])

    let ids = item.map((item: any) => item.id);
    this.params.class_id = ids;
    this.attendanceManagementService
      .getBatchesList({ classes: ids })
      .subscribe((res: any) => {
        this.batches = res.data;
      });
  }

  // batch function 
  batch_array: any = [];
  onBatchChange() {
    this.batch_array = this.form?.value?.batch_id;
    let ids = this.batch_array.map((item: any) => item.id);
    this.params.batch_id = ids;
  }
  onBatchChangeALL(item: any) {
    let ids = item.map((item: any) => item.id);
    this.params.batch_id = ids;
  }

  // Section dropdown data
  getSectionList() {
    this.attendanceManagementService
      .getSectionList({ branch: this.branch_id })
      .subscribe((res: any) => {
        if (res.status) {
          this.sections = [...this.sections, ...res.data];
          this.sectionID = this.getID(res.data)
          this.getClass("")
        }
      });
  }
  getClass(data:any) {
    let classIDs = []
    this.attendanceManagementService
      .getClassList(data)
      .subscribe((res: any) => {
        this.classes = res.data;
        this.classID = this.getID(this.classes)
        classIDs = this.getID(this.classes)        
      });
  }
  getID(data) {
    const array = data.map(item => item.id)
    return array;
  }

  onMonthSelectionChange(event: any) {
    this.params.month = event.value
  }

  onYearSelectionChange(event: any) {
    this.params.year = this.form.value.selectedYear
  }

  export(format: string) {
    
    this.pfd = true  

    this.formSubmitted = true;
    
    if (this.form.invalid) {
      this.pfd = false 
      return
    }
    const fields = this.params.fields.map((x:any) => x.name);
    const payload = {
      ...this.params
    }
    payload.fields = fields
    this.attendanceManagementService.getExport(payload, format).subscribe((res: any) => {
      this.downloadFile(res, 'Blank-Sheet-Attendance-report', format);
    });
  }
  
  downloadFile(res: any, file: any, format: any) {
    
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc
      a.click();
    }
    this.pfd = false 
  }

  submit() {
    
    this.show = true;
    this.htmlContent = null

    this.formSubmitted = true;
    if (this.form.invalid) {
      this.show = false;
      return;
    }
    const fields = this.params.fields.map((x:any) => x.name);
    const payload = {
      ...this.params
    }
    payload.fields = fields
    this.attendanceManagementService.attendanceReport(payload).subscribe((resp: any) => {
      if(resp.html){
        this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(resp.html);
        this.show = false
      }
      else{
        this.show = false
      }
    })
  }

  handleClear(){
    
    this.params.class_id = []
    this.params.batch_id = []

    this.form.controls.section_id.patchValue("")
    this.form.controls.class_id.patchValue([])
    this.form.controls.batch_id.patchValue([])

    this.htmlContent = null

    this.getClass("")
    this.batches = []
    this.params.month= new Date().getMonth() + 1,
    this.params.year= new Date().getFullYear()

    this.form.controls.selectedMonth.patchValue( new Date().getMonth() + 1)
    this.form.controls.selectedYear.patchValue( new Date().getFullYear() )

    this.params.fields = []
  }
}