import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeesService } from '../fees.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { fileIcons } from 'src/app/common-config/static-value';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';

@Component({
  selector: 'app-optional-fees',
  templateUrl: './optional-fees.component.html',
  styleUrls: ['./optional-fees.component.scss']
})
export class OptionalFeesComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private FeesService: FeesService,
      private toastr: Toastr,
      private modalService: NgbModal,
      public CommonService: CommonService,
      public activatedRouteService: ActivatedRoute,
      private leaveManagementSerivce:LeaveManagmentService,
    ) {}
    public isSchool:any = ('; '+document.cookie)?.split(`; ISSCHOOL=`)?.pop()?.split(';')[0];
    sections = [{ id: '', name: 'All' }];
    schools:any = [{ id: '', name: 'All' }];
    classes: any = [];
    batches: any = [];
    students:any = [];
    optionalFees:any = [];
    selectedBatches: any = [];
    selectedClasses: any = [];  
    modelAttachments:any = [];
    fileIcons:any = fileIcons
    isOpenByClick: boolean = true

    total_amount:any = 0;

    params:any = {
      section: null,
      school: null,
      class: null,
      batch: null,
      students: [],
      optional_fees: null,
      optional_fees_amount: null,
      start_date: null,
      end_date: null,
      reason: null,
      attachments: [],
    };

    updateParams:any = {
      optional_fees_amount: null,
      start_date: null,
      end_date: null,
      reason: null,
      attachments: [{
        attachment_name : null,
        attachment : null
      }],
    }

    validationError:any = [];
    updateValidationError:any = [];
    dropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'full_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      allowSearchFilter: true,
    };
    acedemicYear:any = localStorage.getItem('acedemicYear');
    unique_id:any;
    student_detail:any;
  
    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.getAcademicYear()
      this.unique_id = this.activatedRouteService.snapshot.paramMap.get('unique_id') || null
      if(this.unique_id){
        this.leaveManagementSerivce.getStudentProfileDetail(this.unique_id).subscribe((resp:any) => {
            this.student_detail = resp
            this.params.class = this.student_detail.class_id
            this.params.students = [{id: this.student_detail.id, full_name: this.student_detail.full_name}]
            this.params.student_id  = this.student_detail.id
            this.getOptionalFeesList();
        });
      }else{
        this.FeesService.getSchoolList().subscribe((res: any) => {
          if (res.status) {
            this.schools = this.schools.concat(res.data);
          }
        });
    
        this.FeesService.getSectionList(this.sections).subscribe((res: any) => {
          if (res.status) {
            this.sections = this.sections.concat(res.data);
          }
        });
        
        this.FeesService.getClasses(this.params.section).subscribe((res: any) => {
          if (res.status) {
            this.classes = res.data;
          }
        });
      }

      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 50,
        lengthMenu : [50,100,200],
        serverSide: true,
        processing: true,
        searching: true,
        // scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          { data: 'student_name' },
          { data: 'class', name: 'student.batch_detail.class.name' },
          { data: 'batch', name: 'student.batch_detail.name' },
          { data: 'category_fees', name: 'category_fee.type_name' },
          { data: 'optional_fees' },
          { data: 'start_date' },
          { data: 'end_date' },
          { data: 'detail',orderable:false,searchable:false, },
          { data: 'action', orderable: false, searchable: false },
        ],
      };
    }
  
  
    loadData(dataTablesParameters?: any, callback?: any) {
      dataTablesParameters = {...dataTablesParameters, unique_id: this.unique_id ?? null}
      this.FeesService.getAssignedFeesStudent(dataTablesParameters).subscribe(
        (resp: any) => {
          this.tbody = resp.data;
          callback ? callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          }) : null;
        }
      );
    }
  
    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }

    getAcademicYear(){
      this.FeesService.getAcademicYear().then((resp:any) => {
        this.acedemicYear = resp.data
        this.params.start_date = this.acedemicYear?.start_time;
      this.params.end_date = this.acedemicYear?.end_time;
      })
    }

    getSectionList(){
      this.FeesService.getSectionList({school:this.params.school}).subscribe((res: any) => {
        if (res.status) {
          this.sections = [{ id: '', name: 'All' }].concat(res.data);
        }
      });
    }  
    
    schoolChange(){
      this.params.section = null;
      this.params.class = null;
      this.params.batch = null;
      this.params.students = [];
      this.getSectionList();
      this.reloadData();
    }

    sectionChange(){
      this.params.class = null;
      this.params.batch = null;
      this.params.students = [];

      this.FeesService.getClasses(this.params.section).subscribe((res: any) => {      
        this.classes = res.data;      
        // this.onClassSelect();        
      });  
    }

    onClassSelect(){
      this.params.batch = null;
      this.params.students = [];
      this.params.optional_fees = null;
      this.params.optional_fees_amount = null;
      this.optionalFees = [];
      
        this.FeesService.getBatchesList({'classes':[this.params.class]}).subscribe((res:any)=>{
          this.batches = res.data;
          this.selectedBatches = [];
        });
        this.getOptionalFeesList();
      this.reloadData();
    }

    getOptionalFeesList(){
      this.FeesService.getOptionalFees({class_id:this.params.class}).subscribe((resp:any) => {
        if(resp.status){
          this.optionalFees = resp.data
        }
      })
    }
    
    onBatchSelect(){
      this.params.students = [];
      if(this.params.optional_fees != null){
        this.handleFeesSelect();
      }
    }

    handleStudentChange(){
      this.validationError['students'] = '';
    }

    handleFeesSelect(){
      if(!this.unique_id){
        let data = {
          class_id: this.params.class,
          batch_id: this.params.batch,
          start_date: this.params.start_date,
          category_fees_id: this.params.optional_fees
        }
        this.FeesService.getStudentList(data).subscribe((resp:any) => {
          this.students = resp.data
        })
      }
      this.validationError['optional_fees'] = '';
      let optionalFees = this.optionalFees.find((el:any) => el.id == this.params.optional_fees);
      if(optionalFees && optionalFees.course_fees.length > 0){
        this.params.optional_fees_amount = optionalFees?.course_fees?.[0]?.amount
        this.total_amount = optionalFees?.course_fees?.[0]?.amount;
        this.getCalculatedFair();
      }
      else{
        this.toastr.showError('Please add optional fees amount for this course')
        setTimeout(() => {
          this.params.optional_fees = null
          this.params.optional_fees_amount = null
          this.total_amount = null;
        }, 50);
      }
    }
  
    submit() {
      this.params.total_amount = this.total_amount
      if(this.unique_id){
        this.params.students = [{id: this.student_detail.id, full_name: this.student_detail.full_name}]
        this.params.student_id  = this.student_detail.id
      }
        this.FeesService.assignOptionalFees(this.params).subscribe(
          (resp: any) => {
            this.validationError = [];
            if (resp.status) {
              this.toastr.showSuccess(resp.message);
              this.clearForm();
              this.reloadData();
            } else {
              if(resp.data != null){
                this.validationError = resp.data
              }
              this.toastr.showError(resp.message)
            }
          }
        );
    }
  
    update(){
      this.updateParams.total_amount = this.total_amount
      this.FeesService.updateAssignOptionalFees(this.updateParams).subscribe(
        (resp: any) => {
          this.updateValidationError = [];
          if (resp.status) {
            this.modalService.dismissAll();
            this.updateParams.attachments = [{
              attachment_name : null,
              attachment : null
            }]
            this.toastr.showSuccess(resp.message);
            this.clearForm();
            this.reloadData();
          } else {
            this.toastr.showError(resp.message)
            if(resp.data != null){
              this.updateValidationError = resp.data
            }
          }
        }
      );
    }
  
    deleteOptionalFees(id: any) {
      var result = confirm('Are you sure you want delete this record?');
      if (result == true) {
        this.FeesService.deleteAssignedFeesStudent(id).subscribe(
          (resp: any) => {
            if (resp.status == true) {
              this.toastr.showSuccess(resp.message);
              this.reloadData();
            } else if(resp.status == 'warn'){
              this.toastr.showWarning(resp.message, 'WARNING');
            }
            else {
              this.toastr.showError(resp.message);
            }
          }
        );
      }
    }
  
    open(content:any, item:any) {
      this.updateValidationError = [];
      this.updateParams.id = item.id
      this.updateParams.student_name = item.student_name
      this.updateParams.student_name = item.student_name
      this.updateParams.student_id = item.student_id
      this.updateParams.category_fees_id = item.category_fees_id
      this.updateParams.optional_fees_amount = item.optional_fees
      this.updateParams.start_date = item.start_date
      this.updateParams.end_date = item.end_date
      this.updateParams.reason = item.reason
      this.FeesService.getOptionalFees({class_id:item.class_id}).subscribe((resp:any) => {
        if(resp.status){
          this.optionalFees = resp.data
          let optionalFees = this.optionalFees.find((el:any) => el.id == item.category_fees_id);
          if(optionalFees && optionalFees.course_fees.length > 0){
            this.total_amount = optionalFees?.course_fees?.[0]?.amount;
            // this.getCalculatedFair('update');
          }
          this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result
        }
      })
    }

    getCalculatedFair(type?){
      let data;
      if(type == 'update'){
        data = this.updateParams
      }else{
        data = this.params
      }
      
      if(this.total_amount == null){
        return data.optional_fees_amount = null
      }
      const AYstartTime = this.acedemicYear.start_time;
      const AYendTime = this.acedemicYear.end_time;
      const startDate = new Date(AYstartTime);
      const endDate = new Date(AYendTime);
      if(data.start_date)
        {
        if(data.start_date?.toString() == data.end_date?.toString()){
          return data.optional_fees_amount = 0
        }
          const asd = data.start_date?.toString();
          const oStartDate = new Date(asd);
          if(oStartDate < startDate || oStartDate > endDate){
            this.toastr.showError('please select start date in between academic year');
            return false;
          }
          var oEndDate = new Date(AYendTime);
          if(data.end_date)
          {
            const aed = data.end_date?.toString();
            oEndDate = new Date(aed);
            if(oEndDate < startDate || oEndDate > endDate){
              this.toastr.showError('please select end date in between academic year');
              return false;
            }
          }
            let monthArray:any = this.getMonths(AYstartTime, AYendTime, true);
  
            let transportMonthArray:any = this.getMonths(oStartDate, oEndDate, false);
  
            let amount:any = 0;
            transportMonthArray.forEach((month:any) => {
              if (monthArray.includes(month)) {
                let amt = parseFloat((this.total_amount / monthArray.length).toFixed(2));
                if(oStartDate.getDate() > 15 && oStartDate.toLocaleString('default', { month: 'long' }) == month){
                  amt = amt / 2;
                }
                if(oEndDate.getDate() <= 15 && oEndDate.toLocaleString('default', { month: 'long' }) == month){
                  amt = amt / 2;
                }
                amount = amount + amt;
              }
            });
            data.optional_fees_amount = Number(amount).toFixed(0);
      }
      return true;
    }
  
    getMonths(start_date:any, end_date:any, end_date_update:any){
      const start = new Date(start_date);
          const end = new Date(end_date);
          let months:any = [];
    
          if(end_date_update == true){
            end.setDate(1);
          }
    
          while (start <= end) {
              let month = start.toLocaleString('default', { month: 'long' });
              months.push(`${month}`);
    
              start.setMonth(start.getMonth() + 1);
          }
          return months
    }
  
    clearForm() {
      this.params.section = null;
      this.params.school = null;
      this.params.class = null;
      this.params.batch = null;
      this.params.students = [];
      this.params.optional_fees = null;
      this.params.optional_fees_amount = null;
      this.params.start_date = this.acedemicYear.start_time;
      this.params.end_date = this.acedemicYear.end_time;
      this.total_amount = null;
    }

    handleDate(type = 'create'){
      let data;
      if(type == 'update'){
        data = this.updateValidationError
      }else{
        data = this.validationError
      }
      data.start_date = null;
      data.end_date = null;
      if(this.params.start_date < this.acedemicYear.start_time){
        data.start_date = 'Start date can not be less than academic year';
      }
      if(this.params.end_date > this.acedemicYear.end_time){
        data.end_date = 'End date can not be greater than academic year';
      }

      if(type == 'create'){
        if(this.params.end_date != this.acedemicYear.end_time){
          this.addFirstAttachment();
        }
        else{
            this.params.attachments = [];
        }
      }
      this.onBatchSelect()
      this.getCalculatedFair(type)
    }

    addFirstAttachment(){
      this.params.attachments.push({attachment_name : 'Optional Fees Cancellation Form', attachment: null})
    }

    addAttachment(){
      this.params.attachments.push({attachment_name : null, attachment: null})
    }

    selectAttachment(event,item, i, type) {
      let data;
      if(type == 'update'){
        data = this.updateValidationError
      }else{
        data = this.validationError
      }
      const file = event.target.files[0]
      item.attachment = null;
      data['attachments.'+i+'.attachment'] = null;
      if (!file) return;

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes

      if (!allowedTypes.includes(file.type)) {
        data['attachments.'+i+'.attachment'] = 'Invalid file type. Allowed: jpeg, png, pdf.' ;
        event.target.value = ''; // Clear file input
        return;
      }

      if (file.size > maxSize) {
        data['attachments.'+i+'.attachment'] ='File size must be less than 1MB.';
        event.target.value = ''; // Clear file input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('Base64:', base64String);
        item.attachment = base64String
        // Optionally patch it to another form control
        // item.controls.attachmentBase64?.patchValue(base64String);
      };
      reader.readAsDataURL(file);
    }

    removeAttachment(i:any){
      this.params.attachments.splice(i, 1);
    }

    attachment(content:any, row:any){
      this.modelAttachments = row.optional_fees_attachment
      this.modalService.open(content,{
        size: 'lg',
        centered: true
      }).result.then((result) => {
      },(reason:any) => {
      });
    }
  
    closeModal() {
      this.modalService.dismissAll();
    }

    deleteAttachment(attachment_id:any){
      let confirm = window.confirm('Are you sure you want to delete this attachment');
      if(confirm){
        this.FeesService.deleteAssignedFeesAttachment(attachment_id).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.modelAttachments = resp.data
            this.reloadData();
          }else{
            this.toastr.showError(resp.message)
          }
        })
      }
    }
  
}
