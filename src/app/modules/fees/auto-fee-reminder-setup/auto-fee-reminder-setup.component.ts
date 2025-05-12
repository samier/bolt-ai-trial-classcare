import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { BatchService } from '../../batch/batch.service';
import { HomeworkService } from '../../homework/homework.service';
import { FeesService } from '../fees.service';
import { reminderEndType, reminderStartType, weeklyReminderDay } from 'src/app/common-config/static-value';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-auto-fee-reminder-setup',
  templateUrl: './auto-fee-reminder-setup.component.html',
  styleUrls: ['./auto-fee-reminder-setup.component.scss']
})
export class AutoFeeReminderSetupComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  feeReminderSetupF : FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  user_id: any = window.localStorage.getItem('user_id');
  isSaveLoading: boolean = false;
  tableLoading: boolean = false;
  isPageLoading: boolean = false;
  sectionList: any [] = [];
  batchList: any [] = [];
  classList: any [] = [];
  feeCategoryList: any [] = [];
  category_ids: any = [];
  reminderStartType = reminderStartType;
  weeklyReminderDay = weeklyReminderDay;
  reminderEndType = reminderEndType;
  categories_data = new Map<string, any[]>();
  hasSetupId: any;
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private batchService: BatchService,
    private homeWorkService: HomeworkService,
    private feeService: FeesService,
    private _fb : FormBuilder,
    private toastr: Toastr,
    private router: Router,
    private formValidationService: FormValidationService,
    private activatedRoute: ActivatedRoute,
    private chd: ChangeDetectorRef
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    // this.getFeeCategoryList();
    this.hasSetupId = this.activatedRoute.snapshot.params['id'];
    if(this.hasSetupId){
      this.loadExistingData()
    }
    ['send_sms', 'send_whatsapp'].forEach(key => {
      this.feeReminderSetupF.get(key)?.valueChanges.subscribe(checked => {
        if (!checked) {
          this.feeReminderSetupF.patchValue({
            [`${key}_father`]: false,
            [`${key}_mother`]: false,
            [`${key}_student`]: false
          }, { emitEvent: false });
        }
      });
    });
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  resetControls(fields: string[], resetLists: string[]) {
    fields.forEach(field => {
      this.feeReminderSetupF?.controls[field].patchValue(null)
      this.feeReminderSetupF?.controls[field].markAsPristine();
    });
    resetLists.forEach(list => (this[list] = []));
  }
  
  onSectionChange() {
    this.resetControls(['class_ids', 'batch_ids'], ['classList', 'batchList']);
    this.getClassList();
  }
  
  onClassChange() {
    this.resetControls(['batch_ids'], ['batchList']);
    this.getBatchList();
    this.getFeeCategoryList()
  }

  get tableRows(): FormArray {
    return this.feeReminderSetupF.get("categories_data") as FormArray;
  }
  
  onFeeCategoryChange() {
    const payload = {
      category_ids : this.getID(this.feeReminderSetupF?.value?.category_ids)
    };
    this.tableLoading = true;
    this.feeService.getFeeCategoryDetails(payload).subscribe((res: any) => {
      this.tableLoading =  false;
      if (res?.status) {
        this.updateTableRows(res.data);
      }
    },
    (error: any) => {
      this.tableLoading = false;
      this.tableRows.clear();
      this.toastr.showError(error?.error?.message ?? error?.errors?.message ?? error?.message);
    });
  }

  onSubmit() {
    this.tableRows?.controls.forEach((row) => {
      const formGroup = row as FormGroup;
      const reminderType = formGroup.get('reminder_type')?.value;
      const endType = formGroup.get('end_type')?.value;

      formGroup.get('selected_day')?.setValidators(
        reminderType == '2' ? [Validators.required] : reminderType == '3' ? [Validators.required, ClassCareValidatores.min(1, "Value must be between 1-31"), ClassCareValidatores.max(31,"Value must be between 1-31") , ClassCareValidatores.pattern('^0*[1-9][0-9]*$', "Only positive non-decimal numbers are allowed")] : null
      );
      formGroup.get('end_date')?.setValidators(
        endType == '1' ? [Validators.required] : null
      );

      if(formGroup.get('reminder_type')?.value == '0' ){
        formGroup.get('start_date')?.clearValidators();
        formGroup.get('start_date')?.updateValueAndValidity();
      }
    
      formGroup.updateValueAndValidity();
    });

    this.feeReminderSetupF.reset(this.feeReminderSetupF.value);

    if (this.feeReminderSetupF.invalid) {
      this.formValidationService.getFormTouchedAndValidation(this.feeReminderSetupF);
      return this.toastr.showError("Please fill all required fields");
    }
  
    const formData = this.feeReminderSetupF?.value;
    const payload = {
      ...(this.hasSetupId && ({id: this.hasSetupId})),
      ...formData,
      section_ids: this.getID(formData?.section_ids),
      class_ids: this.getID(formData?.class_ids),
      batch_ids: this.getID(formData?.batch_ids),
      categories_data: formData?.categories_data?.map(row => ({
        ...row,
        category_id: this.getID(row?.category_id)
      })),
    }

    this.isSaveLoading = true;
    this.feeService.saveOrUpdateAutoFeeReminder(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if (res?.status) {
        this.toastr.showSuccess(res?.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.AUTO_FEE_REMINDER_LIST)]);
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.error?.message ?? error?.errors?.message ?? error?.message);
    });
  }

  handleReminder(row:any){
    if(row.value.reminder_type == "0" ){
      row.controls['reminder_type'].patchValue('0')
      row.controls['start_date'].patchValue(null)
      row.controls['selected_day'].patchValue(null)
      row.controls['end_type'].patchValue('0')
      row.controls['end_date'].patchValue(null)
      row?.markAsPristine();
      row?.updateValueAndValidity();
    }
    this.chd.detectChanges()
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.feeReminderSetupF = this._fb.group({
      title: [null, [Validators.required]],
      section_ids: [null, [Validators.required]],
      class_ids: [null, [Validators.required]],
      batch_ids: [null, [Validators.required]],
      student_status: ['1', [Validators.required]],
      category_ids: [null, [Validators.required]],
      categories_data: this._fb.array([]),
      send_notifaction: [true],
      send_sms: [false],
      send_whatsapp: [false],
      send_sms_student: [false],
      send_sms_father: [false],
      send_sms_mother: [false],
      send_whatsapp_student: [false],
      send_whatsapp_father: [false],
      send_whatsapp_mother: [false],
      status: ['1']
    });
    this.tableRows.controls.forEach((row) => {
      const formGrop = row as FormGroup;
      formGrop.patchValue({ multiSelectSettings: { appendTo: 'body' } });
    });
  }

  loadExistingData() {
    this.isPageLoading = true;
    this.feeService.getAutoFeeReminderById(this.hasSetupId).subscribe((res: any) => {
      if(res?.status){
        const dataToPatch = res?.data?.data?.payload
        const checkDataLoaded = setInterval(() => {
          if (this.classList?.length > 0 && this.batchList?.length > 0 && this.sectionList?.length > 0) {
            this.feeReminderSetupF.patchValue({
              ...dataToPatch,
              section_ids: dataToPatch.section_ids?.map(id => this.sectionList?.find(s => s.id == id)),
              class_ids: dataToPatch.class_ids?.map(id => 
                this.classList?.find(c => c.id == id)
              ),
              batch_ids: dataToPatch.batch_ids?.map(id => 
                this.batchList?.find(b => b.id == id)
              ),
            });

            const classArr = dataToPatch.class_ids?.map((id:any)=> this.classList?.find((classObj:any)=>classObj.id == id ).course_id )
            this.getFeeCategoryList(classArr, dataToPatch.category_ids )

            this.updateTableRows(dataToPatch.categories_data);
            this.isPageLoading = false;
            clearInterval(checkDataLoaded);
          }
        }, 100);
      }
    },
    (error: any) => {
      this.isPageLoading = false;
      this.toastr.showError(error?.error?.message ?? error?.message ?? 'Something went wrong');
    })
  }

  updateTableRows(categoriesData: any) {
    const tableArray = this.tableRows;

    tableArray.controls = tableArray.controls.filter(row => 
        categoriesData.some(item => item.month === row.value.month)
    );

    categoriesData.forEach(item => {
      const existingRow = tableArray.controls.find(row => row.value.month === item.month);
      if (existingRow) {
        existingRow.patchValue({
          // category_id: existingRow.get('category_id')?.value?.filter(cat => item.categoryList.some(c => c.id === cat.id)),
          category_id: item.categoryList,
          categoryList: item.categoryList
        }, { emitEvent: false });
        existingRow?.markAsPristine();
      } else {
        tableArray.push(this.createRow(item));
      }
    });
    this.feeReminderSetupF.setControl('categories_data', tableArray);
  }

  createRow(category?: any) {
    const formGroup = this._fb.group({
      month: [category?.month ?? null],
      category_id: [category?.category_id?.map(id => category?.categoryList?.find(c => c.id === id)) ?? category.categoryList, [Validators.required]],
      start_date: [category?.start_date ?? null],
      reminder_type: [category?.reminder_type ?? "0"],
      selected_day: [category?.selected_day ?? null],
      end_type: [category?.end_type ?? "0"],
      end_date: [category?.end_date ?? null],
      remaining_fees_amount: [category?.remaining_fees_amount ?? 0],
      categoryList: [category?.categoryList]
    });
  
    // Subscribe to changes in reminder_type
    formGroup.get('reminder_type')?.valueChanges.subscribe((reminderType) => {
      const selectedDayCtrl = formGroup.get('selected_day');
      if (reminderType === '2') {
        selectedDayCtrl?.setValidators([Validators.required]);
      } else if (reminderType === '3') {
        selectedDayCtrl?.setValidators([
          Validators.required,
          ClassCareValidatores.min(1, "Value must be between 1-31"),
          ClassCareValidatores.max(31, "Value must be between 1-31"),
          ClassCareValidatores.pattern('^0*[1-9][0-9]*$', "Only positive non-decimal numbers are allowed")
        ]);
      } else {
        selectedDayCtrl?.clearValidators();
      }
      selectedDayCtrl?.updateValueAndValidity();
  
      // Clear start_date if reminder_type is '0'
      if (reminderType === '0') {
        formGroup.get('start_date')?.clearValidators();
        formGroup.get('start_date')?.updateValueAndValidity();
      }else {
        formGroup.get('start_date')?.setValidators([Validators.required]);
        formGroup.get('start_date')?.updateValueAndValidity();
      }
    });
  
    // Subscribe to changes in end_type
    formGroup.get('end_type')?.valueChanges.subscribe((endType) => {
      const endDateCtrl = formGroup.get('end_date');
      if (endType === '1') {
        endDateCtrl?.setValidators([Validators.required]);
      } else {
        endDateCtrl?.clearValidators();
      }
      endDateCtrl?.updateValueAndValidity();
    });
  
    return formGroup;
  }

  getSectionList(){
    this.batchService.getUserWiseSectionList({ user_id: this.user_id }).subscribe((res: any) => {
      if(res?.status){
        this.sectionList = res?.data;
        if(this.hasSetupId) {
          this.getClassList();
        }
      }
    })
  }

  getClassList(){
    const payload = {
      user_id: this.user_id,
      section: this.getID(this.feeReminderSetupF?.value?.section_ids) ?? null
    };
    this.homeWorkService.getClassByMultipleSection(payload).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
        if(this.hasSetupId){
          this.getBatchList();
        }
      }
    })
  }

  getBatchList(){
    const payload = {
      classes: this.getID(this.feeReminderSetupF?.value?.class_ids) ?? null
    };
    this.homeWorkService.getBatchOnClass(payload).subscribe((res: any) => {
      if (res?.status) {
        this.batchList = res.data;
      }
    })
  }

  getFeeCategoryList(courseArr:any[]=[], patchArr:any[]=[]){

    const payload = {
      module_name: 1 ,
      course_id : courseArr?.length > 0 ? courseArr : this.feeReminderSetupF.value.class_ids?.map((classObj:any)=> this.classList?.find((classList:any)=> classList.id == classObj.id).course_id )
    }

    this.feeService.getFeesCategoryList(payload).subscribe((res: any) => {
      if(res?.status){
        this.feeCategoryList = res?.data;
        if(patchArr){
          this.feeReminderSetupF.controls['category_ids'].patchValue(patchArr)
        }
      }
    })
  }

  getID(obj:any){
    if(!obj || obj?.length ==0 ){
      return
    }
    const ids = obj?.map(obj => obj.id) ?? []
    return ids
  }
	
  //#endregion Private methods
}