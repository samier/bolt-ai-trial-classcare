import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ResultService } from '../../result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ExamServiceService } from 'src/app/modules/exam/exam-service.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-result-setup',
  templateUrl: './result-setup.component.html',
  styleUrls: ['./result-setup.component.scss']
})
export class ResultSetupComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  homeworkForm: FormGroup = new FormGroup({})
  markSheetClassId: string | null = null;
  data: any = []
  gradeTypeList: any = []
  markSheetId = localStorage.getItem('marksheet_id') || ''
  URLConstants = URLConstants;
  employeeList : any
  subjectList : any = []
  classTeacherRemarkList : any = []

  is_batch_wise: any = true
  is_student_wise: boolean = false;
  is_default: boolean = false;
  isRerender : boolean = true
  grade_id = null
  multiSelectDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  attendanceArray = [
    {
      name: 'Total Working',
      key: 'total_working'
    },
    {
      name: 'Present',
      key: 'present'
    },
    {
      name: 'Absent',
      key: 'absent'
    },
    {
      name: 'Leave',
      key: 'leave'
    },
  ];

  remarkArray = [
    {
      name: 'Teacher Remarks',
      key: 'teacher_remarks'
    },
    {
      name: 'School Will Be Re-open On',
      key: 'school_will_be_re_open_on'
    },
    {
      name: 'Promoted Class',
      key: 'promoted_class'
    },
    {
      name: 'Place',
      key: 'place'
    },
    {
      name: 'Result Date',
      key: 'result_date'
    },
  ];

  classId = null
  isResultSetup : boolean = false
  evenCoScolasticSubject : any = []
  oddCoScolasticSubject : any = []
  evenSkillSubject : any = []
  oddSkillSubject : any = []

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _resultService: ResultService,
    private _activatedRoute: ActivatedRoute,
    private _toaster: Toastr,
    private _examService : ExamServiceService,
    private _router : Router,
    private cdr: ChangeDetectorRef,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.markSheetClassId = this._activatedRoute.snapshot.paramMap.get('id') || null;
    this.getResultSetupList();
    this.getEmployeeList();
    this.getClassTeacherRemarkList()
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  saveResultSetup() {

    if(this.is_batch_wise){
      this.data.result_settings['is_batch_wise'] = true
    }
    else{
      this.data.result_settings['is_batch_wise'] = false
    }
    this.data.result_settings['is_student_wise'] = this.is_student_wise
    
    const payload = {
      mark_sheet_classes_id : this.markSheetClassId,
      result_settings : this.data.result_settings
    }
    this._resultService.saveResultSetup(payload).subscribe((res:any)=>{
      if(res?.status){
        this.goToAssignExam()
      }
    })
  }

  goToAssignExam() {
    if (this.markSheetId) {
      const url = `${URLConstants.ASSIGN_EXAM}/${this.markSheetId}`
      this._router.navigate([this._resultService.setUrl(url)]);
      localStorage.removeItem('marksheet_id');
      localStorage.removeItem('action_tab_ind');
    }
  }

  gradeTypeChnaged(event) {
    if (event) {
      const selectedGradeTypeName = this.gradeTypeList.find((ele)=> ele.id == event)?.name
      this.data.section_details.forEach(element => {
        element.subjects.forEach(ele => {
          ele['grade_type_name'] = selectedGradeTypeName
        });
      });
    }
  }

  getClassTeacherRemarkList() {
    this._resultService.getClassTeacherRemark().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) {
        this.classTeacherRemarkList = res.data
      }
    })
  }

  showDefaultGrade(){
    if(this.data?.result_settings?.selected_column.is_default_grade){
      this._resultService.showDefaultGrade().pipe(takeUntil(this.$destroy)).subscribe((res:any) => {
        if(res.status){
          this.isRerender = false
          this.gradeTypeList.push({
            id: res.data.id,
            name: res.data.name
          })
          setTimeout(() => {
            this.isRerender = true
          }, 100);
          this.data.result_settings.section.grade_id = res.data.id
        }
      })
    } else {
      this.isRerender = false
      this.gradeTypeList.pop()
      setTimeout(() => {
        this.isRerender = true
        this.data.result_settings.section.grade_id = null
      }, 100);
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.homeworkForm = this._fb.group({
      name: ['']
    })
  }

  getResultSetupList() {

    this.isResultSetup = true

    const payload = {
      mark_sheet_classes_id: this.markSheetClassId
    }

    this._resultService.getSubjectSetupMarkCalculation(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isResultSetup = false
      if (res.status) {
        this.data = res.data;
        
        if (!Object.keys(this.data.result_settings.selected_column).includes('water_mark')) {
          this.data.result_settings.selected_column.water_mark = true
        }

        if (!Object.keys(this.data.result_settings.selected_column).includes('minimum_marks')) {
          this.data.result_settings.selected_column.water_mark = false
        }
        
        if (!Object.keys(this.data.result_settings.selected_column).includes('is_default_grade')) {
          this.data.result_settings.selected_column.is_default_grade = false
        }

        if (!Object.keys(this.data.result_settings).includes('allow_inactive_student')) {
          this.data.result_settings.allow_inactive_student = false
        }
        
        this.is_student_wise = true

        if (Object.keys(res?.data?.result_settings).includes('is_batch_wise')) {
          this.is_batch_wise = res?.data?.result_settings?.is_batch_wise
        } else {
          this.is_batch_wise = true
        }

        this.subjectList = res.data.section_details.find(ele => ele.is_co_scholastic == 0)?.addational_subjects
        this.classId = res.data.class_id

        this.getGradeList(this.classId)

        const section_details = this.data.section_details.filter(ele => !ele.is_co_scholastic && !ele.is_skill_subject);
        const CoScholastic = this.data.section_details.find(ele => ele.is_co_scholastic);
        const skill_subjects = this.data.section_details.find(ele => ele.is_skill_subject);
        
        // this.data = {
        //   section_details: section_details,
        //   CoScholastic: CoScholastic ?? {},
        //   skill_subjects: skill_subjects,
        //   result_settings: res.data.result_settings,
        //   gridCoScholastic: {
        //     ...CoScholastic, // Clone the CoScholastic object
        //     subjects: [...CoScholastic?.subjects] // Create a deep copy of the subjects array
        //   }
        // };

        this.data = {
          section_details,
          CoScholastic,
          skill_subjects,
          result_settings: this.data.result_settings,
          gridCoScholastic: {
            ...CoScholastic,
            subjects: Array.isArray(CoScholastic?.subjects) ? [...CoScholastic?.subjects] : []
          }
        };

        // Update only gridCoScholastic.subjects if its length is odd
        if (this.data.gridCoScholastic.subjects?.length % 2 !== 0) {
          this.data.gridCoScholastic.subjects = [
            ...this.data.gridCoScholastic.subjects, 
            { exams: [{}] } // Append the new subject
          ];
        }

        if (this.data?.skill_subjects?.subjects?.length % 2 !== 0) {
          this.data.skill_subjects.subjects = [
            ...this.data.skill_subjects.subjects, 
            { exams: [{}] } // Append the new subject
          ];
        }

        

        this.evenSkillSubject = this.data.skill_subjects.subjects.filter((item, index) => index % 2 === 0);
        this.oddSkillSubject = this.data.skill_subjects.subjects.filter((item, index) => index % 2 !== 0);

        this.evenCoScolasticSubject = this.data.gridCoScholastic.subjects.filter((item, index) => index % 2 === 0);
        this.oddCoScolasticSubject = this.data.gridCoScholastic.subjects.filter((item, index) => index % 2 !== 0);

      } else {
        this._toaster.showError(res.message);
      }
    }, (error) => {
      this.isResultSetup = false
      this._toaster.showError(error?.message ?? error?.error?.message);
    })
  }

  getGradeList(id) {
    const payload = {
      class_id : id 
    }
    if(payload.class_id){
      this._examService.getGradeList(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.gradeTypeList = res.data
        // const data = res.data.find((ele) => ele.is_default)
        // this.is_default_drade = data ? true : false
        // if (this.is_default_drade && !this.data?.result_settings?.section.grade_id){
        //   this.data.result_settings.section.grade_id = data.id
        // }
        this.data.result_settings.selected_column.is_default_grade ? this.showDefaultGrade() : ''
        this.gradeTypeChnaged(this.data?.result_settings?.section.grade_id);
      });
    }
  }

  getEmployeeList () {
    this._resultService.getEmployee().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) {
        this.employeeList = res.data
      }
    })
  }

  //#endregion Private methods
}