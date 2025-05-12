import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { ReportService } from '../../report/report.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { studentCategoryType } from 'src/app/common-config/static-value';
import { BatchService } from '../batch.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-batch-transfer',
  templateUrl: './batch-transfer.component.html',
  styleUrls: ['./batch-transfer.component.scss']
})
export class BatchTransferComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  batchTransferForm : FormGroup = new FormGroup({})
  fromClassList = []
  toClassList = []
  fromBatchList:any = []
  toBatchList:any = []
  sectionList:any = []
  studentType = studentCategoryType
  selectAllStudent : boolean = false
  studentList
  searchTextStudent : string = ''
  searchTextStudentTo : string = ''
  selectedStudentCount : number = 0
  isSubmit : boolean = false
  isStudentReportGet : boolean = false
  URLConstants  = URLConstants

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
      private _reportService : ReportService,
      private _fb : FormBuilder,
      public batchService : BatchService,
      private _toaster : Toastr
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.formInit()
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

  getClasses (type:string) {
    let section = ''
    if(type == 'from') {
      this.batchTransferForm.controls['from_class_id'].reset();
      this.batchTransferForm.controls['from_batch_id'].reset();
      section = this.batchTransferForm.value.from_section_id
    } else if (type == 'to') {
      this.batchTransferForm.controls['to_class_id'].reset();
      this.batchTransferForm.controls['to_batch_id'].reset();
      section = this.batchTransferForm.value.to_section_id
    }

    this._reportService.getStudentClassList(section).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        if(type == 'from') {
          this.fromClassList = res.data
        } else if (type == 'to') {
          this.toClassList = res.data
        } else {
          this.fromClassList = res.data
          this.toClassList = res.data
        }
      }
    })
  }

  getBatches (type:string) {
    let classes = ''
    if(type == 'from') {
      this.batchTransferForm.controls['from_batch_id'].reset();
      classes = this.batchTransferForm.value.from_class_id
    } else if (type == 'to') {
      this.batchTransferForm.controls['to_batch_id'].reset();
      classes = this.batchTransferForm.value.to_class_id
    }

    this._reportService.getBatchesByClass(classes).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        if(type == 'from') {
          this.fromBatchList = res.data
        } else if (type == 'to') {
          this.toBatchList = res.data
        } else {
          this.fromBatchList = res.data
          this.toBatchList = res.data
        }
      }
    })
  }

  clearForm () {
    this.isSubmit = false
    this.batchTransferForm.reset();
    this.batchTransferForm.controls['from_section_id'].patchValue('');
    this.batchTransferForm.controls['to_section_id'].patchValue('');
    this.batchTransferForm.controls['type'].patchValue('');
    this.studentList = null
    this.selectAllStudent = false;    
    this.selectedStudentCount = 0;    
  }

  showStudentRecord() {
    this.isSubmit = true
    if (this.batchTransferForm.invalid) {
      return
    }
    this.selectAllStudent = false;    
    this.selectedStudentCount = 0;
    this.studentList = null;    
    this.isStudentReportGet = true
    this.batchService.getBatchTransferStudentList(this.batchTransferForm.value).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if(res.status) {
        this.studentList = res.data
        this.isStudentReportGet = false
        this.isSubmit = false
        if (this.studentList.from_student_list) {
          this.studentList.from_student_list.map(ele => ele.isSelect = false)
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
      this.studentList.from_student_list.map(ele => ele.isSelect = true)
      this.selectedStudentCount = this.studentList?.from_student_list?.length ?? 0
    } else {
      this.studentList.from_student_list.map(ele => ele.isSelect = false)
      this.selectedStudentCount = 0
    }
  }

  singleSelect() {
    const selectedValue = this.studentList.from_student_list.map(ele => ele.isSelect)
    if(selectedValue.includes(false)){
      this.selectedStudentCount = selectedValue?.filter(ele => ele == true).length
      this.selectAllStudent = false
    } else {
      this.selectAllStudent = true
      this.selectedStudentCount = this.studentList?.from_student_list?.length ?? 0
    }
  }


  transferStudent() {

    const studentIds = this.studentList.from_student_list.filter((ele )=> ele.isSelect).map((ele)=> ele.id);

    if (studentIds.length > 0) {
      const payload = {
        ...this.batchTransferForm.value,
        students : studentIds
      }

      this.batchService.batchTransfer(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
        if(res.status) {
          this._toaster.showSuccess(res.message);
          this.clearForm()
        }else{
          this._toaster.showError(res.message);
        }
      },(error)=> {
        this._toaster.showError(error.error.message)
      })
    }

  }

  getBatchFromId(id,type) {
    if (id) {
      if (type == 'from') {
        return this.fromBatchList?.find((ele:any) => ele.id == id)?.name ?? ''
      } else {
        return this.toBatchList?.find((ele:any) => ele.id == id)?.name ?? ''
      }
    }
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getSectionList() {
    this._reportService.getSectionList("").pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All' }].concat(res.data);
        this.getClasses ('')
      }
    })
  }

  formInit(){
    this.batchTransferForm = this._fb.group({
      from_section_id : [''],
      from_class_id : [null,[Validators.required]],
      from_batch_id : [null,[Validators.required]],
      type : [''],
      to_section_id : [''],
      to_class_id : [null,[Validators.required]],
      to_batch_id : [null,[Validators.required]],
      // to_type : ['']
    })

  }

  //#endregion Private methods
}
