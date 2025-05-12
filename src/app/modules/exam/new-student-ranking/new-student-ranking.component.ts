import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ExamServiceService } from '../exam-service.service';
import { Toastr } from 'src/app/core/services/toastr';
import { BatchService } from '../../batch/batch.service';
import { HomeworkService } from '../../homework/homework.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { studentStatusForRank } from 'src/app/common-config/static-value'
 
@Component({
  selector: 'app-new-student-ranking',
  templateUrl: './new-student-ranking.component.html',
  styleUrls: ['./new-student-ranking.component.scss']
})
export class NewStudentRankingComponent implements OnInit, OnDestroy {
  
  //#region Public | Private Variables
  $destroy: Subject<void> = new Subject<void>();
  rankFilterForm: FormGroup = new FormGroup({});
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  selectedStudentIds: Set<number> = new Set();
  allChecked: boolean = false;
  tableBody: [] = [];
  isTableLoaded: boolean = false;
  type: any = 1;
  filterCount: any = 1;
  filter: boolean = false;
  sectionList : any[] = [];
  classList : any[] = [];
  batchList : any[] = [];
  examTypeList : any[] = [];
  examList : any[] = [];
  isShowLoading : boolean = false; 
  isResetLoading : boolean = false;
  isPdfLoading : boolean = false;
  isExcelLoading : boolean = false;
  user_id: any = window.localStorage.getItem('user_id');
  hasFilters: boolean = false;
  dtParams: any;
  studentStatusList = studentStatusForRank || []
  
  //#endregion Public | Private Variables

  constructor(public CommonService: CommonService, 
    private _fb: FormBuilder,
    private examService: ExamServiceService,
    private toastr : Toastr,
    private batchService : BatchService,
    private homeWorkService: HomeworkService,
    private formValidationService: FormValidationService,
  ) {}

  //#region Lifecycle hooks
  ngOnInit(): void {
    this.initForm();
    this.getSectionsList();
    this.getExamTypeList();
    this.getExamList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks

  //#region Public methods
  
  switchTab(type: any){
    this.type = type;
    this.rankFilterForm?.reset();
    this.rankFilterForm?.controls['exam_order_by'].patchValue("1");
    this.rankFilterForm?.controls['student_status'].patchValue(2);
    this.filterCount = 2;
    this.hasFilters = false;
    this.isTableLoaded = false;
    this.tableBody = [];
    if (this.type === 2) {
      this.rankFilterForm.controls['batch_id'].setValidators([Validators.required]);
    } else {
      this.rankFilterForm.controls['batch_id'].clearValidators();
    }
    if (this.datatableElement) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    this.rankFilterForm.controls['batch_id'].updateValueAndValidity();
  }

  onSectionChange(){
    this.classList = [];
    this.batchList = [];
    this.examList = [];
    this.rankFilterForm.controls['class_id'].patchValue(null);
    this.rankFilterForm.controls['batch_id'].patchValue(null);
    this.rankFilterForm.controls['exam_type_id'].patchValue(null);
    this.rankFilterForm.controls['exam_id'].patchValue(null);
    this.getClassList();
  }

  onClassChange(){
    this.batchList = [];
    this.examList = [];
    this.rankFilterForm.controls['batch_id'].patchValue(null);
    this.rankFilterForm.controls['exam_type_id'].patchValue(null);
    this.rankFilterForm.controls['exam_id'].patchValue(null);
    this.rankFilterForm.markAsPristine();
    this.type == 2 ? this.getBatchList() : '';
    this.getExamList();
  }

  onShow() {
    if(this.rankFilterForm.invalid){
      this.formValidationService.getFormTouchedAndValidation(this.rankFilterForm);
      return this.toastr.showError('Please Select Required Fields');
    }
    this.hasFilters = true;
    this.isShowLoading = true;
    if (!this.isTableLoaded) {
      this.initDataTable();
      this.isTableLoaded = true;
    } else {
      this.reloadTable();
    }
  }

  onReset(event: any){
    if(event){
      event.stopPropagation();
    }
    this.isResetLoading = true;
    this.rankFilterForm?.reset();
    this.rankFilterForm?.controls['student_status'].patchValue(2);
    this.rankFilterForm?.controls['exam_order_by'].patchValue("1");
    this.rankFilterForm?.markAsPristine();
    this.isTableLoaded = false;
    this.hasFilters = false;
    if (this.datatableElement) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
    setTimeout(() => {
      this.isResetLoading = false;
    }, 500);
    this.filterCount = this.CommonService.countFilters(this.rankFilterForm?.value)
  }

  downloadRankList(format: any){
    if(this.rankFilterForm.invalid){
      this.filter = true
      this.formValidationService.getFormTouchedAndValidation(this.rankFilterForm);
      return this.toastr.showError('Please Select Required Fields');
    }
    format == 'pdf' ? this.isPdfLoading = true : this.isExcelLoading = true;
    const payload = {
      ...this.getPayload('file'),
      ...this.dtParams
    };
    this.examService.downloadStudentRankList({...payload, format}).subscribe((res: any) => {
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.toastr.showSuccess(res?.message);
      this.CommonService.downloadFile(res, 'student-rank-list', format);
    },(error: any)=>{
      this.isPdfLoading = false
      this.isExcelLoading = false
      this.toastr.showError(error?.message ?? error?.error?.message)
    }); 
  }

  //#endregion Public methods
  
  //#region Private methods
  initForm() {
    this.rankFilterForm = this._fb.group({
      section_id: [null, [Validators.required]],
      class_id: [null, [Validators.required]],
      batch_id: [null],
      exam_type_id: [null],
      exam_id: [null],
      date: [null],
      exam_order_by: ["1"],
      student_status : [2]
    });
  }
  
  initDataTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: this.getColumns(),
      language: { 
        emptyTable: 'No data available', 
        zeroRecords: 'No matching records found'
      }
    };
    this.bindCheckboxEvents();
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    this.dtParams = dataTablesParameters;
    this.filterCount = this.CommonService.countFilters(this.rankFilterForm?.value);
    const payload = this.getPayload('table');
    this.examService.getStudentRankListByType({...payload,...dataTablesParameters}).subscribe((res: any) => {
      this.isShowLoading = false;
      this.isResetLoading = false;
      this.tableBody = res?.data ;
      this.allChecked = false;
      this.selectedStudentIds.clear();
      const selectAllCheckbox = document.getElementById('select-all') as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
      }

      callback({
        recordsTotal: res?.recordsTotal,
        recordsFiltered: res?.recordsFiltered,
        data: res?.data,
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 200);
    },
    (error: any) => {
      this.isShowLoading = false;
      this.isResetLoading = false;
      this.toastr.showError('Error occurred while fetching data');
    });
  }

  reloadTable() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  handleSelect(event: any, id: number) {
    if (event.target.checked) {
      this.selectedStudentIds.add(id);
    } else {
      this.selectedStudentIds.delete(id);
    }

    this.allChecked = this.selectedStudentIds.size === this.tableBody.length;
    const selectAllCheckbox = document.getElementById('select-all') as HTMLInputElement;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = this.allChecked;
    }
  }

  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.allChecked = checked;
    this.tableBody.forEach((row: any) => {
      row.isSelected = checked;
      if (checked) {
        this.selectedStudentIds.add(row.student_id);
      } else {
        this.selectedStudentIds.delete(row.student_id);
      }
    });

    setTimeout(() => {
      document.querySelectorAll('.row-checkbox').forEach((checkbox: any) => {
        checkbox.checked = checked;
      });
    }, 0);
  }

  bindCheckboxEvents() {
    // Select All Checkbox
    $(document).on('change', '#select-all', (event: any) => {
      this.handleSelectAll(event);
    });

    // Individual Row Checkbox
    $(document).on('change', '.row-checkbox', (event: any) => {
      const id = parseInt(event.target.getAttribute('data-id'), 10);
      this.handleSelect(event, id);
    });
  }

  getSectionsList(){
    this.batchService.getUserWiseSectionList({user_id : this.user_id}).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if(res?.status){
        this.sectionList = res?.data
      }
    })
  }

  getClassList(){
    const payload = {
      section_id: this.rankFilterForm?.value?.section_id ?? null,
      user_id: this.user_id ?? null,
    }
    this.examService.getClassFilterList(payload).subscribe((res: any) => {
      if(res.status){
        this.classList = res?.data;
      }
    })    
  }

  getBatchList(){
    const payload = {
      classes: this.rankFilterForm?.value?.class_id ? [this.rankFilterForm.value.class_id] : [],
    }
    this.homeWorkService.getBatchOnClass(payload).subscribe((res: any) => {
      if(res?.status){
        this.batchList = res?.data;
      }
    })
  }

  getExamTypeList(){
    this.examService.getExamTypeList().subscribe((res: any) => {
      if(res.status){
        this.examTypeList = res?.data;
      }
    })
  }

  getExamList(){
    const payload = {
      class_id: this.rankFilterForm?.value?.class_id,
      batch_id: this.CommonService.getID(this.rankFilterForm?.value?.batch_id),
      exam_type_id: this.CommonService.getID(this.rankFilterForm?.value?.exam_type_id),
    }
    this.examService.getFilteredExamList(payload).subscribe((res: any) => {
      if(res?.status){
        this.examList = res?.data?.map(exam => {
          return {
            ...exam,
            name: exam?.exam_name
          }
        });
      }
    })
  }

  getColumns(){
    return [
      {
        title: '<input class="m-checkbox mb-0" type="checkbox" id="select-all">',
        data: 'student_id',
        orderable: false,
        searchable: false,
        render: (row: any) => {
          return `<input type="checkbox" class="row-checkbox m-checkbox mb-0" data-id="${row}" ${row.isSelected ? 'checked' : ''}>`;
        }
      },
      { title: 'Roll No.', data: 'student_rollno' },
      {
        title: 'Photo',
        data: 'profile',
        orderable: false,
        searchable: false,
        render: (row: any) => {
          return `
            <div class="student-img-container">
              <img src="${row ? row : '/public/images/student-male.png'}" class="student-image" alt="" />
            </div>
          `;
        }
      },
      { title: 'Student Name', data: 'student_name' },
      ...(this.type === 2 ? [{ title: 'Batch', data: 'batch_name' }] : []),
      { title: 'Total Exam', data: 'total_exam' },
      { title: 'Total Mark', data: 'total_marks' },
      { title: 'Obtain Marks', data: 'total_obtain_marks' },
      { title: 'Percentage', data: 'percentage' },
      { title: 'Rank', data: 'rank' }
    ]
  }

  getPayload(payloadFor?: any){
    const startDate = this.rankFilterForm?.value?.date?.startDate;
    const endDate = this.rankFilterForm?.value?.date?.endDate;
    return {
      ...this.rankFilterForm?.value,
      exam_type_id: this.CommonService.getID(this.rankFilterForm?.value?.exam_type_id),
      batch_id: this.CommonService.getID(this.rankFilterForm?.value?.batch_id),
      exam_order_by: this.rankFilterForm?.value?.exam_order_by == '1' ? true : false ,
      exam_id: this.CommonService.getID(this.rankFilterForm?.value?.exam_id),
      type: this.type == 1 ? 'class' : this.type == 2 ? 'batch' : '',
      ...this.rankFilterForm?.value?.date && ({
        start_date: startDate?.format('DD-MM-YYYY'),
        end_date: endDate?.format('DD-MM-YYYY'),
      }),
      ...payloadFor == 'file' && {
        student_ids: Array.from(this.selectedStudentIds)
      } 
    }
  }

  //#endregion Private methods
}
