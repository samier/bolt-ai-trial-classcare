import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AttendanceManagementService } from '../attendance-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal, } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormBuilder, FormGroup, Validators, FormArray, } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
@Component({
  selector: 'app-quick-student-attendance',
  templateUrl: './quick-student-attendance.component.html',
  styleUrls: ['./quick-student-attendance.component.scss'],
})
export class QuickStudentAttendanceComponent implements OnInit {

  // ------------------------------------------------------------------------------------------------ 
  //#region Public | Private Variables
  // ------------------------------------------------------------------------------------------------ 

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  form: FormGroup | any;
  attendanceForm: FormGroup | any;
  attendance: FormArray | any;

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  maxDate: string | undefined;
  showL: boolean = false;
  clearL: boolean = false;
  submitL: boolean = false;
  formSubmitted: boolean = false;
  tbody: any = []
  selectAll: any = false;
  sections: any = [{ id: "", name: 'All Section' }];
  classes: any = [];
  batches: any = [];
  flag :boolean = false

  //#endregion Public | Private Variables

  // ------------------------------------------------------------------------------------------------ 
  // #region constructor
  // ------------------------------------------------------------------------------------------------ 
  constructor(
    private attendanceManagementService: AttendanceManagementService,
    private toastr: Toastr,
    public CommonService: CommonService,
    private fb: FormBuilder,
    private formBuilder: FormBuilder,
    private validationService: FormValidationService
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }
  // ------------------------------------------------------------------------------------------------ 
  //#endregion constructor
  // ------------------------------------------------------------------------------------------------ 

  // ------------------------------------------------------------------------------------------------ 
  // #region Lifecycle hooks
  // ------------------------------------------------------------------------------------------------ 
  ngOnInit(): void {
    this.flag = true
    this.initForm();
    this.getSectionList()
    this.getClassList("")
  }
  // ------------------------------------------------------------------------------------------------ 
  //#endregion Lifecycle hooks
  // ------------------------------------------------------------------------------------------------ 

  // ------------------------------------------------------------------------------------------------ 
  // #region PRIVATE FUNCTION
  // ------------------------------------------------------------------------------------------------ 

  get f() {
    return this.form.controls;
  }

  attendanceArray(): FormArray {
    return this.attendanceForm.get("attendance") as FormArray
  }

  initForm() {
    this.form = this.formBuilder.group({
      section_id: [""],
      class_id: [[], [Validators.required]],
      batch_id: [[], [Validators.required]],
      date: [this.getDate(), [Validators.required]],
    });
  }

  attendenceInitForm(data) {
    this.attendanceForm = this.formBuilder.group({
      attendance: this._subFormArray(data),
      isSelectAll: [false]
    });
  }

  private _subFormArray(data): FormArray {
    const formArry: any = this.fb.array([]);

    data.forEach((ele: any) => {
      formArry.push(this._subArrayGroup(ele));
    });

    return formArry;
  }

  private _subArrayGroup(data: any) {
    const fa: FormGroup = this.fb.group({
      name: [data.name ?? ''],
      id: [data.id ?? ''],
      absent_students: [{ value: data?.absent_students ?? '', disabled: true }],
      leave_students: [{ value: data?.leave_students ?? '', disabled: true }],
      teachers_array: [ Object.keys(data?.user).map(key => data?.user[key]) ],
      class_teacher_id: [{ value: data?.faculty ?? null, disabled: true }],
      is_checked: [false],
    });
    return fa;
  }

  getID(data) {
    const array = data.map(item => item.id)
    return array;
  }

  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate
  }

  // ------------------------------------------------------------------------------------------------ 
  //#endregion Privet Function
  // ------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------
  //#region Public Function
  // ------------------------------------------------------------------------------------------------

  submit() {
    this.showL = true;
    this.validationService.getFormTouchedAndValidation(this.form)
    this.formSubmitted = true;
    if (this.form.invalid) {
      this.showL = false;
      return
    }
    this.tbody = []

    let classes = []
    classes = this.getID(this.form.value.class_id)
    let batches = []
    batches = this.getID(this.form.value.batch_id)

    const payLoad = {
      branch_id: this.branch_id,
      academic_year_id: this.currentYear_id,
      classes: classes,
      batches: batches,
      date: this.form.value.date,
    }
    this.attendanceManagementService.getAttendance(payLoad).subscribe((res: any) => {
      this.tbody = res.data
      this.attendenceInitForm(this.tbody);
      this.showL = false;
    });
  }

  onSubmit() {
    this.submitL = true
    interface PayloadItem {
      branch_id: any;
      batch_id: any;
      faculty_id: any;
      academic_year_id: any;
      date: any;
      absent_students: any;
    }
    let payLoad: PayloadItem[] = []
    const temp = this.attendanceForm.value.attendance.filter(item => item.is_checked == true)
    if (temp.length == 0) {
      this.toastr.showError("Please Select the Batch to take Attendance.");
      this.submitL = false
      return
    }

    payLoad = temp.map(item => {
      return {
        batch_id: item?.id,
        faculty_id: item?.class_teacher_id,
        absent_students: item?.absent_students,
        branch_id: this.branch_id,
        academic_year_id: this.currentYear_id,
        date: this.form.value.date,
      }
    })

    this.attendanceManagementService.saveAttendance({ data: payLoad }).subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
        this.submitL = false
      } else {
        if (res.error) {
          this.toastr.showError(res.message)
        }
        else {
          this.toastr.showSuccess(res.message)
          this.handleClear()
        }
        this.submitL = false
      }
    }, (err: any) => {
      this.toastr.showError("Please Select the Faculty");
      this.submitL = false
    });
  }

  // for Section
  selectAllCheckbox(event: any) {
    this.attendanceArray().controls.forEach((item: any, index) => {
      item.get('is_checked').patchValue(event.target.checked)
      this.formEnableDisable(event.target.checked, index)
    })
  }

  selectCheckbox(event: any, index: number) {
    this.formEnableDisable(event.target.checked, index)

    const checkSelect = this.attendanceForm.value.attendance.map(ele => ele.is_checked)
    if (checkSelect.includes(false)) {
      this.attendanceForm.get('isSelectAll').patchValue(false)
    } else {
      this.attendanceForm.get('isSelectAll').patchValue(true)
    }
  }

  formEnableDisable(flag: boolean, index: number) {
    for (let item in this.attendanceArray().controls[index]['controls']) {
      if (flag) {
        this.attendanceArray().controls[index]['controls'][item].enable()
      } else {
        this.attendanceArray().controls[index]['controls'][item].disable()
      }
    }
    this.attendanceArray().controls[index]['controls']['leave_students'].disable();
    this.attendanceArray().controls[index]['controls']['is_checked'].enable();
    this.attendanceArray().controls[index]['controls']['name'].enable();
  }
  
  onSectionChange() {
    this.classes = []
    this.batches = []
    this.form.controls.class_id.patchValue([])
    this.form.controls.batch_id.patchValue([])
    this.getClassList(this.form.value.section_id)
  }

  // for Class
  onClassChange() {
    this.batches = []
    this.form.controls.batch_id.patchValue([])
    const ids = this.form.value.class_id.length > 0 ? this.form.value.class_id.map(ele => ele.id) : []

    this.attendanceManagementService
      .getBatchesList({ classes: ids })
      .subscribe((res: any) => {
        this.batches = res.data;
      });
  }

  onClassChangeALL(item: any) {
    this.batches = []
    this.form.controls.batch_id.patchValue([])

    const ids = this.getID(item)

    this.attendanceManagementService
      .getBatchesList({ classes: ids })
      .subscribe((res: any) => {
        this.batches = res.data;
      });
  }

  // for BATCHES 
  onBatchChange() {
  }
  onBatchChangeALL(item: any) {
  }

  // clear BTN
  handleClear() {
    this.form.reset()
    this.form.controls.section_id.patchValue("")
    this.classes = []
    this.batches = []
    this.getClassList("")
    this.form.controls.date.patchValue(this.getDate())
    this.form.controls.class_id.patchValue([])
    this.form.controls.batch_id.patchValue([])
    this.tbody = []
  }

  // Section dropdown data
  getSectionList() {
    this.attendanceManagementService
      .getSectionList({ branch: this.branch_id })
      .subscribe((res: any) => {
        if (res.status) {
          this.sections = [...this.sections, ...res.data];
        }
      });
  }
  // Class dropdown data
  getClassList(params: any) {
    this.attendanceManagementService
      .getClassList(params)
      .subscribe((res: any) => {
        this.classes = res.data;
        if(this.flag){
          this.form.controls.class_id.patchValue(this.classes)
          const ids = this.form.value.class_id.map(ele => ele.id) 
          this.getBatchList(ids)
        }
      });
  }

  getBatchList(ids){

    this.attendanceManagementService
      .getBatchesList({ classes: ids })
      .subscribe((res: any) => {
        this.batches = res.data;
        if(this.flag){
          this.form.controls.batch_id.patchValue(this.batches)
          this.flag = false
        }
      });
  }
  // ------------------------------------------------------------------------------------------------
  //#endregion Public Function
  // ------------------------------------------------------------------------------------------------
}
