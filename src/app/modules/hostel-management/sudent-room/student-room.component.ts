import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { TransportService } from '../../transport-management/transport.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-student-room',
  templateUrl: './student-room.component.html',
  styleUrls: ['./student-room.component.scss']
})
export class studentRoomComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
    dropdownSettings:IDropdownSettings = {};
    tbody: any;
    constructor(
      private HostelManagementService: HostelManagementService,
      private toastr: Toastr,
      private modalService: NgbModal,
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      public CommonService: CommonService,
      private transportService: TransportService,
      public  dateFormateService : DateFormatService,
    ) {}
    selectedItems: any = [];
    sectionList:any = []
    section_id = null;
    classList:any = []
    class_id = null
    batchList = []
    batch_id = null
    StudentList = []
    student_id = null
    room_id = null;
    allotment_date = new Date().toISOString().split('T')[0];
    left_date:any = null;
    reason:any = null;
    amount:any = null;
    total_amount:any = null
    attachments:any = [{
      attachment_name: 'Hostel Cancellation Form',
      attachment: null
    }];

    modelAttachments:any = [];
    modalReason:any;
    fileIcons:any = {
      "pdf" : './assets/img/files/file.png',
      "png" : './assets/img/files/image.png',
      "jpg" : './assets/img/files/image.png',
      "jpeg" : './assets/img/files/image.png',
      "gif" : './assets/img/files/image.png',
      "webp" : './assets/img/files/image.png',
    };

    roomDetails:any = null;
    hostelFeesDetails:any = null;

    selectedMonth:any
    selectedDiscountMonth:any
    RoomRentMonth:any = []
    feesReceipt:any = [];
    applicable_fees = 'new'

    feesDetail:any = null;

    form:any = {
      hostel_fee_id: null,
      payment_date : new Date().toISOString().substring(0,10),
      receipt_no : null,
      monthly_fees : [],
      discount_monthly_fees: [],
      payment_mode : 0,
      cheque_no: null,
      cheque_date: null,
      bank_name: null,
      account_number: null,
      account_holder_name: null,
      upi_id: null,
      transaction_id: null,
    }

    updateForm:any = {
      id: null,
      allotment_date: null,
      left_date: null,
      name: null,
      applicable_fees: null,
      room_id: null,
      reason: null,
      attachments: [{
        attachment_name: null,
        attachment: null
      }],
      amount: null
    }

    academicYear:any = null;
    errors:any = [];

    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }

    ngOnInit() {
      this.transportService.getAcademicYear().subscribe((res:any) => {
        this.academicYear = res.data;
      }); 
      this.room_id = this.activatedRouteService.snapshot.params['id'];
      this.getRoom(this.room_id);
      this.handleSectionChange();
      this.selectedItems = [];
      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        searching: true,
        scrollX: true,
        scrollCollapse: true,
        ajax: (dataTablesParameters: any, callback) => {
          this.loadData(dataTablesParameters,callback)
        },
        columns: [
          {data: 'student'},
          {data: 'class', searchable: false},
          {data: 'batch', searchable: false},
          {data: 'hostel', searchable: false},
          {data: 'room_number', searchable: false},
          {data: 'total_fees', searchable: false},
          {data: 'paid_amount', searchable: false},
          {data: 'discount_amount', searchable: false},
          {data: 'remaining_fees', searchable: false},
          {data: 'applicable_fees', searchable: false},
          {data: 'allotment_date', searchable: false},
          {data: 'left_date', searchable: false},
          {data: 'detail', searchable: false},
          {data: 'action', orderable: false, searchable: false},
        ],
      };
    }

    getRoom(room_id:any){
      this.HostelManagementService.getRoom(room_id).subscribe((resp:any) => {
        if(resp.status){
          this.roomDetails = resp.data
          this.total_amount = 0 
          this.roomDetails.room_rent.forEach((el:any) => {
            if(this.applicable_fees == 'new'){
              this.total_amount += el.new_month_wise_fees
            }else{
              this.total_amount += el.old_month_wise_fees
            }
          });
          this.getCalculatedFair()
        }
      })
    }


    getPaymentMode(value:any){
      if(value == 0){
        return 'Cheque'
      } else if (value == 1){
        return 'Cash'
      }else if(value == 2){
        return 'Card';
      }else if(value == 3){
        return 'NEFT'
      }else if(value == 4){
        return 'UPI'
      }
      else{
        return '-'
      }
    }

    getAmount(amount:any, discount_amount:any){
      let amounts = amount;
      let discount_amounts = discount_amount;
      let paid_fees = 0
      let discount_fees = 0
      amounts.forEach((am:any) => {
        paid_fees = paid_fees + parseInt(am.amount);
      })

      discount_amounts.forEach((am:any) => {
        discount_fees = discount_fees + parseInt(am.amount);
      })
      return (paid_fees - discount_fees);
    }

    loadData(dataTablesParameters?: any, callback?: any) {
      dataTablesParameters = {
        ...dataTablesParameters,
        room_id: this.room_id,
      };
      this.HostelManagementService.roomStudentList(dataTablesParameters).subscribe(
        (resp: any) => {
          this.tbody = resp.data;
          callback ? callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          }) : null;

        const uniqueCount = resp.data.reduce((acc, { student_id }) => acc.includes(student_id) ? acc : [...acc, student_id], []).length;

          this.dropdownSettings = {
            singleSelection: false,
            idField: 'id',
            textField: 'full_name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 4,
            allowSearchFilter: true,
            limitSelection: (this.roomDetails.no_of_students_per_room - uniqueCount)
          }

          setTimeout(() => {
            this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.columns.adjust();
            });
          }, 10);
        }
      );
    }

    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }

    addAttachment(type?:any){
      if(type == 'edit'){
        this.updateForm.attachments.push({
          attachment_name: null,
          attachment: null
        })
      }else{
        this.attachments.push({
          attachment_name: null,
          attachment: null
        })
      }
    }

    removeAttachment(index:any, type?:any){
      if(type == 'edit'){
        this.updateForm.attachments.splice(index, 1);
      }else{
        this.attachments.splice(index, 1);
      }
    }

    selectAttachment(event,item) {
      const file = event.target.files[0]
      item.attachment = file;
    }

    assign(){
      if(this.student_id == null){
        return this.toastr.showError('Please select student.')
      }

      let data = {
        room_id: this.room_id,
        student_id: this.student_id,
        applicable_fees: this.applicable_fees,
        allotment_date: this.allotment_date,
        left_date: this.left_date,
        reason: this.reason,
        attachments : this.attachments,
        amount: this.amount,
        total_amount:this.total_amount,
      }

      let formData = this.convertToFormData(data);
      this.HostelManagementService.assignStudentRoom(formData).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess('Room assigned.')
          this.clearForm()
          this.reloadData();
          this.applicable_fees = 'new';
          this.allotment_date = new Date().toISOString().split('T')[0];
          this.left_date = null;
        }
        else{
          this.toastr.showError(resp.data??resp.message)
        }

      })
    }

    convertToFormData(data: any, formData: FormData = new FormData(), parentKey: string = ''): FormData {
      if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
        Object.keys(data).forEach(key => {
          this.convertToFormData(
            data[key],
            formData,
            parentKey ? `${parentKey}[${key}]` : key
          );
        });
      } else {
        if (parentKey) {
          formData.append(parentKey, data === null || data == undefined ? '' : data);
        }
      }
      return formData;
    }


    attachment(content:any, row:any, type:any){
      this.modelAttachments = [];
      this.modalReason = null;
      if(type == 'attachment'){
        this.modelAttachments = row.hostel_attachments
      }
      if(type == 'reason'){
        this.modalReason = row.reason;
      }
      
      this.modalService.open(content,{
        size: 'lg',
        centered: true
      }).result.then((result) => {
      },(reason:any) => {
      });
    }

    deleteAttachment(attachment_id:any){
      let confirm = window.confirm('Are you sure you want to delete this attachment');
      if(confirm){
        this.HostelManagementService.deleteAttachment(attachment_id).subscribe((resp:any) => {
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

    submit(){
      if(this.checkFolValidation()){
        this.HostelManagementService.collectHostelFees(this.form).subscribe((resp:any)=>{
          if(resp.status){
            this.modalService.dismissAll();
            this.reloadData();
            this.clearModalForm();
            this.RoomRentMonth = [];
            // this.errors = [];
          }else{
            this.errors = resp.message
          }

        })
      }
    }

    update(){
      let formData = this.convertToFormData(this.updateForm);
      this.HostelManagementService.updateAssignStudentFees(formData).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showServerSuccess(resp.message);
          this.modalService.dismissAll();
          this.updateForm.attachments = [{
            attachment_name: null,
            attachment: null
          }]
          this.reloadData();
        }else{
          this.toastr.showError(resp.message);
        }
      })
    }

    delete(item:any){
      let confirm = window.confirm('Are you sure you want to delete this record?')
      if(confirm){
        this.HostelManagementService.deleteAssignStudent(item.id).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.reloadData();
          }else{
            this.toastr.showError(resp.message)
          }

        })
      }
    }

    calculateRemainingFees(item:any){
      return (parseFloat(item.total_fees) - (parseFloat(item.paid_amount) + parseFloat(item.discount_amount)));
    }

    handleFees(value:any){
      this.applicable_fees = value
      this.total_amount = 0 
          this.roomDetails.room_rent.forEach((el:any) => {
            if(this.applicable_fees == 'new'){
              this.total_amount += el.new_month_wise_fees
            }else{
              this.total_amount += el.old_month_wise_fees
            }
          });
          this.getCalculatedFair()
    }

    deleteFeeDetail(fees_id:any){
      let confirm = window.confirm('Are you sure you want to delete this receipt')
      if(confirm){
        this.HostelManagementService.deleteReceipt(fees_id).subscribe((resp:any) => {
          if(resp.status){
            const index = this.feesReceipt.findIndex(item => item.id === fees_id);
            let feesDetail:any = null;
            if (index >= 0 && index < this.feesReceipt.length) {
              feesDetail = this.feesReceipt[index].monthly_amount;
              this.feesReceipt.splice(index, 1);
            }
            this.RoomRentMonth.forEach(monthObj => {
              const foundMonth =  feesDetail?.find(targetMonth => targetMonth.month == monthObj.month);
              if(foundMonth){
                monthObj.disabled = false
              }
            });
            this.modalService.dismissAll();
            this.reloadData();
            this.clearModalForm();
            this.RoomRentMonth = [];
            this.errors = [];
            this.toastr.showSuccess(resp.message)
          }
        })
      }
    }

    printReceipt(fees_id:any){
      this.HostelManagementService.printReceipt(fees_id).subscribe((res:any) => {
        this.downloadFile(res, 'receipt', 'pdf');
      })
    }


    checkFolValidation(){
      if(this.form.payment_date == null || this.form.payment_date == ''){
        this.errors['payment_date'] = 'Payment date is required';
      }else{
        this.errors['payment_date'] = '';
      }

      if(this.form.receipt_no == null || this.form.receipt_no == ''){
        this.errors['receipt_no'] = 'Receipt number is required';
      }else{
        this.errors['receipt_no'] = '';
      }

      if(this.form.monthly_fees.length == 0){
        this.errors['monthly_fees'] = 'Please Select month';
      }else{
        this.errors['monthly_fees'] = '';
      }

      this.form.monthly_fees.forEach((el:any, key:any) =>{
        this.RoomRentMonth.forEach((el2:any) => {
          if(el.month == el2.month){
            if(parseInt(el.amount) > parseInt(el2.amount)){
              this.errors['monthly_fees.'+key+'.amount'] = 'Amount can not be greater then '+ el2.amount;
            }
            else{
              this.errors['monthly_fees.'+key+'.amount'] = '';
            }
          }
        })
      })


      const hasErrors = Object.values(this.errors).some(error => typeof error === 'string' && error.trim() !== '');

      if (hasErrors) {
        return false
      } else {
        return true
      }
    }

    handleSectionChange(){
      this.class_id = null
      this.batch_id = null;
      this.student_id = null;
      this.HostelManagementService.getSectionAndClass(this.section_id).subscribe(
        (resp: any) => {
          if (resp.status) {
            this.sectionList = resp.data.sections
            this.classList = resp.data.classes

          } else {
            this.toastr.showError(resp.message);
          }
        }
      );
    }

    handleClassChange(){
      this.batch_id = null;
      this.student_id = null;
      let data = {
        classes : [this.class_id],
        branchId: this.HostelManagementService.getBranch(),
      }
      this.HostelManagementService.getBatchList(data).subscribe((resp:any) => {
        if(resp.status){
          this.batchList = resp.data;
        }
      })
    }

    handleBatchChange(){
      this.student_id = null;
      if(this.class_id && this.batch_id){

        let data = {
          class_id: this.class_id,
          batch_id: this.batch_id,
          allotment_date: this.allotment_date
        };
        this.HostelManagementService.getStudentList(data).subscribe((resp:any) => {
          if(resp.status){
            this.StudentList = resp.data
          }
        })
      }
    }


    open(content:any, data:any) {
      this.feesDetail = data;
      this.updateForm.id = data.id
      this.updateForm.allotment_date = data.allotment_date
      this.updateForm.left_date = data.left_date
      this.updateForm.name = data.student
      this.updateForm.applicable_fees = data.applicable_fees
      this.updateForm.room_id = data.room_id
      this.updateForm.student_id = data.student_id
      this.updateForm.reason = data.reason
      this.updateForm.amount = data.total_fees
      if(data?.room?.room_type_id){
        this.total_amount = 0;
        this.roomDetails.room_rent.forEach((el:any) => {
          if(data.applicable_fees == 'new'){
            this.total_amount += el.new_month_wise_fees
          }else{
            this.total_amount += el.old_month_wise_fees
          }
        });

        this.getCalculatedFair('update')
      }
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg',
        windowClass: 'duplicate-modal-section',
        backdrop: true,
        backdropClass: 'duplicate-modal-backdrop' }).result.then((result) => {
        if(result == 'cancel'){
          this.clearModalForm();
          this.RoomRentMonth = [];
          this.errors = [];
          this.reloadData();
        }

      })
    }

    handleMonthRent(){
      this.form.monthly_fees.push({month: this.selectedMonth.month, amount: this.selectedMonth.amount, disabled: false})
      this.RoomRentMonth.forEach(monthObj => {
        const foundMonth =  this.form.monthly_fees?.find(targetMonth => targetMonth.month == monthObj.month);
        if(foundMonth){
          monthObj.disabled  = true;
        }
      });
    }

    handleRemoveMonth(month:any, index:any){

      //remove element from monthly fees
      this.errors['monthly_fees.'+index+'.amount'] = '';
      if (index >= 0 && index < this.form.monthly_fees.length) {
        this.form.monthly_fees.splice(index, 1);
      }
      this.RoomRentMonth.forEach(monthObj => {
        const foundMonth =  this.form.monthly_fees?.find(targetMonth => targetMonth.month == monthObj.month);
        monthObj.disabled = foundMonth ? true : false;
      });
      this.selectedMonth = this.form.monthly_fees[this.form.monthly_fees.length - 1];


      // remove element from discount monthly fees
      const indexToRemove = this.form.discount_monthly_fees.findIndex(item => item.month === month.month);
      this.handleRemoveDiscountMonth(month, indexToRemove)
    }

    handleRemoveDiscountMonth(month:any, index:any){
      this.errors['discount_monthly_fees.'+index+'.amount'] = '';
      if (index >= 0 && index < this.form.discount_monthly_fees.length) {
        this.form.discount_monthly_fees.splice(index, 1);
      }
      this.form.monthly_fees.forEach(monthObj => {
        const foundMonth =  this.form.discount_monthly_fees?.find(targetMonth => targetMonth.month == monthObj.month);
        monthObj.disabled = foundMonth ? true : false;
      });
      this.selectedDiscountMonth = this.form.discount_monthly_fees[this.form.discount_monthly_fees.length - 1];
    }

    handleMonthDiscount(){
      this.form.discount_monthly_fees.push({month: this.selectedDiscountMonth.month, amount: null, disabled: false});
      this.form.monthly_fees.forEach(monthObj => {
        const foundMonth =  this.form.discount_monthly_fees?.find(targetMonth => targetMonth.month == monthObj.month);
        monthObj.disabled = foundMonth ? true : false;
      });
    }

    handlePaymentMode(value:any){
      this.form.payment_mode = value
      if(value == 0){
        this.form.account_number = null;
        this.form.account_holder_name = null;
        this.form.upi_id = null;
        this.form.transaction_id = null;
      }else if(value == 1){
        this.form.cheque_no = null;
        this.form.cheque_date = null;
        this.form.bank_name = null;
        this.form.account_number = null;
        this.form.account_holder_name = null;
        this.form.upi_id = null;
        this.form.transaction_id = null;
      }else if(value == 2){
        this.form.cheque_no = null;
        this.form.cheque_date = null;
        this.form.bank_name = null;
        this.form.account_number = null;
        this.form.account_holder_name = null;
        this.form.upi_id = null;
      }else if(value == 3){
        this.form.cheque_no = null;
        this.form.cheque_date = null;
        this.form.bank_name = null;
        this.form.upi_id = null;
        this.form.transaction_id = null;
      }else if(value == 4){
        this.form.cheque_no = null;
        this.form.cheque_date = null;
        this.form.bank_name = null;
        this.form.account_number = null;
        this.form.account_holder_name = null;
      }
    }

    downloadFile(res: any,file: any, format:any) {
      if(this.tbody.length == 0){
        return this.toastr.showInfo('There is no records','INFO');
      }
      let fileName = file;
      let blob:Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob)
      if(format == 'pdf'){
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfSrc;
        document.body.appendChild(iframe);
        iframe.contentWindow?.print();
      }else{
        let a = document.createElement('a');
        a.download = fileName;
        a.href =  pdfSrc
        a.click();
      }
    }

    parseInt(amount:any){
      if(amount == null || amount == ''){
        return 0;
      }
      return parseInt(amount)
    }

    clearForm(){
    this.section_id = null;
    this.class_id = null
    this.batch_id = null
    this.student_id = null
    this.batchList = [];
    this.StudentList = [];
    this.reason = null;
    this.attachments = [{
      attachment_name: 'Hostel Cancellation Form',
      attachment: null
    }];
    }

    dateFormat(dateStr:any){
      const date = new Date(dateStr);
  
      // Extract the day, month, and year
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const year = date.getFullYear();
  
      // Format the date as DD-MM-YYYY
      const formattedDate = `${day}-${month}-${year}`;
      return formattedDate;
    }

    clearModalForm(){
      this.form.hostel_fee_id = null;
      this.form.payment_date  = new Date().toISOString().substring(0,10);
      this.form.receipt_no  = null;
      this.form.monthly_fees  = [];
      this.form.discount_monthly_fees = [];
      this.form.payment_mode  = 0;
      this.form.cheque_no = null;
      this.form.cheque_date = null;
      this.form.bank_name = null;
      this.form.account_number = null;
      this.form.account_holder_name = null;
      this.form.upi_id = null;
      this.form.transaction_id = null;
    }

    getCalculatedFair(type?:any,event?,name?){
      if(event && type == 'update'){
        this.updateForm[name] = event.target.value
      } else if (event) {
        this[name] = event.target.value
      }
      const AYstartTime = this.academicYear.start_time;
      const AYendTime = this.academicYear.end_time;
      const startDate = new Date(AYstartTime);
      const endDate = new Date(AYendTime);

      let allotment_date;
      let left_date;
      if(type == 'update'){
        allotment_date = new Date(this.updateForm.allotment_date);
        left_date = this.updateForm.left_date ? new Date(this.updateForm.left_date) : new Date(AYendTime);
      }else{
        allotment_date = new Date(this.allotment_date);
        left_date = this.left_date ? new Date(this.left_date) : new Date(AYendTime);
      }
      
      this.amount = 0;
      this.updateForm.amount = 0;
      let amount:any = 0;
      
      if(allotment_date.toLocaleDateString() != left_date.toLocaleDateString()){
        let monthArray:any = this.getMonths(AYstartTime, AYendTime, true);
        let transportMonthArray:any = this.getMonths(allotment_date, left_date, false);

        
        transportMonthArray.forEach((month:any) => {
          if (monthArray.includes(month)) {
            let amt = parseFloat((this.total_amount / monthArray.length).toFixed(2));
            if(allotment_date.getDate() > 15 && allotment_date.toLocaleString('default', { month: 'long' }) == month){
              amt = amt / 2;
            }
            if(left_date.getDate() <= 15 && left_date.toLocaleString('default', { month: 'long' }) == month){
              amt = amt / 2;
            }
            amount = amount + amt;
          }
        });
      }

        if(type == 'update'){
          this.updateForm.amount = Number(amount).toFixed(0);
        }else{
          this.amount = Number(amount).toFixed(0);
        }
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
}
