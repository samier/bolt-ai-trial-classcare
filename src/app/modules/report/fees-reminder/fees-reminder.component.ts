
import {Component, OnInit, TemplateRef, ViewChild, inject} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ReportService } from "../../report/report.service";
import { enviroment } from 'src/environments/environment.staging';
import { Toastr } from 'src/app/core/services/toastr';
import { months, studentCategoryType } from 'src/app/common-config/static-value';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import * as moment from 'moment';

@Component({
  selector: 'app-fees-reminder',
  templateUrl: './fees-reminder.component.html',
  styleUrls: ['./fees-reminder.component.scss']
})
export class FeesReminderComponent implements OnInit {

   //#region Public | Private Variables
   dtOptions: DataTables.Settings = {};
   @ViewChild(DataTableDirective, {static: false})
   datatableElement: DataTableDirective | null = null;
   filterCount: any = 0;
   
   symfonyHost = enviroment.symfonyHost;
   filter:any = true;
   allChecked:any = false;
   selectedStudentIds:any = []

   feesReminderF: FormGroup | any;
   modalForm: FormGroup | any;

    branch_id: any = window.localStorage.getItem('branch');
    user_id  : any = window.localStorage.getItem('user_id');
    currentYear_id: any = Number(
      ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
    );
    sectionList: any = []
    classList  : any = []
    batchList  : any = []

    month : any = months

    is_form : boolean = false
    is_modalShow : boolean = false
    is_generate : boolean = false

    last_date : any 
    tbody: any = [];

    is_show : boolean = false
    is_loading : boolean = false

    statusList = [
      { id : "" , name : "Both" },
      { id : 1 , name : "Active" },
      { id : 0 , name : "InActive" },
    ]
    currentDate: string;
    settings:any;
  //#endregion Public | Private Variables

  constructor(
    private ReportService: ReportService,
    private formBuilder: FormBuilder,
    private toaster:Toastr,
    public commonService: CommonService,
    public activatedRouteService: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private _modalService: NgbModal,
    private validationService: FormValidationService,
  ) { 
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.getQuarters()
    this.getSectionList()
    this.getClassesList()
    this.getBatchList()
    this.formInit()
    this.initDatatable()
  }

  getQuarters(){
    this.ReportService.quarters().subscribe((resp: any) => {
      if(resp.status){
        this.settings = resp.data;
        this.settings.months = this.settings?.months?.map((month:any)=>{
          return {
            id: month,
            name: month
          }
        })
        this.settings.categories = this.settings?.categories?.map((item:any)=>{
          return {
            id: item.id,
            name: item.type_name
          }
        })
        this.settings.categories = [...[{id:'school_fees', name:'School Fees'}],...this.settings.categories]
      }else{
        this.toaster.showError(resp?.message)
      }
    },(error)=>{
      this.toaster.showError(error?.error?.message)
    })
  }

  formInit(){
    this.feesReminderF = this.formBuilder.group({ 
      section : [ null ,Validators.required ] ,
      classes : [] ,
      batches : [] ,
      rte : [ "" ],
      status : [ "" ],
      month : [] ,
      onetime : [ true ] ,
      quarter : [] ,
      category_wise_reminder : [ false ] ,
      discount : [ false ] ,
      paid_fees : [ false ] ,
      categories : [] ,
    })

    this.modalForm = this.formBuilder.group({ 
      note : [ "PAID YOUR FEES IMMEDIATELY OTHERWISE HAVE TO PAY PENALTY" , [ Validators.required ] ] ,
      records_per_row : [ 9 ,[ Validators.required , ClassCareValidatores.min(1, "Value should be greater then 1") ,ClassCareValidatores.max(9, "Value should be less then 9" ) ] ]
    })
  }
  initDatatable(){
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu:[
        [50,100,200],
        ['Show 50 entries','Show 100 entries','Show 200 entries']
      ],
      language: {
        lengthMenu: "_MENU_"
      },
      pageLength: 50,
      serverSide: true,
      processing: false,
      searching: true,
      order: [[3, 'asc']],

      lengthChange: true,
      stateSave: true,
      // scrollX: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback)
      },
      columns: [
        {data:'id',searchable:false,orderable:false},
        {data: 'studentId' ,searchable:true,orderable:true },
        {data: 'rollno'  ,searchable:true,orderable:true },
        {data: 'full_name' ,searchable:true,orderable:true},
        // {data: 'rollno', name : 'rollno'},
        // {data: 'action', orderable: false, searchable: false},
      ]
    };
  }
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  loadData(dataTablesParameters?: any, callback?: any) {
    this.is_loading = true
    this.countFilters();

    // const payload = Object.assign({}, this.feesReminderF.value) ;
    const payload:any = JSON.parse(JSON.stringify(this.feesReminderF.value))

    if(this.feesReminderF?.value?.classes?.length > 0){
      payload.classes = this.getID(this.feesReminderF?.value?.classes)
    }
    if(this.feesReminderF?.value?.batches?.length > 0){
      payload.batches = this.getID(this.feesReminderF?.value?.batches)
    }
    if(this.feesReminderF?.value?.rte === false || this.feesReminderF?.value?.rte === true ){
      this.feesReminderF?.value?.rte ? payload.rte = 1 : payload.rte = 0  
    }
    if(this.settings?.system_setting?.is_quarter_wise_fees == 1){
      payload.month = this.commonService.getMonthsFromQuarter(this.settings?.quarters,this.feesReminderF?.value?.quarter??[])
    }else{
      payload.month = this.feesReminderF?.value?.month?.map(month=>month.name);
    }
    payload.categories = this.getID(this.feesReminderF?.value?.categories || [] )

    this.ReportService.reminderList(Object.assign(dataTablesParameters,payload)).subscribe((resp: any) => {

      this.is_form = false
      this.is_loading = false
      this.tbody = resp?.data
      
      if (this.allChecked) {
        this.selectedStudentIds = []; 
        this.tbody = this.tbody?.map(product => {
          // if (product.selected === true) {
            this.selectedStudentIds.push(product.id);
          // }
          return { ...product, selected: true , date: this.last_date };
        });
      } else {
        this.tbody = this.tbody?.map(product => ({ ...product, selected: false }));
        this.selectedStudentIds = []; 
      }

      // this.allChecked = false;
      // this.selectedStudentIds = [];

      callback({
        recordsTotal: resp?.recordsFiltered,
        recordsFiltered: resp?.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    },(error:any)=>{
      this.toaster.showError("Please Select the Section ")
      this.is_loading = false
    });
  }
  countFilters(){
    this.filterCount = 0;
    Object.keys(this.feesReminderF.value).forEach((item:any)=>{
      if((this.feesReminderF.value[item] != '' && this.feesReminderF.value[item] != null) || item == 'status'){
        this.filterCount++;
      }
    })
  }

  onFormSubmit(){
    this.is_show = true
    if(!this.feesReminderF.value.section){
      // this.is_show = false
    }
    this.is_form = true
    this.last_date = null,
    this.allChecked = false

    if (this.feesReminderF.invalid) {
      this.validationService.getFormTouchedAndValidation(this.feesReminderF)
      this.is_form = false
      return;
    }
    this.tbody = []
    this.reloadData()
  }

  onGenerate(modalName:any=null){

    if( this.tbody.length == 0 ){
      this.toaster.showError("Data not Found")
      return
    }

    if(!this.last_date){
      this.toaster.showError("Please Select the Date")
      return 
    }

    if(this.selectedStudentIds.length == 0){
      this.toaster.showError("Please Check the Checkbox")
      return 
    }

    this.is_modalShow = true
    this._modalService.open(modalName);
    this.is_modalShow = false
  }
  closeModel() {
    this.is_generate = false
    this._modalService.dismissAll()
  }
  modal_save(){
    if (this.modalForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.modalForm)
      this.toaster.showError("Invalid Notes or Records per page")
      return;
    }
    this.is_generate =true

    // let student_last_date : any = []

    let student_last_date = {};
    this.tbody.forEach(student => {
      if (student.selected) {
        // student_last_date.push({ [student.id]: student.date }); 
        student_last_date[student.id] = moment(student.date, "YYYY-MM-DD").format("DD-MM-YYYY") 
      }
    });

    const payload:any = {
      branch_id : this.branch_id,
      academic_year_id : this.currentYear_id,
      note: this.modalForm.value.note,
      records_per_page:this.modalForm.value.records_per_row,
      last_date: moment(this.last_date, "YYYY-MM-DD").format("DD-MM-YYYY") ,
      section: this.feesReminderF.value.section ,
      classes: this.getID(this.feesReminderF.value.classes ),
      batches: this.getID( this.feesReminderF.value.batches ),
      // rte: this.feesReminderF.value.rte ,
      rte: this.feesReminderF.value.rte === "" ? "" : this.feesReminderF.value.rte ? 1 : 0 ,
      status: this.feesReminderF.value.status,
      students: this.selectedStudentIds,
      student_last_date: student_last_date,
      onetime: this.feesReminderF.value?.onetime,
      paid_fees: this.feesReminderF.value?.paid_fees,
      discount: this.feesReminderF.value?.discount,
      category_wise_reminder: this.feesReminderF.value?.category_wise_reminder,
      categories: this.getID( this.feesReminderF.value.categories || [] ),
    };
    if(this.settings?.system_setting?.is_quarter_wise_fees == 1){
      payload.month = this.commonService.getMonthsFromQuarter(this.settings?.quarters,this.feesReminderF?.value?.quarter??[])
    }else{
      payload.month = this.feesReminderF?.value?.month?.map(month=>month.name);
    }

    this.ReportService.pdfGenerate(payload,'pdf').subscribe((res:any)=>{
      this.downloadFile(res, 'Fees Reminder', 'pdf' );
    },(error)=>{
      this.toaster.showError("Something went Wrong")
      this.is_generate = false
    })
    
  }
  downloadFile(res: any, file: any, format: any) {
    
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if (format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc
      a.click();
    }
    this.is_generate = false

  }

  applyHeaderDateToRows(event) {
    this.last_date = event.target.value
    this.tbody.forEach(item => {
      if(item.selected){
        item.date = this.last_date
      }
    });
  }
  onDateChange(index: number) {
    // console.log(`Date changed for row ${index}:`, this.tbody[index].date);
  }

  handleSelectAll(event: any) {
    this.selectedStudentIds = []
    const checked = event.target.checked;
    this.tbody.forEach(product => {
      product.selected = checked;
      if (checked) {
        if(product.date == null){
          product.date = this.last_date
        }
        this.selectedStudentIds.push(product.id);
      } else {
        product.date = null
        const index: number = this.selectedStudentIds.indexOf(product.id);
        if (index !== -1) {
          this.selectedStudentIds.splice(index, 1);
        }
      }
    });
  }

  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedStudentIds.push(id);
      this.updateStudentDate(id,this.last_date)
    } else {
      const index: number = this.selectedStudentIds.indexOf(id);
      if (index !== -1) {
        this.selectedStudentIds.splice(index, 1);
        this.updateStudentDate(id,null)
      }
    }
    this.allChecked = this.selectedStudentIds.length == this.tbody?.length;
  }

  updateStudentDate(id: any, newDate: any ) {
    const student = this.tbody.find(item => item.id === id);
    if (student) {
      student.date = newDate;
    }
  }

  clearAll(){
    this.feesReminderF.reset();
    this.feesReminderF.get('section').setValue(null);
    this.feesReminderF.get('classes').setValue([]);
    this.feesReminderF.get('batches').setValue([]);
    this.feesReminderF.get('rte').setValue("");
    this.feesReminderF.get('month').setValue([]);
    this.feesReminderF.get('onetime').setValue(true);
    this.feesReminderF.get('quarter').setValue([]);
    this.feesReminderF.get('category_wise_reminder').setValue(false);
    this.feesReminderF.get('categories').setValue([]);
    this.feesReminderF.get('discount').setValue(false);
    this.feesReminderF.get('paid_fees').setValue(false);
    this.tbody = []
    this.allChecked = false
    this.last_date = null
    this.reloadData();                         
  }

  handleSection(){
    this.classList = []
    this.batchList = []
    this.feesReminderF.controls['classes'].patchValue([])
    this.feesReminderF.controls['batches'].patchValue([])
    
    this.getClassesList()
  }

  handleClass(){
    this.batchList = [] 
    this.feesReminderF.controls['batches'].patchValue([])

    this.getBatchList()
  }

  getSectionList() {

    this.ReportService.getSectionList({ branch: this.branch_id }).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [...this.sectionList, ...res.data];
      }
    });

  }

  getClassesList(){

    const payload = {
      academic_year_id : this.currentYear_id ,
      branch_id        : this.branch_id ,
      user_id          : this.user_id,
      ...(this.feesReminderF?.value?.section && { section : this.feesReminderF?.value?.section || ""}) ,
    }
    this.ReportService.getClass(payload,this.user_id).subscribe((res: any) => { 
      if(res?.status){
        this.classList = res?.data;
      }
    } )
   
  }

  getBatchList(){
    const payload = {
      classes: this.getID(this.feesReminderF?.value?.classes) || []
    }
    this.ReportService.getBatchesList(payload).subscribe((res: any) => {
      this.batchList = res.data;
    });
  }

  getID(data: any) {
    if (data == null || data?.length == 0) {
      return []
    }
    return data?.map(item => item?.id)
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  setsymfonyUrl(url: string) {
    return this.symfonyHost + window.localStorage.getItem("branch") + '/' + url;
  }

  handleCategoryWiseReminder(){
    this.feesReminderF.get('categories').setValue([]);
    this.feesReminderF.get('month').setValue([]);
    this.feesReminderF.get('quarter').setValue([]);
    this.feesReminderF.get('discount').setValue(false);
    this.feesReminderF.get('paid_fees').setValue(false);
  }

}
