import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { BatchService } from '../batch.service';

@Component({
  selector: 'app-student-assign-batch',
  templateUrl: './student-assign-batch.component.html',
  styleUrls: ['./student-assign-batch.component.scss']
})
export class StudentAssignBatchComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants
  filterStudentText : string = ''
  studentInBatchText : string = ''
  studentList : any 
  batchId : string | null = ''
  selectAllNotInBatchStudent : boolean = false
  selectAllInBatchStudent : boolean = false
  isSave : boolean = false
  isGetData : boolean = false
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _activatedRoute : ActivatedRoute,
    private _toaster : Toastr,
    private _batchService : BatchService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.batchId = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.getStudentOnBatch()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  selectAllNotInBatch() {
    if(this.selectAllNotInBatchStudent) {
      this.studentList.not_in_batch.map(ele => ele.isSelect = true)
      // this.selectedStudentCount = this.studentList?.from_student_list?.length ?? 0
    } else {
      this.studentList.not_in_batch.map(ele => ele.isSelect = false)
      // this.selectedStudentCount = 0
    }
  }

  singleSelectNotInBatch() {
    const selectedValue = this.studentList.not_in_batch.map(ele => ele.isSelect)
    if(selectedValue.includes(false) || selectedValue.includes(undefined)){
      // this.selectedStudentCount = selectedValue?.filter(ele => ele == true).length
      this.selectAllNotInBatchStudent = false
    } else {
      this.selectAllNotInBatchStudent = true
      // this.selectedStudentCount = this.studentList?.from_student_list?.length ?? 0
    }
  }

  selectAllInBatch() {
    if(this.selectAllInBatchStudent) {
      this.studentList.in_batch.map(ele => ele.isSelect = true)
      // this.selectedStudentCount = this.studentList?.from_student_list?.length ?? 0
    } else {
      this.studentList.in_batch.map(ele => ele.isSelect = false)
      // this.selectedStudentCount = 0
    }
  }

  singleSelectInBatch() {
    const selectedValue = this.studentList.in_batch.map(ele => ele.isSelect)
    if(selectedValue.includes(false) || selectedValue.includes(undefined)){
      // this.selectedStudentCount = selectedValue?.filter(ele => ele == true).length
      this.selectAllInBatchStudent = false
    } else {
      this.selectAllInBatchStudent = true
      // this.selectedStudentCount = this.studentList?.from_student_list?.length ?? 0
    }
  }

  /**
 * Add or remove a student from the batch
 * @param studentId - ID of the student
 * @param type - 'add' or 'remove'
 */
  addRemoveSingleStudentInBatch(studentId: number, type: 'add' | 'remove') {
    const fromList = type === 'add' ? this.studentList.not_in_batch : this.studentList.in_batch;
    const toList = type === 'add' ? this.studentList.in_batch : this.studentList.not_in_batch;

    const index = fromList.findIndex(student => student.id === studentId);
    if (index > -1) {
      const [student] = fromList.splice(index, 1);
      toList.push(student);
    }
    this.resetSelection();
  }

  /**
   * 
   * @param type 'add' or 'remove'
   */
  addRemoveMultiStudentInBatch(type) {

    if (type == 'add') {
      const selectedStudent = this.studentList.not_in_batch.filter(ele => ele.isSelect)
      if (selectedStudent.length == 0) {
        this._toaster.showError('Please select at least 1 student')
        return
      }
      this.studentList.in_batch.push(...selectedStudent)
      this.studentList.not_in_batch = this.studentList.not_in_batch.filter(ele => !ele.isSelect)
    } else {
      const selectedStudent = this.studentList.in_batch.filter(ele => ele.isSelect)
      if (selectedStudent.length == 0) {
        this._toaster.showError('Please select at least 1 student')
        return
      }
      this.studentList.not_in_batch.push(...selectedStudent)
      this.studentList.in_batch = this.studentList.in_batch.filter(ele => !ele.isSelect)
    }
    this.resetSelection();
  }

  saveAssignBatchStudent() {
    this.isSave = true

    const payload = {
      batch_id: this.batchId,
      in_batch: this.studentList.in_batch.length > 0 ? this.studentList.in_batch.map(ele => ele.id) : [],
      not_in_batch: this.studentList.not_in_batch.length > 0 ? this.studentList.not_in_batch.map(ele => ele.id) : [],
    }

    this._batchService.updateBatchStudent(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isSave = false
      if (res.status) {
        this._toaster.showSuccess(res.message)
      } else {
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this.isSave = false
      this._toaster.showError(error?.error?.message ?? error?.message)
    })

  }


  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  resetSelection () {
    this.studentList.not_in_batch.forEach(element => {
      element.isSelect = false
    });
    this.studentList.in_batch.forEach(element => {
      element.isSelect = false
    });
    this.selectAllInBatchStudent = false
    this.selectAllNotInBatchStudent = false
  }

  getStudentOnBatch () {
    this.isGetData = true
    this._batchService.getStudentOnBatch(this.batchId).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
    this.isGetData = false
      if(res.status) {
        this.studentList = res.data
      } else {
        this._toaster.showError(res.message)
      }
    },(error)=>{
      this.isGetData = false
      this._toaster.showError(error?.error?.error ?? error?.error?.message ?? error?.message)
    })
  }
	
  //#endregion Private methods
}