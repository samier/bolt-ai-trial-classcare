import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CourseService } from '../course.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from 'src/app/modules/report/report.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  sectionList :any = [];
  subjectList :any = [];
  categoryList :any = [];
  course :any = [];
  id:any;
  courseForm: FormGroup = new FormGroup({})
  has_late_fees:boolean = false;
  URLConstants = URLConstants;
  months:any = [
    { id:'January', name:'January' },
    { id:'February', name:'February' },
    { id:'March', name:'March' },
    { id:'April', name:'April' },
    { id:'May', name:'May' },
    { id:'June', name:'June' },
    { id:'July', name:'July' },
    { id:'August', name:'August' },
    { id:'September', name:'September' },
    { id:'October', name:'October' },
    { id:'November', name:'November' },
    { id:'December', name:'December' }
  ]
  onetimeMultiSelectDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'type_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 6,
    allowSearchFilter: true
  };
  monthMultiSelectDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'month',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 6,
    allowSearchFilter: true
  };
  multiSelectDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  selectedCategories:any = [];
  late_fees_types:any = [
    { id : 1, name: 'Day wise' },
    { id : 2, name: 'Week wise' },
    { id : 3, name: 'Month wise' }
  ];
  days: { id: number, name: number }[] = Array.from({ length: 31 }, (_, i) => ({
    id: i + 1,
    name: i + 1,
  }));
  fees:any = {
    onetime : {},
    monthlyFees : {},
    categoryMonthlyFees : {}
  }
  saving:boolean = false;
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public courseService:CourseService,
    public commonService:CommonService,
    private toastr:Toastr,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private _fb: FormBuilder,
    private reportService: ReportService,
    public formValidationService: FormValidationService,
  ) { }

  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    this.getSubjectList();
    this.getCategoryList();
    this.id = this._activatedRoute.snapshot.paramMap.get('id') || null
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  selectMonth(){
    const selected = this.courseForm?.get('instituteFees')?.value?.map((item:any)=>item.id) || [];
    Object.keys(this.fees?.monthlyFees || {}).forEach((month:any)=>{
      if(!selected?.includes(month)){
        delete this.fees?.monthlyFees?.[month];
      }
    })
  }

  removeInstituteFeesMonth(month:any){
    this.courseForm?.get('instituteFees')?.setValue(this.courseForm?.value?.instituteFees?.filter((item:any)=>item.name != month));
    delete this.fees?.monthlyFees?.[month];
  }

  handleCategorySelect(){
    const selected = this.courseForm?.get('types_of_fees')?.value?.map((item:any)=>item.id) || [];
    Object.keys(this.fees?.categoryMonthlyFees || {}).forEach((categoryId:any)=>{
      if(!selected?.includes(Number(categoryId))){
        delete this.fees?.categoryMonthlyFees?.[categoryId];
      }
    })
    this.selectedCategories = this.categoryList?.categories?.filter((cat:any) => selected?.includes(cat.id));
  }

  removeCategory(category:any){
    category.selected_months = [];
    if(typeof category == 'object' && category !== null && !Array.isArray(category)){
      delete this.fees?.categoryMonthlyFees?.[category.id];
    }
    this.courseForm?.get('types_of_fees')?.setValue(this.courseForm?.get('types_of_fees')?.value?.filter((item:any)=>item.id != category.id));
    this.handleCategorySelect();
  }

  onChangeValue(category){
    // console.log(category);
  }

  removeCategoryMonth(category:any,month:any = null){
    if (typeof month === 'object' && month !== null && !Array.isArray(month)) {
      month = month.month;
    }
    category.selected_months = category?.selected_months?.filter((item:any)=>item.month != month);
    delete this.fees?.categoryMonthlyFees?.[category.id]?.[month];
    if(Object.keys(this.fees?.categoryMonthlyFees?.[category.id] || {})?.length == 0 || !month){
      delete this.fees?.categoryMonthlyFees?.[category.id];
    }
  }

  removeOnetime(onetime){
    this.categoryList.selected_onetime = this.categoryList?.selected_onetime?.filter((item:any)=>item.id != onetime.id);
    if(typeof onetime == 'object' && onetime !== null && !Array.isArray(onetime)){
      delete this.fees?.onetime?.[onetime.id];
    }else{
      this.fees.onetime = {};
    }
  }

  get subjectGroup(): FormArray{
    return this.courseForm?.get('subject_groups') as FormArray
  }

  addGroup(group = null){
    this.subjectGroup.push(
      this._fb.group({
        group: [group,Validators.required,ClassCareValidatores.minSelection(2,'Please select atleast 2 subjects')],
        selected_subject: [[...this.courseForm?.value?.subjects]]
      })
    );
    this.handleSubjectGroupChange();
  }

  handleSubjectChange(){
    this.subjectGroup.clear();
  }

  handleSubjectGroupChange() {

    const selectedSubjectsMap = new Map<number, any>(); 
    
    this.subjectGroup?.controls?.forEach((control: any, index: number) => {
      const group = control.value?.group || [];
      group.forEach((subject: any) => {
        selectedSubjectsMap.set(subject.id, index);
      });
    });

    this.subjectGroup?.controls?.forEach((currentControl: any, currentIndex: number) => {
      const updatedSubjects = this.courseForm?.value?.subjects.map((subject: any) => {

        const isDisabled = selectedSubjectsMap.has(subject.id) &&
                           selectedSubjectsMap.get(subject.id) !== currentIndex;
        return {
          ...subject,
          isDisabled
        };
      });

      
      if (JSON.stringify(currentControl.get('selected_subject').value) !== JSON.stringify(updatedSubjects)) {
        currentControl.get('selected_subject')?.patchValue(updatedSubjects, { emitEvent: false });
      }
      
      // currentControl.get('selected_subject')?.setValue(updatedSubjects);
    });

  }

  removeSubjectGroup(i: number){
     this.subjectGroup.removeAt(i);
     this.handleSubjectGroupChange();
  }

  handleCategoryMonthlyFeesChange(categoryId: number, month: string, event:any){
    if(!this.fees.categoryMonthlyFees[categoryId]){
      this.fees.categoryMonthlyFees[categoryId] = {};
    }
    this.fees.categoryMonthlyFees[categoryId][month] = event?.target?.value;
  }

  handleLateFeesToggle(){
    this.courseForm.patchValue({
      last_day_for_fees_pay : null,
      last_fees_apply_day : null,
      late_fees_type : null,
      late_fees_amount : null,
    })
  }

  feesValidation(){
    const course_fees = Number(this.courseForm.get('fees')?.value ?? 0);
    let categories_fees = 0;
    const rte_fees_id = this.categoryList?.categories?.find(item=>item.type_name == 'RTE Fees')?.id;

    // count monthly fees
    Object.keys(this.fees.monthlyFees).forEach((month: string) => {
      categories_fees += Number(this.fees.monthlyFees[month]??0);
    }) 

    // count categories fees
    Object.keys(this.fees.categoryMonthlyFees).forEach((categoryId: any) => {
      if(rte_fees_id != categoryId){
        Object.keys(this.fees.categoryMonthlyFees[categoryId]).forEach((month: string) => {
          categories_fees += Number(this.fees.categoryMonthlyFees[categoryId][month]??0);
        }) 
      }
    }) 
    if(categories_fees == course_fees){
      return true;
    }
    this.toastr.showError('Invalid Total Fees');
    return false;
  }

  submit(){
    if(this.courseForm.invalid || this.courseForm?.value?.fees < this.courseForm?.value?.late_fees_amount || !this.feesValidation()){
      this.formValidationService.getFormTouchedAndValidation(this.courseForm)
      return;
    }
    this.saving = true;
    this.courseService.storeOrUpdateCourse({...this.courseForm.value,...this.fees},this.id).subscribe((res:any) => {
        if(res.status) {
          this.toastr.showSuccess(res.message)
          this.router.navigate([this.courseService.setUrl(URLConstants.COURSE_LIST)]);
        } else {
          this.toastr.showError(res.message)
        }
        this.saving = false;
      } ,(error)=> {
        this.saving = false;
        this.toastr.showError(error?.error?.message || error?.message)
      })
  }

  cancel(){
    this.subjectGroup.clear()
    this.courseForm.reset();
    this.fees = {
      onetime : {},
      monthlyFees : {},
      categoryMonthlyFees : {}
    }
    this.categoryList?.categories?.forEach((category:any) => {
      category.selected_months = [];
    })
    this.categoryList.selected_onetime = [];
    this.selectedCategories = [];
    if(this.id){
      this.getCourseOnId();
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.courseForm = this._fb.group({
      name: [null, [Validators.required]],
      section_id: [null],
      subjects: [null,[Validators.required]],
      fees: [0,[Validators.required]],
      instituteFees: [],
      types_of_fees: [],
      subject_groups: this._fb.array([]),
      last_day_for_fees_pay: [],
      last_fees_apply_day: [],
      late_fees_type: [],
      late_fees_amount: [],
    })
  }

  getSectionList() {
    this.reportService.getSectionList({}).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.sectionList = res?.data; 
      } else {
        this.toastr.showError(res.message)
      }
    } ,(error)=> {
      this.toastr.showError(error?.error ?? error?.error?.message)
    })
  }

  getSubjectList() {
    this.courseService.getSubjectList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.subjectList = res?.data; 
      } else {
        this.toastr.showError(res.message)
      }
    } ,(error)=> {
      this.toastr.showError(error?.error ?? error?.error?.message)
    })
  }

  getCategoryList() {
    this.courseService.getCategoryList().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.categoryList = res?.data; 
        this.categoryList?.categories?.forEach((cat:any)=>{
          cat.name = cat.type_name;
        }) 
        if(this.id){
          this.getCourseOnId();
        }
      } else {
        this.toastr.showError(res.message)
      }
    } ,(error)=> {
      this.toastr.showError(error?.error ?? error?.error?.message)
    })
  }

  getCourseOnId() {
    this.courseService.getCourseOnId(this.id).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.course = res.data; 
        this.setFormValues();
      } else {
        this.toastr.showError(res.message)
      }
    } ,(error)=> {
      this.toastr.showError(error?.error ?? error?.error?.message)
    })
  }

  setFormValues(){
    if(this.course){
      
      if(this.course?.late_fees_amount){
        this.has_late_fees = true;
      }
      
      // set one time fees
      const onetimeIds = Object.keys(this.course?.one_time_fees || {}) || [];
      if(onetimeIds.length > 0){
        this.fees.onetime = this.course?.one_time_fees;
        this.categoryList.selected_onetime = this.categoryList?.onetime?.filter(onetime=> onetimeIds.includes(onetime.id.toString()))
      }
      
      // set monthly fees
      const months = Object.keys(this.course?.monthlyFees || {}) || [];
      if(months.length > 0){
        this.fees.monthlyFees = this.course.monthlyFees || {};
        this.courseForm?.get('instituteFees')?.setValue(this.months.filter(month => months.includes(month?.name)));
      }
      
      // set categories fees
      const categories = Object.keys(this.course?.categoryMonthlyFees || {}) || [];
      if(categories.length > 0){
        this.fees.categoryMonthlyFees = this.course.categoryMonthlyFees || {};
        const selected_categories = this.categoryList?.categories?.filter(category => categories.includes(category?.id?.toString()));
        this.courseForm?.get('types_of_fees')?.setValue(selected_categories);
        selected_categories?.forEach((category:any)=>{
          const months = Object.keys(this.fees?.categoryMonthlyFees?.[category?.id?.toString()] || {}) || [];
          category.selected_months = category.months.filter(month => months.includes(month.month));
        })
        this.selectedCategories = selected_categories;
      }

      // set form
      this.courseForm.patchValue({
        name : this.course?.name,
        section_id : this.course?.section_id,
        subjects : this.course?.subjects,
        fees : this.course?.fees,
        last_day_for_fees_pay : this.course?.last_day_for_fees_pay,
        last_fees_apply_day : this.course?.last_fees_apply_day,
        late_fees_type : this.course?.late_fees_type,
        late_fees_amount : this.course?.late_fees_amount,
      })
      
      // set subject group
      this.divideByGroupId(this.course?.subjects || [])?.forEach((group:any) => {
        this.addGroup(group);
      })
    }
  }

  divideByGroupId(items: any){
    return items
        .filter(item => item.group_id !== null)
        .reduce((result, item) => {
            let group = result.find(g => g.length > 0 && g[0].group_id === item.group_id);
            if (!group) {
                group = [];
                result.push(group);
            }
            group.push(item);
            return result;
        }, []);
  }
  //#endregion Private methods


}
