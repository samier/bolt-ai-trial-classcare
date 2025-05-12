import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ResultService } from '../result.service';
import {URLConstants} from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-add-sidhi-gun',
  templateUrl: './add-sidhi-gun.component.html',
  styleUrls: ['./add-sidhi-gun.component.scss']
})
export class AddSidhiGunComponent implements OnInit {
 
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  enterMarksForm: FormGroup = new FormGroup({})
  marksDataForm: FormGroup = new FormGroup({})
  URLConstants = URLConstants;

  // examId: number | string = 0
  marksheetClassId : string | null = null
  isMarkField : boolean = false
  isUpdate : boolean = false
  isGetMarks : boolean = false
  className: any;
  marksheetId: any;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _activatedRoute:ActivatedRoute,
    private _toaster: Toastr,
    private _router: Router,
    private _location: Location,
    private _resultService : ResultService
  ) { 
    this.className = this._activatedRoute.snapshot.queryParams['class'] ?? null;
    this.marksheetId = this._activatedRoute.snapshot.queryParams['marksheetId'] ?? null;
   }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.marksheetClassId = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.examMarks(null);
    if (this.marksheetClassId) {
      this.getKrupaSidhiGun()
    }
    // this.getBatches();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  get studentArray(): FormArray {
    return this.enterMarksForm.get("marks") as FormArray
  }

  subjectArray(index: number): FormArray {
    return this.studentArray.at(index).get("exam") as FormArray;
  }

  saveMarks() {
    const payload = {
      mark_sheet_classes_id: this.marksheetClassId,
      student_data: this.enterMarksForm?.value?.marks
    }

    payload.student_data.forEach(student => {
      let newExamArray: any = [];
      student.exam.forEach(exam => {
        if (!((exam.krupa_gun == "" || exam.krupa_gun == null) && (exam.siddhi_gun == "" || exam.siddhi_gun == null))) {
          newExamArray.push(exam);
        }
      });
      student.exam = newExamArray;
    });

    this._resultService.storeKrupaSidhiGun(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this._toaster.showSuccess(res.message);
        this.goToListPage()
      } else {
        this._toaster.showError(res.message);
      }
    }, (error) => {
      this._toaster.showError(error?.error ?? error?.error?.errors);
    })

  }
  setUrl(url: string) {
     return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  // clearData() {
  //   this.marksDataForm.reset();
  //   this.enterMarksForm.reset();
  // }

  goToListPage() {
    this._location.back()
  }

  getKrupaSidhiGun () {
    const payload = {
      mark_sheet_classes_id : this.marksheetClassId
    }

    this.isGetMarks = true
    this._resultService.getKrupaSidhiGun(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status){
        this.examMarks(res.data);
        this.isGetMarks = false
      } else {
        this.isGetMarks = false
        this._toaster.showError(res.message);
      }
    },(error)=> {
      this.isGetMarks = false
      this._toaster.showError(error?.error ?? error?.error.errors);
    })
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  examMarks(data) {
    this.enterMarksForm = this._fb.group({
      marks: this._subFormArray(data)
    })
  }

  private _subFormArray(data): FormArray {
    const formArry: any = this._fb.array([]);
    if (data?.length > 0) {
      data.forEach((ele: any, index) => {
        formArry.push(this._subArrayGroup(ele, index));
      });
    }

    return formArry;
  }

  private _subArrayGroup(data: any, i) {
    const fa: FormGroup = this._fb.group({
      roll_no: [data?.student_rollno ?? ''],
      student_id: [data?.student_id ?? ''],
      student_full_name: [data?.student_full_name ?? ''],
      batch_name: [data?.batch_name ?? ''],
      batch_id: [data?.batch_id ?? ''],
      class_id: [data?.class_id ?? ''],
      exam: this._subToSubFormArray(data.exam ?? null)
    });
    return fa;
  }

  private _subToSubFormArray(data): FormArray {
    const formArry: any = this._fb.array([]);
    if (data?.length > 0) {
      data.forEach((ele: any, index) => {
        formArry.push(this._subtosubArrayGroup(ele, index));
      });
    }

    return formArry;
  }

  private _subtosubArrayGroup(data: any, i) {
    const fa: FormGroup = this._fb.group({
      subject_id: [data?.subject_id],
      subject_name: [data?.subject_name],
      krupa_gun: [data?.krupa_gun,[Validators.min(0)]],
      siddhi_gun: [data?.siddhi_gun,[Validators.min(0)]],
    });
    return fa;
  }

  //#endregion Private methods
}