import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ReportService } from '../../report/report.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AcademicYearService } from '../academic-year.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { StudentService } from 'src/app/modules/student/student.service';

@Component({
  selector: 'app-year-transfer',
  templateUrl: './year-transfer.component.html',
  styleUrls: ['./year-transfer.component.scss']
})
export class YearTransferComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  yearTransferForm : FormGroup = new FormGroup({})
  fromClassList = []
  toClassList = []
  fromBatchList:any = []
  toBatchList:any = []
  sectionList:any = []
  yearList:any = []
  selectAllStudent : boolean = false
  transfering : boolean = false
  studentList
  searchTextStudent : string = ''
  searchTextStudentTo : string = ''
  selectedStudentCount : number = 0
  isSubmit : boolean = false
  isStudentReportGet : boolean = false
  URLConstants  = URLConstants
  current_academic_year:any = sessionStorage.getItem('academic_year_id');

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
      public CommonService: CommonService,
      private _reportService : ReportService,
      private _fb : FormBuilder,
      public academicYearService : AcademicYearService,
      private _toaster : Toastr,
      private studentService : StudentService,
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.formInit()
    this.getAcadamicYearList();
    this.getSectionList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getToClassList() {
    this.yearTransferForm.controls['to_class_id'].setValue(null);
    this.yearTransferForm.controls['to_batch_id'].setValue(null);
    this.toBatchList = [];
    this.toClassList = [];
    const payload = {
      selected_academic_year_id: this.yearTransferForm.value.to_year_id ,
      section_id: this.yearTransferForm.value.to_section_id ,
      user_id : localStorage.getItem('user_id'),
      branch_id : localStorage.getItem('branch'),
    }
    this.studentService.getClass(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.toClassList = res.data
      }
    });
  }

  getFromClasses () {
    this.yearTransferForm.controls['from_class_id'].setValue(null);
    this.yearTransferForm.controls['from_batch_id'].setValue(null);
    this.fromClassList = [];
    this.fromBatchList = [];
    // const section = this.yearTransferForm.value.from_section_id
    // this._reportService.getStudentClassList(section).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
    const payload = {
      selected_academic_year_id: sessionStorage.getItem('academic_year_id'),
      section_id: this.yearTransferForm.value.from_section_id ,
      user_id : localStorage.getItem('user_id'),
      branch_id : localStorage.getItem('branch'),
    }
    this.studentService.getClass(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        this.fromClassList = res.data
      }
    })
  }

  getBatches (type:string) {
    let classes = ''
    if(type == 'from') {
      this.yearTransferForm.controls['from_batch_id'].setValue(null);
      classes = this.yearTransferForm.value.from_class_id
      this.fromBatchList = [];
    } else if (type == 'to') {
      this.yearTransferForm.controls['to_batch_id'].setValue(null);
      classes = this.yearTransferForm.value.to_class_id
      this.toBatchList = [];
    }

    this._reportService.getBatchesByClass(classes).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        if(type == 'from') {
          this.fromBatchList = res.data
        } else if (type == 'to') {
          this.toBatchList = res.data
        }
      }
    })
  }

  clearForm () {
    this.isSubmit = false
    this.yearTransferForm.reset();
    this.yearTransferForm.controls['from_section_id'].patchValue('');
    this.yearTransferForm.controls['to_section_id'].patchValue('');
    this.yearTransferForm.controls['to_old_new'].patchValue(0);
    this.studentList = null
    this.selectAllStudent = false;    
    this.selectedStudentCount = 0;  
    this.fromBatchList = [];
    this.toBatchList = [];
    this.fromClassList = [];
    this.toClassList = [];
    this.getFromClasses();
  }

  showStudentRecord() {
    this.isSubmit = true
    if (this.yearTransferForm.invalid) {
      return
    }
    this.selectAllStudent = false;    
    this.selectedStudentCount = 0;
    this.studentList = null;    
    this.isStudentReportGet = true
    this.academicYearService.getYearTransferStudentList(this.yearTransferForm.value).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if(res.status) {
        this.studentList = res.data
        this.isStudentReportGet = false
        this.isSubmit = false
        if (this.studentList.from_student_list) {
          this.studentList.from_student_list = this.studentList.from_student_list.map((ele:any) => 
            ( {...ele, isSelect : false , isAdmissionFormYear: ele.admission_form_number || ele.to_year_transfer_batch_id  ? true : false } ))
        }
      }
    },(error)=> {
      this.isStudentReportGet = false
      this.isSubmit = false
      this._toaster.showError(error.error.message)
    })
  }

  selectAll() {
    if(this.selectAllStudent) {
      this.studentList.from_student_list.filter(ele => !ele.to_year_transfer_batch_id)?.map(ele => ele.isSelect = true)
      this.selectedStudentCount = this.studentList?.from_student_list?.filter(ele => ele.isSelect )?.length ?? 0
    } else {
      this.studentList.from_student_list.map(ele => ele.isSelect = false)
      this.selectedStudentCount = 0
    }
  }

  singleSelect() {
    const selectedValue = this.studentList.from_student_list?.filter(ele => !ele.to_year_transfer_batch_id)?.map(ele => ele.isSelect)
    if(selectedValue.includes(false)){
      this.selectedStudentCount = selectedValue?.filter(ele => ele == true).length
      this.selectAllStudent = false
    } else {
      this.selectAllStudent = true
      this.selectedStudentCount = this.studentList?.from_student_list?.filter(ele => ele.isSelect )?.length ?? 0
    }
  }


  transferStudent() {

    const studentIds = this.studentList?.from_student_list?.filter((ele )=> ele.isSelect)?.map(ele => { return { id : ele.id, studentId : ele.studentId , admission_form_number : ele.admission_form_number } }) ?? [];

    if (studentIds.length > 0) {
      const payload = {
        ...this.yearTransferForm.value,
        students : studentIds
      }
      this.transfering = true;
      this.academicYearService.yearTransfer(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
        if(res.status) {
          this._toaster.showSuccess(res.message);
          this.clearForm()
        }else{
          this._toaster.showError(res.message);
        }
        this.transfering = false;
      },(error)=> {
        this.transfering = false;
        this._toaster.showError(error.error.message || error.message )
      })
    }else{
      this._toaster.showError('Please select student to transfer')
    }

  }

  getBatchFromId(id:any,type:string) {
    if (id) {
      if (type == 'from') {
        return (this.fromBatchList?.find((ele:any) => ele.id == id)?.name ?? '')+' ( '+this.current_academic_year+' )';
      } else {
        return (this.toBatchList?.find((ele:any) => ele.id == id)?.name ?? '')+' ( '+(this.yearList?.find((ele:any) => ele.id == this.yearTransferForm.value?.to_year_id)?.name)+' )';
      }
    }
    return;
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getAcadamicYearList() {
    this.studentService.getAcadamicYearList({current_branch_id : [localStorage.getItem('branch')]}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.current_academic_year = res.data?.find((ele:any) => ele.id == this.current_academic_year)?.year || null 
        this.yearList = res.data.filter(ele => ele.year != this.current_academic_year).map(ele => {
          return {id : ele.id , name:ele.year}
        })
      }
    });
  }

  getSectionList() {
    const payload = {
      user_id : localStorage.getItem('user_id')
    }
    this.academicYearService.getUserWiseSectionList(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All' }].concat(res.data);
        this.getFromClasses ()
      }
    })
  }

  formInit(){
    this.yearTransferForm = this._fb.group({
      from_section_id : [''],
      from_class_id : [null,[Validators.required]],
      from_batch_id : [null,[Validators.required]],
      to_year_id : [null,[Validators.required]],
      to_section_id : [''],
      to_class_id : [null,[Validators.required]],
      to_batch_id : [null,[Validators.required]],
      to_old_new : [0]
    })

  }

  //#endregion Private methods
}
