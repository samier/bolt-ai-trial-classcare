import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { StudentManagementService } from '../student-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DataTableDirective } from 'angular-datatables';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';
import { CommonService } from 'src/app/core/services/common.service';
import * as moment from 'moment';
import {StudentService} from 'src/app/modules/student/student.service';
import columns from 'src/app/modules/report/student-report/student.service';

@Component({
  selector: 'app-student-report',
  templateUrl: './student-bulk-edit.component.html',
  styleUrls: ['./student-bulk-edit.component.scss'],
})
export class StudentBulkEditComponent {
  constructor(
    private StudentManagementService: StudentManagementService,
    private toastr: Toastr,
    public CommonService: CommonService,
    public studentService: StudentService
    ) {}

    dtOptions: DataTables.Settings = {};
    dtOptionsForCategory: DataTables.Settings = {};
    dtOptionsForGender: DataTables.Settings = {};
    dtOptionsForActiveStatus: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
    datatableElementCategory: DataTableDirective | null = null;
    datatableElementGender: DataTableDirective | null = null;
    datatableElemenActiveStatus: DataTableDirective | null = null;
    columns:any = [];
    URLConstants = URLConstants;
    download_format: string = '';
    report_type=1;
    dtRendered=false;
    dtRendered2=true;
    dropdownList:any = [];
    selectedItems:any = [];
    commonDropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      // limitSelection:6,
    };  
  
    tbody:any;
    editable:any;
    sections = [];
    classes = [];
    batches = [];
    student_status = [
      { id: '', name: 'All' },
      { id: '1', name: 'Active' },
      { id: '0', name: 'InActive' }
    ];
    //student_field_list: = [{ id: '', name: 'All' }];
    student_field_list: any = [];
    list:any = [];
    field_list:any=[];
    selectedStudentField: any = [];  
    params = {
      class: null,
      batch: null,
      status: null,
      admission_start_date: null,
      admission_end_date: null,
      student_field:[],    
    };

    section = null;
    validationError:any;
    errorArray:any = [];
    previousSchoolCategory:any = [];
    type_of_school:any = [];
    admission_years:any = [];
    statusList = [
      { id : "", name : "All" },
      { id : 1 , name : "Active" },
      { id : 0 , name : "InActive" },
    ]
    oldSchool:any;
    selectedOption: 'Old' | 'New' | null = null;
    ngOnInit(): void {
      
      this.getSectionsAndClasses()
      this.StudentManagementService.getStudentTableAllFieldList().subscribe((res: any) => {
        let unwantedFields = ['class_id','academic_year_id', 'copy_from_id', 'custom_field_data', 'class_name', 'Age', 'batch_name', 'image','age','siblingInfo','unique_id','gr_number','leaving_date','fatherImage','motherImage','progress','conduct','token','device_token','lc_status','lc_type','lc_book_no','working_days_school','reason_leaving_school','result_last_examination','lc_remark','lc_generated_by_id','lc_generated_date_time','lc_generated_academic_year_id', 'send_sms_number','hometown','reference','residential_area','college_area','ssc','hsc','payOnDate','othernumber','is_delete','currently_active','username']
        if(['dholakiyaschools.org','newtest.classcare.in'].includes(window.location.hostname)){
          unwantedFields = [...unwantedFields,...['create_at','bankname','branchifsc','accountnumber','ifsccode','cast']];
        }
        let object = res?.data;
        this.columns = this.CommonService.flipObject(res?.data);
        for(const key in object){
          if(unwantedFields.includes(object[key])){
            delete object[key]
          }
          else{
            this.dropdownList.push({ id: object[key], name: key });
          }
          
        }
        this.list = res?.data;
      });    
      this.setDatatable();     
      this.getOldSchoolName();
    }

    getOldSchoolName(){
      this.studentService.getOldSchoolName().subscribe((res:any)=>{ 
        this.oldSchool = res?.data
      })
    }

    getSectionsAndClasses(){
      this.classes = [];
      this.params.class = null;
      this.batches = [];
      this.params.batch = null;
      this.params.status = null;
      this.StudentManagementService.getClassList({section : this.section}).subscribe((res: any) => {
        if (res.status) {
          this.sections = res.data.sections 
          this.classes = res.data.classes;
        }
      });
    }
  
  field_list_for_html=[];  
  default_list=[ 
    { data: 'id' },       
    { data: 'class_name' },     
    { data: 'batch_name' },  
    { data: 'address' },
    { data: 'school' }, 
    { data: 'date_of_birth' },  
    { data: 'email' },
    { data: 'gender' }, 
    { data: 'first_name' }, 
    { data: 'middle_name' },
    { data: 'last_name' }, 
    { data: 'create_at' }, 
    { data: 'rollno' },
    { data: 'username' }, 
    { data: 'password' }, 
    { data: 'phone_number' },
    { data: 'payOnDate' }, 
    { data: 'categories' }, 
    { data: 'percentage' },
    { data: 'bankname' }, 
    { data: 'branchifsc' }, 
    { data: 'adharcard' },
    { data: 'apaar_id'},
    { data: 'othernumber' }, 
    { data: 'accountnumber' }, 
    { data: 'ifsccode' },
    { data: 'hall_ticket_SID_number'},
    { data: 'gr_number' }, 
    { data: 'mother_name' }, 
    { data: 'residential_area' },
    { data: 'hometown' }, 
    { data: 'college_area' }, 
    { data: 'reference' },
    { data: 'ssc' }, 
    { data: 'hsc' }, 
    { data: 'rightToEducation' },
    { data: 'old_new' },
    { data: 'father_name' },
    { data: 'mother_occupation' }, 
    { data: 'father_occupation' }, 
    { data: 'father_number' },
    { data: 'mother_number' }, 
    { data: 'send_sms_number' }, 
    { data: 'status' },
    { data: 'uidNo' },
    { data: 'studentWhatsappNo' }, 
    { data: 'bloodGroup' },
    { data: 'birthPlace' }, 
    { data: 'religion' }, 
    { data: 'nationality' }, 
    { data: 'parentWhatsappNo' },
    { data: 'parentEmail' }, 
    { data: 'permanentAddress' },
    { data: 'sameAddress' }, 
    { data: 'currentCity' }, 
    { data: 'siblingInfo' },
    { data: 'leaving_date' },
    { data: 'progress' }, 
    { data: 'conduct' },
    { data: 'working_days_school' }, 
    { data: 'reason_leaving_school' }, 
    { data: 'result_last_examination' },
    { data: 'age' },
    { data: 'permanentCity' },
  ];
    setDatatable(fields:any=null){
     
    if(fields==null){
      fields=this.default_list;
    }
    this.field_list_for_html=fields;
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: fields.map((field: any) => ({
          data: field.data,
          orderable: !['old_new', 'student_fees_date', 'rightToEducation'].includes(field.data),
        })),
      };     
    }
  
    onItemSelect(item: any) {
      this.dtRendered=false;
      this.dtRendered2=false;
      let data_array:any=[{"data": 'rollno'}, {"data": 'full_name'}];
      let data_array2:any=[];
      
      this.selectedItems.forEach(function(value:any){
        data_array.push({"data":value.id});
        data_array2.push(value.id);
      });
  
      this.field_list=data_array2;
  
      this.setDatatable(data_array);
      setTimeout(() => {
        this.dtRendered=true;
      }, 100);
      this.params.student_field = data_array2;
      // this.tbody = [];
      // this.reloadData();
      //this.field_list_for_html=this.selectedItems;
    }
    onSelectAll(items: any) {
      setTimeout(()=>{
        this.onItemSelect(items);
      },100);
    }
  
    onItemDeSelect(item:any){
      this.dtRendered=false;
      this.dtRendered2=false;
      let data_array:any=[{"data": 'rollno'}, {"data": 'full_name'}];
      let data_array2:any=[];
      this.selectedItems.forEach(function(value:any){
        data_array.push({"data":value.id});
        data_array2.push(value.id);
      });
  
      this.field_list=data_array2;
      if(data_array2.length > 0){
      this.setDatatable(data_array);
      setTimeout(() => {
        this.dtRendered=true;
      }, 100);
      this.params.student_field = data_array2;
      // this.reloadData();
     }else{
      this.dtRendered2=true;
      this.setDatatable(null);
     }
      
    }
  
    onDeSelectAll() {
      this.params.student_field = [];
      this.reloadData();
    }
  
    setUrl(url: string) {
      return '/' + window.localStorage.getItem('branch') + '/' + url;
    }
  
    loadData(dataTablesParameters?: any, callback?: any) {
      dataTablesParameters = {
        ...dataTablesParameters,
        ...this.params,
      };
      this.StudentManagementService.generateStudentGrReport(
        dataTablesParameters
      ).subscribe((resp: any) => {
        this.tbody = resp?.data?.record?.original?.data;
        this.editable = resp?.data?.record?.original?.data.map((item:any) => ({ 
          ...item, 
          categories: this.getCategoryId(item.categories), 
          gender : this.getGender(item.gender) ,
          send_sms_number : this.getSmsNumber(item.send_sms_number),
          parentWhatsappNo: this.getWaNumber(item.parentWhatsappNo),
          old_new : item.old_new == 'New' ? 1 : 0,
          rightToEducation : item.rightToEducation == 'Yes' ? 1 : 0,
          address : this.decodeString(item.address),
          permanentAddress : this.decodeString(item.permanentAddress),
          leaving_date : item.leaving_date ? this.changeDateFormat(item.leaving_date) : null,
          student_fees_date : item.student_fees_date ? this.changeDateFormat(item.student_fees_date) : null,
          admission_date : item.admission_date ? this.changeDateFormat(item.admission_date) : null,
          payOnDate : item.payOnDate ? this.changeDateFormat(item.payOnDate) : null,
          date_of_birth : item.date_of_birth ? this.changeDateFormat(item.date_of_birth) : null
        }));

        this.list = resp?.data?.studentField;
        this.previousSchoolCategory = resp.data?.previous_school_category ?? [];
        this.type_of_school = resp.data?.type_of_school ?? [];
        this.admission_years = resp.data?.admission_year ?? [];
        
        callback({
          recordsTotal: resp?.data?.record?.original?.recordsTotal,
          recordsFiltered: resp?.data?.record?.original?.recordsFiltered,
          data: [],
        }); 
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      });
    }

    decodeString(string:any) {
      const txt = document.createElement('textarea');
      txt.innerHTML = string;
      return txt.value;
    }
    
    changeDateFormat(dateString: any, format:any = 'yyyy-MM-DD') {
      try {
          const parsedDate = moment(dateString,'DD-MM-yyyy');
          return parsedDate.format(format);
      } catch (error) {
          return;
      }
    }
  
    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }
  
    fromDateChange(e:any){
      this.params.admission_start_date = e.target.value;
      this.reloadData();
    }
  
    toDateChange(e:any){
      this.params.admission_end_date = e.target.value;
      this.reloadData();
    }
  
    classChange() {
      this.StudentManagementService.getBatchesByClass(this.params.class).subscribe(
        (res: any) => {
          this.dtRendered = false;
          this.params.batch = null;
          this.params.status = null;
          this.batches = [];
          this.batches = this.batches.concat(res.data);
          this.field_list_for_html = [];
          this.tbody = [];
          this.selectedItems = [];
        }
      );
      this.reloadData();
    }
  
    student_field_array:any = [];
    onStudentFieldSelect() {
      this.params.student_field = this.selectedStudentField;
      this.reloadData();
    }
    onStudentFieldSelectAll() {
      this.params.student_field = [];
      this.params.student_field = this.student_field_list;
      this.reloadData();
    }
    onStudentFieldDeSelectAll() {
      this.params.student_field = [];
      this.reloadData();
    }

  
    indexOffun(item:any){
      return this.field_list.indexOf(item);
    }

    editRecord(){
      this.editable = this.editable.map((x:any) => {
        const obj:any = {}
        for (const key of this.field_list) {
          obj['id'] = x['id'],
          obj['class_id'] = x['class_id'],
          obj['batch_id'] = this.params.batch,
          obj['branch_id'] = x['branch_id'],
          obj[key] = x[key];
        }
        return obj;
      });  
      let data = {
        students : this.editable,
        fields: this.field_list
      }
      this.StudentManagementService.studentBulkEdit(data).subscribe((resp:any) => {
        if(resp.status){
          this.errorArray = [];
          this.reloadData()
          this.toastr.showSuccess(resp.message) 
        }else{
          this.toastr.showError(resp.message) 
          this.validationError = resp.data
          this.errorArray = [];

          for (const key in this.validationError) {
            const parts = key.split('.');
            const studentIndex = parseInt(parts[1]);
            const errorType = parts[2];
            const errorMessage = this.validationError[key][0];
            
            if (!this.errorArray[studentIndex]) {
                this.errorArray[studentIndex] = {};
            }
            
            this.errorArray[studentIndex][errorType] = errorMessage;
        }
        }
      },
      (error: any) => {
        this.toastr.showError(error?.error?.message ?? error?.message)
      });
      
    }

    replaceString(string:any){
      if(string == 'bankname'){
        return 'Bank name';
      }
      else if( string == 'branchifsc'){
        return 'Branch IFSC'
      }
      else if( string == 'accountnumber'){
        return 'Account Number'
      }
      else if( string == 'ifsccode'){
        return 'IFSC code'
      }
      else if (string == 'adharcard'){
        return 'Adhar Card'
      }
      else if (string == 'studentId'){
        return 'Gr number / Student id'
      }
      let value = string.replaceAll('_', ' ', string)
      let name = value.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      return this.capitalizeFirstLetter(name)
    }

    capitalizeFirstLetter(str:any) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getCategoryId(value:any){
      switch (value) {
        case 'Open':
          return 1;
        case 'OBC':
          return 2;
        case 'SC':
          return 3;
        case 'ST':
          return 4;  
        case 'S.E.B.C':
          return 5;
        case 'LAGUMATI':
          return 6;
        case 'Bhill':
          return 7;
        case 'Other':
          return 8;
        default:
          return "";
      }
    }

    getGender(value:any){
      switch (value) {
        case 'Male':
          return 'm';
        case 'Female':
          return 'f';
        case 'Other':
          return 'o';
        default:
          return "";
      }
    }

    getSmsNumber(value:any){
      switch (value) {
        case 'Father Number':
          return 1;
        case 'Mother Number':
          return 2;
        default:
          return "";
      }
    }

    getWaNumber(value:any){
      switch (value) {
        case 'Father Number':
          return 1;
        case 'Mother Number':
          return 2;
        default:
          return "";
      }
    }

    onRadioChange(option: 'Old' | 'New') {
      this.selectedOption = option;
      this.editable.forEach(element => {
        if(element){
          element.old_new = option == 'Old' ? 0 : 1,
          element['Old or New'] = option
        }
      });
    }

    onDateChange(selectedDate: any){
      this.editable.forEach(element => {
        if(element){
          element.student_fees_date = selectedDate
        }
      });
    }

    clearDate(isHeader:boolean , event :any , index?:any, field?:any) {

      if(isHeader){
        this.editable.forEach(element => {
          if(element){
            element.student_fees_date = event
          }
        });
      }else{
        this.editable[index][field] = event
      }
    }
}
