import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ResultService } from '../../result/result.service';
import { ExamServiceService } from '../../exam/exam-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CombineMarksheetService } from '../combine-marksheet.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-combine-result-setup',
  templateUrl: './combine-result-setup.component.html',
  styleUrls: ['./combine-result-setup.component.scss']
})
export class CombineResultSetupComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  // data: any = [];

  skillData :any
  coScholasticData :any
  mainData :any
  attendance :any
  selectedGrade : any

  defaultSemester :any = {
    "grade": false,
    "total_marks": false,
    "total_obtained": false,
    "total_minimum_marks": false
  }

  gradeTypeList: any = [];
  subjectList: any = [];
  classTeacherRemarkList: any = [];
  isRerender: boolean = true;
  isResultSetup: boolean = false;
  multiSelectDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  markSheetID: any;
  resultDetails : any = {};
  resultSettings : any = {};
  classWiseSetting : any = []

  signatureDetails : any = {};
  remarks          : any = {};

  coScholasticSubjects : { name: string; grade: string }[]=[];

  markSheets: any[] = [];

  uniqueMarkSheets: any[] = [];
  uniqueSubjects: string[] = [];

  skillSubjectMarkSheets: any[] = [];
  skillSubjectNames: any[] = [];

  coScholasticList : any;
  skillSubjectList : any;
  mainSubjectList  : any

  facultyList : any[] = []
  gradeDetail : any[] = []

  is_loading : boolean = false

  combineClassForm : FormGroup = new FormGroup({})
  classListDP : any = []

  gradeObj : any = {}
  subjectObj : any = {}

  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _resultService: ResultService,
    private _activatedRoute: ActivatedRoute,
    public combineMarkSheetService : CombineMarksheetService,
    public toaster : Toastr,
    private _router: Router,
    private chd: ChangeDetectorRef,
    private _fb : FormBuilder,
  ) {
    this.markSheetID = this._activatedRoute.snapshot.paramMap.get('id') ?? null
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.fetchClassList()
    this.initForm()
    this.fetchDetails()
    this.fetchFacultyList()

    this.getClassTeacherRemarkList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  gradeTypeChanged(event:any) {
    if (event) {
      const selectedGradeTypeName = this.gradeTypeList?.find((ele:any) => ele.id == event)?.name
      this.setGrade(selectedGradeTypeName)
    }

  }
  setGrade(grade:any){
    this.mainData?.forEach((subject:any) => {
      subject['grade_type_name'] = "Select Class Wise Grade"
    });
  }

  showDefaultGrade() {
    if(this.resultSettings.selected_column.is_default_grade){
      this.combineMarkSheetService.showDefaultGrade().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.isRerender = false
          if(res.data){

            this.gradeTypeList.push({
              id: res.data.id,
              name: res.data.name
            })
            setTimeout(() => {
              this.isRerender = true
            }, 100);
            // this.resultSettings.section.grade_id = res.data.id
          }
          else{
            this.setGrade(null)
            this.resultSettings.section.grade_id = null
          }
        }
      })
    }
    else{
      this.isRerender = true
    }
  }
  
  isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  // !  ----------------------------------------------- FETCH DETAIL OF MARK SHEET -----------------------------------------------
  fetchDetails(){
    this.isResultSetup = true
    const payload = {
      combine_result_id : this.markSheetID
    }
    this.combineMarkSheetService.fetchResultDetails(payload).subscribe((res:any)=>{
      if(res.status){
        this.isResultSetup = false

        this.resultDetails  = res.data.result_details
        this.resultSettings = res.data.result_settings
        this.gradeTypeList  = res.data.grade_details

        this.classWiseSetting = this.resultSettings?.class_wise_settings

        this.mainData         = this.resultDetails[0]?.main_data
        this.coScholasticData = this.resultDetails[0]?.co_scolastic
        this.skillData        = this.resultDetails[0]?.skill_subject
        
        this.mainData         = this.objectToArray(this.mainData)
        this.coScholasticData = this.objectToArray(this.coScholasticData)
        this.skillData        = this.objectToArray(this.skillData)

        this.signatureDetails = this.resultSettings.signature
        this.remarks          = this.resultSettings.remark
        this.attendance       = this.resultSettings.attendance

        const grade = this.gradeTypeList.find((grade:any)=>grade.id == this.resultSettings.section.grade_id)?.name
        this.setGrade(grade)

        this.resultSettings['is_student_wise'] = true;
        // if (!this.resultSettings.hasOwnProperty('is_student_wise')) {
        //   this.resultSettings['is_student_wise'] = true
        // }
        if (!this.resultSettings.hasOwnProperty('subject_not_added_in_total')) {
          this.resultSettings['subject_not_added_in_total'] = []
        }
        if (!this.resultSettings.hasOwnProperty('semester_settings')) {
          this.resultSettings['semester_settings'] = this.defaultSemester
        }
        
        if (!this.resultSettings.hasOwnProperty('is_role_no_wise')) {
          this.resultSettings['is_role_no_wise'] = false
        }

        if (!this.resultSettings.hasOwnProperty('allow_inactive_student')) {
          this.resultSettings['allow_inactive_student'] = false
        }

        this.subjectList = Object.values(this.resultDetails[0].main_data.subjects)?.map((subject:any) => ({
          name: subject.name,
          id: subject.subject_id
        }));

        if( Array.isArray(this.classWiseSetting) && this.classWiseSetting?.length > 0){
          this.setClassWiseSetting()
        }
        this.chd.detectChanges()

      }
      else{
        this.chd.detectChanges()
        this.isResultSetup = false
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.isResultSetup = false
      this.toaster.showError( error?.error?.message ?? error?.message )
      this.chd.detectChanges()
    })
    
  }
  setClassWiseSetting() {
    const formArray = this.combineClassForm.get('class_wise_settings') as FormArray;
    formArray.clear();
  
    setTimeout(()=>{

      this.classWiseSetting?.forEach((item:any) => {
        this.fetchClassWiseGrade([{id : item.class_id}]);
        this.fetchClassWiseSubject([{id : item.class_id}]);
        formArray.push(this.createClassFormGroup(null,item));
      });
      this.chd.detectChanges()

    },300)

    const classIds = this.classWiseSetting?.map(classList=>classList.class_id) || []
    const selectedClasses  = this.classListDP?.filter( obj => classIds.includes(obj.id) ) || []

    if(selectedClasses?.length > 0){
      this.combineClassForm.controls['classF'].patchValue(selectedClasses)
    }
  }

  objectToArray(objData: any) {

    if(typeof objData === "object" && objData !== null && !Array.isArray(objData) && !this.isObjectEmpty(objData) ){
      const subjectKeys = Object.keys(objData.subjects);
      const subjectsArray = subjectKeys?.map((key) => {
        const subject = objData.subjects[key];

        const markSheetKeys = Object.keys(subject.mark_sheet);
        const markSheetArray = markSheetKeys?.map((msKey) => ({
          ...subject.mark_sheet[msKey],
        }));

        return {
          ...subject,
          mark_sheet: markSheetArray,
        };
      });

      return subjectsArray;
    }
    else{
      return []
    }

  }

  calculateTotal(markSheet: any): number {
    return markSheet?.exams?.reduce((sum: number, exam: any) => sum + (+exam?.converted_marks || 0), 0);
  }
  
  calculateGrandTotal(markSheets: any[]): number {
    return markSheets?.reduce((total: number, markSheet: any) => total + this.calculateTotal(markSheet), 0);
  }
  
  // !  ----------------------------------------------- SAVE DETAIL OF MARK SHEET -----------------------------------------------

  saveResultSetup(){

    let classSetting = structuredClone(this.combineClassForm.value );
    delete classSetting.classF;

    classSetting.class_wise_settings?.forEach((classItem: any) => {
      const signature = {
        name: 'Signature',
        column_name: classItem.column_name
      }
      classItem['signature'] = signature
      delete classItem.name;
      delete classItem.column_name;
    })

    this.resultSettings.subject_not_added_in_total = []

    this.resultSettings.signature.name = ''
    this.resultSettings.signature.column_name?.forEach((signObj:any)=>{
      signObj['signature'] = false
      signObj['signature-label'] = ''
      signObj['signature-user'] = null
    })
    this.resultSettings.section.grade_id = null

    this.resultSettings.remark.column_name.result_date = false
    this.resultSettings.remark.column_name.result_date_value = null

    this.resultSettings.remark.column_name.promoted_class = false
    this.resultSettings.remark.column_name.promoted_class_value = null

    this.resultSettings.remark.column_name.school_will_be_re_open_on = false
    this.resultSettings.remark.column_name.school_will_be_re_open_on_value = null

    this.resultSettings['is_student_wise'] = true;

    
    const payload = {
      combine_result_id : this.markSheetID ,
      result_settings :  {...this.resultSettings, ...classSetting }
    }

    this.is_loading = true
    this.combineMarkSheetService.updateCombineMarkSheet(payload).subscribe((res:any)=>{
      if(res.status){
        this.is_loading = false;
        this.toaster.showSuccess(res.message)
        this._router.navigate([`${window.localStorage.getItem('branch')}/${URLConstants.COMBINE_MARKSHEET_LIST}`])
      }
      else{
        this.toaster.showError(res.message)
        this.is_loading = false;
      }
    },(error:any)=>{
      this.is_loading = false;
      this.toaster.showError( error?.error?.message ?? error?.message )
    })
  }

  fetchClassList(){
    this.combineMarkSheetService.fetchClassList(+this.markSheetID).subscribe((res:any)=>{
      if(res.status){
        this.classListDP = res.data
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError( error?.error?.message ?? error?.message )
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  // #endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm(){

    this.combineClassForm = this._fb.group({
      classF : [null] , 
      class_wise_settings: this._fb.array([])
    })
  }

  // TODO :- FORM ARRAY RELATED FUNCTION

  fetchClassWiseGrade(selectedClasses:any=[]){
    if(selectedClasses?.length >= 0 ){
      selectedClasses.forEach((classObj:any) => {
        if(!this.gradeObj.hasOwnProperty(classObj.id)){

          const payload = {
            class_id : classObj.id
          }
          this.combineMarkSheetService.getGradeOnClass(payload).subscribe((res:any)=>{

            this.gradeObj[classObj.id] = res.data
            
          },(error:any)=>{
            this.toaster.showError( error?.error?.message ?? error?.message )
          })
          
        }
      });
    }
  }

  fetchClassWiseSubject(selectedClasses:any=[]){
    if(selectedClasses?.length >= 0 ){
      selectedClasses.forEach((classObj:any) => {
        if(!this.subjectObj.hasOwnProperty(classObj.id)){

          const payload = {
            class_id : classObj.id
          }
          this.combineMarkSheetService.getSubjectOnClass(payload).subscribe((res:any)=>{

            this.subjectObj[classObj.id] = res.data
            
          },(error:any)=>{
            this.toaster.showError( error?.error?.message ?? error?.message )
          })
          
        }
      });
    }
  }

  handleClassChange() {
    
    const formArray = this.combineClassForm.get('class_wise_settings') as FormArray;
    const selectedClasses = this.combineClassForm.value.classF || [];

    this.fetchClassWiseGrade(selectedClasses)
    this.fetchClassWiseSubject(selectedClasses)

    const existingDataMap = new Map(formArray.controls?.map((fg: any) => [fg.value.class_id, fg]));

    const updatedFormArray = this._fb.array(
      selectedClasses?.map(selectedClass => {
        if (existingDataMap.has(selectedClass.id)) {
          return existingDataMap.get(selectedClass.id);
        } else {
          return this.createClassFormGroup(selectedClass);
        }
      })
    );

    this.combineClassForm.setControl('class_wise_settings', updatedFormArray);
  }

  updateClassWiseSettings(selectedClasses: any[]) {
    const formArray = this.combineClassForm.get('class_wise_settings') as FormArray;

    formArray.push(this.createClassFormGroup(selectedClasses,null));
    
  }

  createClassFormGroup(classId: any, editData: any = null): FormGroup {
    return this._fb.group({
      class_id: [editData ? editData.class_id : classId.id],
      grade_id: [editData ? editData.grade_id : null], 
      name: [editData ? editData.signature?.name || 'Signature' : 'Signature'],
      column_name: this._fb.array(this.createSignatureArray(editData?.signature?.column_name || [])), 
      result_date: [editData ? editData.result_date : false],
      result_date_value: [editData ? editData.result_date_value : null],
      promoted_class: [editData ? editData.promoted_class : false],
      promoted_class_value: [editData ? editData.promoted_class_value : ''],
      school_will_be_re_open_on: [editData ? editData.school_will_be_re_open_on : false],
      school_will_be_re_open_on_value: [editData ? editData.school_will_be_re_open_on_value : null],
      subject_not_added_in_total: [editData ? editData.subject_not_added_in_total : []]
    });
  }
  
  // Function to create column_name array dynamically
  createSignatureArray(columns: any[]): FormGroup[] {
    return (columns.length ? columns : Array(3).fill({
      signature: false,
      'signature-user': null,
      'signature-label': ''
    }))?.map(col => this._fb.group({
      signature: [col.signature],
      'signature-user': [col['signature-user']],
      'signature-label': [col['signature-label']]
    }));
  }

  get classWiseSettings(): FormArray {
    return this.combineClassForm.get('class_wise_settings') as FormArray;
  }

  getClassFormGroup(index: number): FormGroup {
    return this.classWiseSettings.at(index) as FormGroup
  }

  getClassName(data:any){
    const id = data.value.class_id
    return this.classListDP?.find((obj:any)=>obj.id == id)?.name || 'ClassName'
  }
  getGradeDropDown(data:any){
    const id = data.value.class_id
    return this.gradeObj[id] || []
  }
  getClassDropDown(data:any){
    const id = data.value.class_id
    return this.subjectObj[id] || []
  }

  // TODO :-  Function to handle Select Subject Which Mark Not Include into Total Mark

  onSubjectsChange(event: any, classIndex: number) {
    const selectedSubjects = event.value; // Extract selected values from event
  
    if (Array.isArray(selectedSubjects)) {
      this.classWiseSettings.at(classIndex).get('subject_not_added_in_total')?.setValue(selectedSubjects);
    } else {
      console.error('Invalid selection data:', selectedSubjects);
    }
  }


  // TODO : TEACHER REMARKS DP LIST
  getClassTeacherRemarkList() {
    this._resultService.getClassTeacherRemark().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.classTeacherRemarkList = res.data?.map((teacher:any)=>({
          id: teacher.id,
          name: teacher.remark_title
        }))
      }
    })
  }

  //  TODO : FACULTY DP LIST
  fetchFacultyList(){
    this.combineMarkSheetService.fetchFacultyList().subscribe((res:any)=>{
      if(res.status){
        this.facultyList = res.data
      }
      else{
        this.toaster.showSuccess(res.message)
      }

    },(error:any)=>{
      this.toaster.showError( error?.error?.message || error?.message )
    })
  }

  //#endregion Private methods
}