import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from "../../report/report.service";
import { FeesService } from "src/app/modules/fees/fees.service";
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-student-bulk-discount',
  templateUrl: './student-bulk-discount.component.html',
  styleUrls: ['./student-bulk-discount.component.scss']
})
export class studentBulkDiscountComponent implements OnInit {
  //#region Public | Private Variables
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  tbody: any;
  sectionList: any = [];
  generating:any = false;
  loading:any = false;
  updateLoading:any = false;
  filter:any = true;
  allChecked:any = false;
  classes: any = [];
  batches: any = [];
  dtTrigger:boolean = false;
  fees_types:any = [];
  months:any = [];
  filterCount: any = 0;
  permissions: any;

  error_message:any = null
  // formGroup!:FormGroup
  form: FormGroup | any;
  updateForm: FormGroup | any;

  discount_types:any = [
    {id: 'amount', name: '₹'},
    {id: 'percentage', name: '%'}
  ]

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public CommonService: CommonService,
    private reportService: ReportService,
    private formBuilder: FormBuilder,
    private feesService:FeesService,
    private toaster:Toastr,
    private router: Router,
  ) {  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.initForm();
    this.countFilters();
    this.initDatatable();
    this.getSectionList();
    this.getFeesCategory();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  initDatatable(){

    this.dtOptions = {
      paging: false,
      searching: true,
      lengthChange: true,
      ordering: true,
      destroy: true,
      order : [[3,'asc'], [4,'asc']],
      columnDefs: [
        { targets: 0, orderable: false, searchable: false },
        { targets: 8, orderable: false, searchable: false },
        { targets: 9, orderable: false, searchable: false },
      ],
    };
    this.dtTrigger = true;
  }

  initForm() {
    this.form = this.formBuilder.group({
      section: [null, [Validators.required]],
      class: [null, [Validators.required]],
      batch: [null, [Validators.required]],
      gender: ['both', [Validators.required]],
      fees_type: [null, [Validators.required]],
      month: [null],
      discount_type_amount: [0],
      discount_type: ['amount', [Validators.required]],
      remark: []
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }
  
  saveAndRedirect(){
    const selected_class = this.classes.find((item:any)=>{ return item.id == this.form.value.class }); 
    const selected_batch = this.batches.find((item:any)=>{ return item.id == this.form.value.batch }); 
    const selected_fees_type = this.fees_types.find((item:any)=>{ return item.id == this.form.value.fees_type });
    const state = {
      section : this.form.value.section,
      class : selected_class ? [selected_class] : [],
      batch : selected_batch ? [selected_batch] : [],
      gender : this.form.value.gender,
      fees_type : selected_fees_type ? [selected_fees_type] : [],
      month : this.form.value?.month ? [this.form.value?.month] : [],
    }
    sessionStorage.setItem('student-bulk-discount-state',JSON.stringify(state))
    this.router.navigate([this.setUrl(URLConstants.STUDENT_BULK_DISCOUNT)]);
  }

  preview() {
    this.countFilters();
    this.dtTrigger = false;
    const payload = {
      ...this.form.value,
      section : this.CommonService.getID(this.form.value.section) 
    }
    this.feesService.studentList(payload).subscribe((resp: any) => {
      this.tbody = resp?.data.map((item: any) => {
        if(this.form.value.discount_type_amount > 0)
        {
          if(this.form.value?.discount_type == 'amount'){
            item.discount_type_amount = Number(this.form.value.discount_type_amount || 0)
          }else{
            item.discount_type_amount = Number((item.total_fees * this.form.value.discount_type_amount) / 100)
          }
        }else{
          item.discount_type_amount = 0;
        }
        item.remark = this.form.value?.remark;
        this.handleDiscountAmount(item); 
        item.selected = true;
        return item;
      });
      this.allChecked = true;
      this.initDatatable();
    });
  }

  countFilters(){
    this.filterCount = 0;
    Object.keys(this.form.value).forEach((item:any)=>{
      if(this.form.value[item] != '' && this.form.value[item] != null && item != 'date'){
        this.filterCount++;
      }
    })
  }

  getSectionList() {
    this.countFilters();
    this.reportService.getSectionList({school:""}).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = res.data;
      }
    });
  }

  getClassesList(){
    this.countFilters();
    this.classes = [];
    this.batches = [];
    this.fees_types = [];
    this.months = [];
    this.form.get('class').setValue(null);
    this.form.controls['class'].markAsPristine();
    this.form.controls['class'].markAsUntouched();
    this.form.get('batch').setValue(null);
    this.form.controls['batch'].markAsPristine();
    this.form.controls['batch'].markAsUntouched();
    this.form.get('fees_type').setValue(null);
    this.form.get('month').setValue(null);
    const payload = {
      section:  this.CommonService.getID(this.form.value.section)
    };
    this.reportService.getClassByMultipleSection(payload).subscribe((res: any) => { 
      this.classes = res?.data;
    });
  }

  getBatchList(){
    this.countFilters();
    this.batches = [];
    this.fees_types = [];
    this.months = [];
    this.form.get('batch').setValue(null);
    this.form.controls['batch'].markAsPristine();
    this.form.controls['batch'].markAsUntouched();
    this.form.get('fees_type').setValue(null);
    this.form.get('month').setValue(null);
    this.getFeesCategory();
    let ids = this.form?.value?.class.map((el:any) => el.id);
    this.reportService.getBatchesList({ classes: ids }).subscribe((res: any) => {
      this.batches = res?.data;
    });
  }

  getFeesCategory(){
    this.countFilters();
    this.fees_types = [];
    this.months = []
    this.form.get('month').setValue(null);
    const payload = {
      class : this.form.value.class ? this.form.value.class.map((el:any) => el.id) : []
    }
    this.feesService.getFeesCategories(payload).subscribe((resp:any) => {
      this.fees_types = resp.data;
    })
  }

  getCategoryFeesMonths(){
    this.countFilters();
    this.months = []
    this.form.get('month').setValue(null);
    const payload = {
      class : this.form.value.class ? this.form.value.class.map((el:any) => el.id) : [],
      fees_type : this.form.value.fees_type ? [this.form.value.fees_type] : []
    }
    this.feesService.getFeesCategoryMonths(payload).subscribe((resp:any) => {
      this.months = resp.data;
      if(this.months.length > 0){
        this.form.controls['month'].setValidators([Validators.required]);
        this.form.controls['month'].updateValueAndValidity();
      }else{
        this.form.controls['month'].setValidators(null);
        this.form.controls['month'].updateValueAndValidity();
      }
    })
  }

  submit(){
    const students = this.tbody.filter((item:any) => item.selected && item.discount_type_amount != 0); 
    if(students.length == 0){ 
      this.toaster.showError('Please select students to apply discount');
      return;
    }
    let hasError = false;
    students.forEach((item:any) => {
      if(item.error_message){
        this.toaster.showError(item.error_message);
        hasError = true;
        return;
      }
    });
    if (hasError) {
      return;
    }
    this.loading = true;
    this.feesService.applyStudentBulkDiscount({...this.form.value,...{discounts : students}}).subscribe((resp:any) => {
      if(resp.status){
        this.toaster.showSuccess(resp.message)
        this.saveAndRedirect();
      }else{
        this.toaster.showError(resp.message)
      }
      this.loading = false;
    },(error:any) => {
      this.toaster.showError(error.error.message || error.message)
      this.loading = false;      
    })
  }

  clearAll(){
    this.countFilters();
    this.form.reset();
    this.form.get('gender').setValue('both');
    this.form.get('discount_type').setValue('amount');
    this.tbody = [];
    this.allChecked = false;
    this.getFeesCategory();
  }

  handleSelectAll(event: any) {
    this.tbody.forEach(student => {
      student.selected = event.target.checked;
    });
  }

  handleSelect() {
    this.allChecked = this.tbody.length == this.tbody.filter(item => item.selected)?.length;
  }

  handleDiscountAmount(scf: any) {
    if(scf.discount_type_amount > scf.remaining_fees){
      scf.error_message = 'Discount amount should be less than remaining fees';
    }else if(scf.discount_type_amount < 0){
      scf.error_message = 'Discount amount should be greater than 0';
    }else{
      scf.error_message = null;
    }
  }

  //#endregion Public methods
}

