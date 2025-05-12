import { Component, OnInit, ViewChild } from '@angular/core';
import { FeesService } from '../fees.service';
import { Toastr } from 'src/app/core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteOrCancelReasonComponent } from 'src/app/modules/fees/delete-or-cancel-reason/delete-or-cancel-reason.component';
import { AttachmentsComponent } from 'src/app/modules/fees/attachments/attachments.component';
import * as moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from 'src/app/modules/student/student.service';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from 'src/environments/environment.staging';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { FeesEditHistoryComponent } from 'src/app/modules/fees/fees-edit-history/fees-edit-history.component';
import { StudentSearchComponent } from '../../common-components/student-search/student-search.component';
import { FeesConfirmationComponent } from 'src/app/modules/fees/fees-confirmation/fees-confirmation.component';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-collect-fees',
  templateUrl: './collect-fees.component.html',
  styleUrls: ['./collect-fees.component.scss']
})
export class CollectFeesComponent implements OnInit {
  fees:any;
  dropdownSettings: IDropdownSettings = {};
  discountdropdownSettings: IDropdownSettings = {};
  selectedQuarter: any;
  selectedMonths: any;
  selectedChildren:any;
  discount_for:any;
  discountFor:any;
  selectedDiscountFor: any;
  payment_mode:any;
  payment_modes:any;
  back_date_payment_modes:any
  payment_modes_list:any
  backDate:any;
  receiptModes:any;
  zero_fee_receipt_mode:any;
  card_type:any = "1";
  total_amount:any = 0;
  late_fees:any = 0;
  adjust_amount:any;
  total_bkp:any = 0;
  onetime:any = 0;
  today:any = moment(new Date()).format('YYYY-MM-DD');
  student:any;
  users:any;
  discount_by_id:any = null;
  cheque_status:any = 'clear';
  edit:any;
  studentId:any;
  nextPayOnDate:any = '';
  months:any = {
      "January" : 1,
      "February" : 2,
      "March" : 3,
      "April" : 4,
      "May" : 5,
      "June" : 6,
      "July" : 7,
      "August" : 8,
      "September" : 9,
      "October" : 10,
      "November" : 11,
      "December" : 12,
  };
  bank_name_id:any = null;
  bank_names:any = [];
  dtOptions: DataTables.Settings = {};
  @ViewChild(StudentSearchComponent) studenrSearchComponent !: StudentSearchComponent;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  fees_history:any;
  disableSave:boolean=false;
  reason:any;
  is_remarks_required:boolean=false;
  is_attachments_required:boolean=false;
  collect_fees_settings:any;
  errorMsg:any;
  is_admin = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  confimation:boolean = false;
  disableSaveForInactiveStudent:boolean = false;
  confimationInactiveStudent:boolean = false;
  all_quarters:any;
  sectionList: any = [];
  selectedSection: any = '';
  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  tomorrowDate:any = moment().add(1,'days').format('YYYY-MM-DD');

  isOpenByClick: boolean = true
  collected_cheque_detail_id:any;
  chequeList: any = [];
  cheque_no: any;
  cheque_date: any;
  remarks: any;

  constructor(
    private studentService:StudentService,
    public commonService:CommonService,
    private feeSerivce:FeesService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private toastr: Toastr,
    private leaveManagementSerivce:LeaveManagmentService,
    private router: Router,
    public activatedRouteService: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public  dateFormateService : DateFormatService
  ){
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      allowSearchFilter: true,
      enableCheckAll: true
    };
    this.discountdropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'label',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      allowSearchFilter: true,
      enableCheckAll: true
    };
  }

  URLConstants=URLConstants;
  symfonyHost = enviroment.symfonyHost;

  ngOnInit(): void {
    this.getUsers();
    this.getPermissionsList();
    this.datatable();
    this.getSectionList();
    this.studentId = this.route.snapshot.params['unique_id'];
    if(this.studentId){
      this.leaveManagementSerivce.getStudentProfileDetail(this.studentId).subscribe((resp:any) => {
        if(resp.status == false && !resp.id){
          this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
          return;
        }
        this.router.navigate([this.setUrl(URLConstants.STUDENT_COLLECT_FEES+resp.unique_id)]);
        this.student = resp;
        this.studentService.setStudent({
          id : resp.unique_id,
          // title : 'Student Profile'
        });
        this.getFeesDetails();
        this.getChequeListByStudent(this.student?.id);
      });

    }
  }

  getPermissionsList(id?:any){
    this.feeSerivce.getPermissionsList({permission:true}).subscribe((response:any) => {
      this.payment_modes = response.data?.payment_modes;
      this.payment_modes_list = response.data?.payment_modes;
      this.back_date_payment_modes = response.data?.back_date_payment_mode;
      this.receiptModes = response.data?.receipt_mode;
      this.zero_fee_receipt_mode = response.data?.zero_fee_receipt_mode;
      this.backDate = response.data?.back_date;
      this.bank_names = response.data?.bank_names;
      if(id){
        this.bank_name_id = id
      }
    });
  }

  hasAccess(mode:any,is_discount = false){
    if(is_discount && this.fees?.zero_fee_receipt && this.fees?.discount_type){
      return this.zero_fee_receipt_mode.find((item:any)=>{return item.mode == mode});
    }
    return this.receiptModes.find((item:any)=>{return item.mode == mode});
  }

  hasBackDate(payment_date:any){
    const today = new Date();
    today.setHours(5, 30, 0, 0);
    payment_date = new Date(payment_date);
    if(this.backDate == 1 || today.toString() == payment_date){
      return true;
    }
    return false;
  }

  setsymfonyUrlAdmin(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  getSectionList(){
    const data ={
      branches : this.feeSerivce.getBranch()
    }
    return this.feeSerivce.getSections(data).subscribe(
      (res: any) => {
        if(res?.status){
          this.sectionList = [{ id: '', name: 'All Section' }].concat(res?.data);
        }
      },
      (err: any) => {
        console.log(err);
      }
    )
  }

  onSectionChange(){
    if(this.studenrSearchComponent){
      this.studenrSearchComponent.clear();
    }
  }

  onChequeChange(event: any){
    this.cheque_no = event?.cheque_no; 
    this.bank_name_id = event?.bank_name_id;
    this.cheque_date = event?.cheque_date;
    this.adjust_amount = event?.cheque_amount;
    this.remarks = event?.cheque_remark;
    this.cheque_status = 'clear';
    this.totalChange();
  }

  datatable(){
    const that = this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      order: [[2, 'desc']],
      stateSave: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.COLLECT_FEES, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.commonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.COLLECT_FEES)
          let dataTableState = JSON.parse(state)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'created_at' },
        { data: 'receipt_no'},
        { data: 'payment_date' },
        { data: 'total_amount'},
        { data: 'paid_amount'},
        { data: 'discount'},
        { data: 'paymentMode.name' },
        { data: 'category.type_name'},
        { data: 'action',orderable:false,searchable:false },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{
      student_id:this.student?.id
    });
    this.feeSerivce.feesHistory(dataTablesParameters).subscribe((resp:any) => {
      this.fees_history = resp.data;

      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getUsers(){
    this.feeSerivce.getUsers().subscribe((response:any)=>{
      this.users = response.data;
    })
  }

  getPaymentModes(){
    this.feeSerivce.getPaymentModes({permission:true}).subscribe((response:any)=>{
      this.payment_modes = response.data;
    })
  }

  selectUser(userId){
    this.discount_by_id = userId;
  }

  getStudent(student:any = null){
    this.student = student;
    this.getFeesDetails();
    this.getChequeListByStudent(this.student?.id);
  }
  
  getChequeListByStudent(student_id: any){
    this.chequeList = [];
    this.feeSerivce.getChequeListByStudent({student_id:student_id}).subscribe((res:any)=>{
      if(res?.status){
        this.chequeList = res?.data?.map((item:any) => {
          return {
            ...item,
            id: item?.id,
            displayContent: item?.bank_name?.name + ' | ' + item?.cheque_no + ' | Rs. ' + item?.cheque_amount,
          }
        });
      }else{
        // this.toastr.showError(res?.message);
      }
    },(error:any)=>{
      // this.toastr.showError(error?.error?.message);
    });
  }

  getCategory(row: any,is_placeholder = false): string {
    if(is_placeholder){
      return row?.category?.type_name ?? (row.is_late_fees ? 'Late Fees' : row.month);
    }else{
      return row?.category_id ?? (row.is_late_fees ? 'late_fees' : row.month);
    }
  }

  resetForm(resetFeesDetails = false){
    const form = document.getElementById('collect-fees') as HTMLFormElement;
    form.reset();
    if(resetFeesDetails){
      this.fees = null;
    }
    this.edit = this.selectedDiscountFor = this.selectedMonths = this.selectedChildren = this.discount_for = this.discountFor = this.discount_by_id = null;
    this.total_amount = this.late_fees = this.total_bkp = 0;
    this.cheque_status = 'clear';
    this.card_type = '1';
    this.payment_modes = this.payment_modes?.filter(item=>{return !item.edit_only});
  }

  getFeesDetails(){
    this.resetForm(true);
    this.payment_mode = null;
    this.reason = null;
    this.reloadData();
    if(this.student?.id){
      const params = {
        student_id:this.student?.id
      };
      this.feeSerivce.getFeesDetails(params).subscribe((response:any)=>{
        if(response.status){
          this.fees = response.data;
          if(this.fees?.student?.status != 1 && !this.confimationInactiveStudent){
            this.confimationSwalForInactiveStudent();
          }
          this.months = response?.data?.monthIndex;
          this.all_quarters = response?.data?.quarters;
          this.fees.remaining_fees = this.setRemainingFees(this.fees.remaining_fees);
          // this.nextPayOnDate = this.fees?.nextDueDate;
          this.collect_fees_settings = this.fees?.collect_fees_settings;
          this.today = null
          setTimeout(() => {
            this.today = moment(new Date()).format('YYYY-MM-DD');
          }, 100);
          this.setDefaultTillToday();
        }else{
          this.toastr.showError(response.message);
        }
      },(error:any)=>{
          this.toastr.showError(error?.error?.message);
      });
    }
  }

  confimationSwalForInactiveStudent(){
    this.disableSaveForInactiveStudent = true;    
    Swal.fire({
      icon: 'warning',
      title: 'This student is inactive !',
      text: 'Are you certain you want to make changes to this inactive student profile ?',
      showCancelButton: true,
      confirmButtonColor: '#f28726',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.confimationInactiveStudent = true;
        this.disableSaveForInactiveStudent = false;
      }
    })
  }

  setDefaultTillToday(){
    var currentMonth = this.changeDateFormat(new Date(),'MMMM');
    if(this.fees?.collect_fees_settings?.is_quarter_wise_fees){
      currentMonth = this.fees?.quarters?.find((item:any)=> item.months.includes(currentMonth) )?.months[2];
    }
    this.selectedMonths = [];
    this.fees?.remaining_fees.some((item: any) => {
      if (this.months[item.id] > (this.months[currentMonth]??12)) {
          return true;
      }
      this.selectedMonths.push({
          id: item.id,
          name: item.name
      });
      return false;
    });
    this.selectedChildren = this.selectedMonths?.sort((a, b) => this.months[a.id] - this.months[b.id]).reduce((acc: any[], curr: any) => {
      const month = this.fees?.remaining_fees.find(month => month.id === curr.id);
      if (month) {
        acc.push(...month.children);
      }
      return acc;
    }, []);
    this.fees?.onetime?.filter((item:any)=>{
      item.paying_amount = item.remaining_amount;
    });
    this.resetQuarter();
    this.refreshDiscountFor();
    this.calculateTotalFees();
  }

  resetQuarter(){
    const selected_months = this.selectedMonths?.map(item=>item.name);
    this.selectedQuarter = this.fees?.quarters?.filter((item:any)=>{
      if(selected_months.some(month => item.months.includes(month))){
        return {id:item.id,name:item.name}
      }
      return false
    })
  }

  getMonthWiseFees(name){
    if(this.fees?.collect_fees_settings?.is_quarter_wise_fees){
      const qtr_months = this.fees?.quarters?.find(item=>item.name == name)?.months;
      return this.selectedChildren.filter(item=> qtr_months?.includes(item.month));
    }
    return this.selectedChildren.filter(item=>item.month === name);
  }

  setRemainingFees(remaining_fees:any = {},edit = false){
    const months = Object.keys(remaining_fees);
    this.fees.quarters = this.fees?.quarters?.filter(qtr => 
      qtr.months.some(month => months.includes(month))
    );
    return Object.keys(remaining_fees).sort((a, b) => this.months[a] - this.months[b]).map(month => ({ 
            id: month,
            name: month,
            children: remaining_fees[month]?.map(item => {
              if(!edit){
                item.paying_amount = Number(item.remaining_amount);
              }
              return item;
            })
          }));
  }

  onMonthSelect() {
    this.selectedChildren = this.selectedMonths?.sort((a, b) => this.months[a.id] - this.months[b.id]).reduce((acc: any[], curr: any) => {
      const month = this.fees?.remaining_fees.find(month => month.id === curr.id);
      if (month) {
        acc.push(...month.children.map((fees:any)=>{
          fees.paying_amount = fees.remaining_amount;
          return fees;
        }));
      }
      return acc;
    }, []);

    this.refreshDiscountFor();
    this.calculateTotalFees();
  }

  onQuarterSelect() {
    this.selectedMonths = [];
    const qtr_months = this.selectedQuarter.reduce((acc, qtr) => {
      const month = this.fees?.quarters.find(item => item.id === qtr.id);
      return acc.concat(month.months);
    }, []);
    qtr_months.forEach(qtr_month=>{
      const month = this.fees?.remaining_fees.find(month => month.id === qtr_month);
      if(month){
        this.selectedMonths.push({id:qtr_month,name:qtr_month});
      }
    })
    this.onMonthSelect();
  }

  refreshDiscountFor(edit = false){
    this.discountFor = this.selectedDiscountFor = [];
    this.discount_for = this.selectedChildren?.filter((item: any) => {
      item.label = item.month+' '+(item.is_late_fees ? "Late Fees" : (item?.category?.type_name??""));
      // item.max_discount = item.remaining_amount - item.paying_amount;
      item.max_discount = item.paying_amount;
      if(!edit){
        item.added_discount = item.remaining_discount || 0;
      }
      if(item.max_discount > 0){
        if(this.fees.discount_type == 1){
          if(item.is_late_fees){
            return item;
          }
        }else{
          return item;
        }
      }
    });
    if(this.fees.discount_type == 0)
    {
      this.fees?.onetime?.filter((item:any)=>{
        if(item.paying_amount > 0){
          item.label = item?.category?.type_name??"";
          item.max_discount = item.paying_amount;
          if(!edit){
            item.added_discount = item.remaining_discount || 0;
          }
          this.discount_for.push(item);
        }
      });
      this.selectedDiscountFor = this.discount_for?.filter(item => item.added_discount > 0);
      this.onDiscountSelect();
    }
  }

  automaticDiscount(selectedChildren:any){
    return selectedChildren?.filter((item:any)=>{
      if(this.fees.discount_type == 1 && this.fees.zero_fee_receipt == 0 && item.remaining_discount > 0){
        item.max_discount = item.added_discount = item.remaining_discount;
        return item;
      }
    });
  }

  onetimeAutomaticDiscount(onetime:any){
    return onetime?.filter((item:any)=>{
      if(this.fees.discount_type == 1 && this.fees.zero_fee_receipt == 0 && item.remaining_discount > 0){
        item.max_discount = item.added_discount = item.remaining_discount;
        return item;
      }
    });
  }

  removeFees(fees,totalChange = true){
    fees.paying_amount = fees.remaining_amount;
    this.selectedChildren = this.selectedChildren.filter(item => item.id != fees.id);
    const hasAny = this.selectedChildren.filter(item => item.month === fees.month);
    if(hasAny?.length == 0){
      this.selectedMonths = this.selectedMonths.filter(item => item.id != fees.month);
      this.resetQuarter();
    }
    this.removeDiscount(fees);
    if(totalChange){
      this.refreshDiscountFor();
      this.calculateTotalFees();
    }
  }

  removeDiscount(discount){
    discount.added_discount = 0;
    this.discountFor = this.discountFor.filter(item => item.id != discount.id);
    this.selectedDiscountFor = this.selectedDiscountFor.filter(item => item.id != discount.id);
    this.calculateTotalFees();
  }

  onDiscountSelect(){
    this.discountFor = this.selectedDiscountFor?.reduce((acc: any[], curr: any) => {
      const month = this.discount_for?.find(month => month.id === curr.id);
      if (month) {
        // month.max_discount = month.remaining_amount - month.paying_amount;
        month.max_discount = month.paying_amount;
        if(this.fees.discount_type == 0){
          month.added_discount = month.remaining_discount || 0;
        }
        acc.push(month);
      }
      return acc;
    }, []);
    this.calculateTotalFees();
  }

  calculateTotalFees(edit = false){
    if(this.hasPreviousFees()){
      this.is_remarks_required = this.collect_fees_settings?.is_remarks_required && this.is_admin;
      this.is_attachments_required = this.collect_fees_settings?.is_attachments_required && this.is_admin;
      if(this.is_admin && this.confimation){
        this.disableSave = false;
      }
      if(this.is_admin && !this.confimation){
        this.confimationSwal();
      }
    }else{
      this.is_remarks_required = false;
      this.is_attachments_required = false;
    }
    var nextIndex = 0;
    this.total_amount = this.late_fees = this.total_bkp = this.onetime = 0;
    this.selectedChildren?.forEach((fees:any)=>{
      if (this.months[fees.month] > nextIndex) {
          nextIndex = this.months[fees.month];
      }
      this.total_amount += Number(fees.paying_amount);
      this.total_bkp += Number(fees.paying_amount);
      if(fees.is_late_fees){
        this.late_fees += Number(fees.paying_amount);
      }
    });
    this.fees?.onetime?.forEach((fees:any)=>{
      this.onetime += Number(fees.paying_amount??fees.remaining_amount);
    });
    this.discountFor?.forEach((fees:any)=>{
      if(fees.is_one_time){
        this.onetime -= Number(fees.added_discount);
      }else{
        this.total_amount -= Number(fees.added_discount);
        this.total_bkp -= Number(fees.added_discount);
      }
      if(fees.is_late_fees){
        this.late_fees -= Number(fees.added_discount);
      }
    });
    this.automaticDiscount(this.selectedChildren)?.forEach((fees:any)=>{
      this.total_amount -= Number(fees.added_discount);
      this.total_bkp -= Number(fees.added_discount);
    });
    this.onetimeAutomaticDiscount(this.fees?.onetime)?.forEach((fees:any)=>{
      this.onetime -= Number(fees.added_discount);
    });

    this.total_amount += this.onetime;
    this.total_bkp += this.onetime;
    var next = 12;
    this.fees?.remaining_fees?.forEach((item:any)=>{
      if(this.months[item.id] > nextIndex && next > this.months[item.id]){
        next = this.months[item.id];
      }
    });
    // var nextMonth:any = this.getKeyByValue(next);
    // this.nextPayOnDate = this.fees?.monthDates?.[nextMonth]??null;
    // this.refreshDiscountFor(edit);
  }

  hasPreviousFees(){
    if(this.edit || this.collect_fees_settings?.allow_collect_fees_on_previous_fees == 1){
      this.disableSave = false;
      return false;
    }
    const payingMonths = this.selectedMonths?.map((item:any)=>item.name);
    const remainingMonths = this.fees?.remaining_fees?.map((item:any)=>item.name);

    if(!this.isEmpty(this.fees?.previous_year_fees))
    {
      !this.confimation ? this.toastr.showError('Please Pay Previous Year Fees') : '';
      this.errorMsg = 'Previous year fees is pending, Do you want to take this fees force fully ?';
      this.disableSave = true;
      return true;
    }
    else if(payingMonths?.length > 0 && remainingMonths?.length > 0)
    {
      const onetime = this.fees?.onetime?.filter(item => item.remaining_amount != item.paying_amount && item.paying_amount != undefined)?.length;
      if(onetime > 0){
        !this.confimation ? this.toastr.showError('Please Pay Onetime Fees First') : '';
        this.errorMsg = 'Onetime fees is pending, Do you want to take this fees force fully ?';
        this.disableSave = true;
        return true;
      }
      else if(this.hasSkippedMonth((payingMonths?.map(month=>this.months[month])),(remainingMonths?.map(month=>this.months[month]))))
      {
        !this.confimation ? this.toastr.showError('Please Pay Previous Month Fees') : '';
        this.errorMsg = 'Previous month fees is pending, Do you want to take this fees force fully ?';
        this.disableSave = true;
        return true;
      }
      else
      {
        var index = 0;
        for (const month of payingMonths ?? []) {
          const payingCount = this.selectedChildren?.filter(item => item.month === month && item.remaining_amount === item.paying_amount)?.length;
          const remainingCount = this.fees?.remaining_fees?.find(item=>item.name === month)?.children?.length;

          if (payingCount < remainingCount && (payingMonths[index+1]??false)) {
            !this.confimation ? this.toastr.showError('Please Pay Full Fees of Previous Month') : '';
            this.errorMsg = 'Previous month fees is not fully paid, Do you want to take this fees force fully ?';
            this.disableSave = true;
            return true;
          }
          index++;
        }

      }
    }
    this.disableSave = false;
    return false;
  }

  hasSkippedMonth(array1: number[], array2: number[]): boolean {
    let i = 0;
    while (i < array1?.length) {
      if (array1[i] === array2[i]) {
        i++;
      } else {
        return true;
      }
    }
    return false;
  }

  confimationSwal(){
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure ?',
      text: this.errorMsg,
      showCancelButton: true,
      confirmButtonColor: '#f28726',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.confimation = true;
        this.disableSave = false;
      }
    })
  }

  getKeyByValue(value: number) {
    return Object.keys(this.months).find(key => this.months[key] === value);
  }

  updateRemainingFeesModel(fees,event){
    const amount = Number(event?.target?.value);
    if(fees.remaining_amount < amount){
      fees.paying_amount = event.target.value = fees.remaining_amount;
      this.toastr.showError('Amount Can Not Be Higher Than Actual Amount');
    }else if(amount < 0){
      fees.paying_amount = event.target.value = fees.remaining_amount;
    }else{
      fees.paying_amount = amount;
    }
    this.refreshDiscountFor();
    this.calculateTotalFees();
  }

  totalChange(){
    const amount = Number(this.adjust_amount);
    if(amount < 0){
      this.toastr.showError('Invalid Adjust Amount');
      this.clearChequeDetails();
      return;
    }
    if(amount < this.onetime){
      this.toastr.showError('Adjust Amount Should Be Higher Than Onetime Fees');
      this.clearChequeDetails();
      return;
    }
    if(this.total_bkp < amount){
      this.adjust_amount = this.total_bkp;
      this.toastr.showError('You can not increase total amount directly, Instead you should do it component wise.');
      this.clearChequeDetails();
      return;
    }else{
      this.selectedChildren?.reverse();
      var deduct = this.total_bkp - amount;
      this.selectedChildren?.forEach((fees: any) => {
        if (deduct > 0 && fees.paying_amount > 0) {
            const payingAmount = Math.min(deduct, fees.paying_amount);
            fees.paying_amount = Number(fees.paying_amount) - payingAmount;
            deduct -= payingAmount;
            if(fees.paying_amount == 0){
              this.removeFees(fees,false);
            }
        }
      });
      this.selectedChildren?.reverse();
      this.refreshDiscountFor();
      this.calculateTotalFees();
    }
  }

  updateDiscountModel(fees,event){
    const discount = Number(event.target.value);
    if(discount > fees.max_discount){
      fees.added_discount = event.target.value = fees.max_discount;
      this.toastr.showError('Discount can not be higher than '+fees.max_discount);
    }else if(discount < 0){
      fees.added_discount = event.target.value = 0;
    }else{
      fees.added_discount = event.target.value = discount;
    }
    this.calculateTotalFees();
  }

  updateOnetimeModel(fees,event){
    const amount = Number(event.target.value);
    if(amount > fees.remaining_amount){
      event.target.value = fees.remaining_amount;
      fees.paying_amount = fees.remaining_amount;
      this.toastr.showError('Amount Can Not Be Higher Than Actual Amount.');
    }else if(amount < 0){
      event.target.value = 0;
      fees.paying_amount = 0;
    }else if(amount <= fees.remaining_amount){
      event.target.value = amount;
      fees.paying_amount = amount;
    }
    this.refreshDiscountFor();
    this.calculateTotalFees();
    return;
  }

  changePaymentDate(event){
    const today = new Date();
    const date = new Date(event.target.value);

    if(!this.edit?.other_data?.payment_mode_id) {
      if(today.setHours(0,0,0,0) > date.setHours(0,0,0,0)){
        this.payment_modes_list = this.back_date_payment_modes
        this.payment_mode = null;
      }
      if(today.setHours(0,0,0,0) == date.setHours(0,0,0,0)){
        this.payment_modes_list = this.payment_modes
        this.payment_mode = null;
      }
    }

    if (today.getTime() < date.getTime()) {
      this.today = this.changeDateFormat(new Date());
      // event.target.value = this.today;
      this.toastr.showError('Future Date Not Allowed');
    }else if(this.backDate == 0 && today.getTime() > date.getTime()){
      this.today = this.changeDateFormat(new Date());
      // event.target.value = this.today;
      this.toastr.showError('Past Date Not Allowed');
    }
  }

  changeNextPaymentDate(event){
    const today = new Date();
    const date = new Date(event.target.value);
    if (today.getTime() > date.getTime()) {
      this.nextPayOnDate = this.changeDateFormat(new Date());
      event.target.value = this.changeDateFormat(new Date());
      this.toastr.showError('Please select future date');
    }
  }

  pay(print:any = false){
    var hasError = false;
    this.selectedChildren?.forEach((item:any)=>{
      if(this.fees.discount_type == 1 && this.fees.zero_fee_receipt == 0 && item.remaining_discount > 0){
        if(item.paying_amount < item.remaining_discount){
          this.toastr.showError(item.month + ' ' + (item?.category?.type_name??"") + ' Amount Should be more than or equal it\'s discount of '+item.remaining_discount);
          hasError = true;
          return;
        }
      }else if(this.fees.discount_type == 0){
        if(item.paying_amount < item.added_discount){
          this.toastr.showError(item.month + ' ' + (item?.category?.type_name??"") + ' Discount should be less than or equal to it\'s paying amount of '+item.paying_amount);
          hasError = true;
          return;
        }
      }
    });
    this.fees?.onetime?.forEach((item:any)=>{
      if(this.fees.discount_type == 1 && this.fees.zero_fee_receipt == 0 && item.remaining_discount > 0){
        if(item.paying_amount < item.remaining_discount){
          this.toastr.showError(item?.category?.type_name + ' Amount Should be more than or equal it\'s discount of '+item.remaining_discount);
          hasError = true;
          return;
        }
      }else if(this.fees.discount_type == 0){
        if(item.paying_amount < item.added_discount){
          this.toastr.showError(item?.category?.type_name + ' Discount should be less than or equal to it\'s paying amount of '+item.paying_amount);
          hasError = true;
          return;
        }
      }
    });

    if(hasError){
      return;
    }

    const form = document.getElementById('collect-fees') as HTMLFormElement;
   
    
    const formData:any = new FormData(form);
    formData.append('cheque[bank_name_id]',this.bank_name_id);
    
    let skip_payment_mode = false;
    for(const [field,value] of formData.entries())
    {
      if(field.includes('discount') && this.total_amount == 0){
        skip_payment_mode = true;
      }
    }

    if(!skip_payment_mode){
      const errors = this.commonService.paymentModeValidator(formData,this.payment_mode);
      if(Object.keys(errors)?.length > 0){
        const key = Object.keys(errors)[0];
        this.toastr.showError(errors[key]);  
        return;
      }
      if(!this.payment_mode){
        this.toastr.showError('Please select payment mode');
        return;
      }
      if(this.payment_mode == 2 && !this.bank_name_id){
        this.toastr.showError('Please select bank name');
        return;
      }

      for(const [field,value] of formData.entries())
      {
        if(field == 'remarks' && value == '' && this.is_remarks_required){
          this.toastr.showError('Please enter remarks');
          return;
        }
        if(field == 'attachments[]' && value.size == 0 && this.is_attachments_required){
          this.toastr.showError('Please select attachment');
          return;
        }
      }
    }

    const modalRef = this.modalService.open(FeesConfirmationComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.student = this?.student;
    modalRef.componentInstance.selectedFees = [...this.selectedChildren?.filter((item:any)=>item.paying_amount > 0)??[],...this.fees?.onetime?.filter((item:any)=>item.paying_amount > 0)??[]];
    modalRef.componentInstance.payment_date = this.today;
    modalRef.componentInstance.total_amount = this.total_amount;
    modalRef.componentInstance.payment_mode = this.payment_modes?.find((item:any)=>item.id == this.payment_mode);
    modalRef.result?.then((response:any) => {
      if(response && response.save)
      {
        if(this.student?.id){
          formData.append('student_id',this.student?.id);
          if(this.payment_mode){
            formData.append('payment_mode',this.payment_mode);
          }
        }
        if(this.discountFor?.length > 0 && this.discount_by_id){
          formData.append('discount_by_id',this.discount_by_id);
        }
        if(this.reason){
          formData.append('reason',this.reason);
        }
        if(skip_payment_mode && !this.edit){
          formData.append('payment_mode', 1);  
          formData.append('is_discount_receipt',1);
        }
        if(this.edit){
          formData.append('edit','1');
          formData.append('payment_mode',this.edit.other_data.payment_mode_id);
          formData.append('group_id',this.edit.other_data.group_id);
          formData.append('receipt_no',this.edit.other_data.receipt_no);
        }
        if (this.today){
          formData.append('payment_date',this.today);
        }
        if (this.nextPayOnDate){
          formData.append('payOnDate',this.nextPayOnDate);
        }
        formData.append('is_father_message',response.message.is_father_message ? 1 : 0 );
        formData.append('is_mother_message',response.message.is_mother_message ? 1 : 0 );
        formData.append('is_student_message',response.message.is_student_message ? 1 : 0 );
        formData.append('collected_cheque_detail_id', this.collected_cheque_detail_id ?? '' );
        formData.append('cheque[cheque_status]', this.cheque_status ?? null );
        formData.append('cheque[cheque_no]', this.cheque_no ?? null );
        formData.append('cheque[cheque_date]', this.cheque_date ?? null );

        this.disableSave = true;
        this.feeSerivce.collectFees(formData).subscribe((response:any)=>{
          if(response.status){
            if(print){
              this.feesReceipt(response.data);
            }
            this.toastr.showSuccess(response.message);
            this.getFeesDetails();
            this.getChequeListByStudent(this.student?.id);
          }else{
            this.toastr.showError(response.message);
          }
          this.disableSave = false;
          // this.bank_name_id = null
        },(error:any)=>{
          this.disableSave = false;
          // this.bank_name_id = null
          this.toastr.showError(error.error.message);
        });
      }
    });
  }

  editRefund(row){
    if(row?.payment_mode?.is_online == 1) {
      return
    }
    if(row.has_paid_after){
      this.toastr.showError('You can not edit this refund, as this category fees has been paid after this refund.');
      return;
    }else{
      localStorage.setItem('edit_refund_categories_'+row.refund_id,row.category_ids);
      this.router.navigate([this.setUrl(URLConstants.FEES_REFUND_EDIT),row.refund_id]);
    }
  }

  deleteOrCancel(row:any,is_cancelled:any = false){
    if(row?.payment_mode?.is_online == 1) {
      return
    }
    if(row.is_refund && row.has_paid_after){
      this.toastr.showError('You can not '+(is_cancelled ? 'cancel' : 'delete')+' this refund, as this category fees has been paid after this refund.');
      return;
    }
    if(!row.is_refund && row.refunded_amount > 0){
      this.toastr.showError('To '+(is_cancelled ? 'cancel' : 'delete')+' this receipt, first you need to delete refund receipt for this category');
      return;
    }
    const modalRef = this.modalService.open(DeleteOrCancelReasonComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.receipt_no = row?.receipt_no;
    modalRef.componentInstance.is_cancelled = is_cancelled;
    modalRef.result?.then((response:any) => {
      if(response && response.status){
        this.deleteOrCancelFees(row, response.reason, is_cancelled);
      }
    });
  }

  editReason(print = false){
    const modalRef = this.modalService.open(DeleteOrCancelReasonComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.receipt_no = this.edit.other_data.receipt_no;
    modalRef.componentInstance.is_cancelled = false;
    modalRef.componentInstance.is_edit = true;
    modalRef.result?.then((response:any) => {
      if(response && response.status){
        this.reason = response.reason;
        this.pay(print);
      }
    });
  }

  deleteOrCancelFees(row:any, reason:any, is_cancelled:any = false){
    const params = {
      receipt_no      : row.receipt_no,
      group_id        : row.group_id,
      is_cancelled    : is_cancelled,
      reason          : reason,
    };
    if(row.is_refund)
    {
      this.feeSerivce.deleteRefund(row?.refund_id,params).subscribe((response:any)=>{
        if(response.status) {
          this.getFeesDetails();
          this.toastr.showSuccess(response?.message);
        }else{
          this.toastr.showError(response?.message);
        }
      },(error) => {
        this.toastr.showError(error?.error?.message);
      });
    }
    else
    {
      this.feeSerivce.deleteOrCancelFees(params).subscribe((response:any)=>{
        if(response.status){
          this.toastr.showSuccess(response.message);
          this.getFeesDetails();
        }else{
          this.toastr.showError(response.message);
        }
      },(error:any)=>{
          this.toastr.showError(error.error.message);
      });
    }
  }

  feesReceipt(row){
    const params = {
      receipt_no      : row.receipt_no,
      group_id         : row.group_id,
      is_refund       : row.is_refund,
      refund_id       : row.refund_id,
    }
    this.feeSerivce.feesReceipt(params).subscribe((response:any)=>{
      this.commonService.downloadFile(response,'Fees Receipt','pdf');
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  attachment(row){
    if(row?.payment_mode?.is_online == 1) {
      return
    }
    const modalRef = this.modalService.open(AttachmentsComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.receipt_no = row.receipt_no;
    modalRef.componentInstance.receiptModes = this.receiptModes;
    modalRef.componentInstance.showDelete = !this.disableSaveForInactiveStudent;
    if(row?.is_refund){
      modalRef.componentInstance.refund_id = row.refund_id;
    }else{
      modalRef.componentInstance.group_id = row.group_id;
    }
  }

  editFn(row){
    if(row?.payment_mode?.is_online == 1) {
      return
    }
    if(row.refunded_amount > 0){
      this.toastr.showError('To edit this receipt, first you need to delete refund receipt for this category');
      return;
    }
    this.resetForm();
    this.feeSerivce.edit({receipt_no:row.receipt_no,group_id:row.group_id}).subscribe((response:any)=>{
      this.edit = response.data;
      console.log('this.edit: ', this.edit);
      this.fees.quarters = this.all_quarters;
      const remaining_fees = this.setRemainingFees(response.data?.remaining_fees,true);
      this.mergeObjects(this.fees?.remaining_fees??{}, remaining_fees);
      this.fees.remaining_fees = this.fees?.remaining_fees?.map(item=>item);
      this.selectedMonths = Object.keys(response.data?.remaining_fees).map((month:any) => {
        return {
          id : month,
          name : month,
        }
      });
      this.selectedChildren = this.selectedMonths?.sort((a, b) => this.months[a.id] - this.months[b.id]).reduce((acc: any[], curr: any) => {
        const month = remaining_fees.find(month => month.id === curr.id);
        if (month) {
          acc.push(...month.children);
        }
        return acc;
      }, []);

      this.fees.onetime = this.edit.onetime;
      this.resetQuarter();
      this.refreshDiscountFor(true);

      this.discountFor = this.discount_for?.filter(item => item.added_discount > 0);
      this.selectedDiscountFor = this.discountFor?.filter((item:any) => {
        return {
          id : item.id,
          label : item.label
        }
      });
      this.calculateTotalFees(true);

      this.today = this.edit.other_data.payment_date;
      this.payment_mode = this.edit.other_data.payment_mode_id;
      this.bank_name_id = this.edit?.other_data?.cheque?.bank_name_id;
      this.card_type = this.edit.other_data?.card_detail?.card_type.toString()??'1';
      this.fees.receipt_no = this.edit.other_data.receipt_no;
      this.cheque_status = this.edit?.other_data?.cheque?.cheque_status??'clear';
      this.cheque_no = this.edit?.other_data?.cheque?.cheque_no ?? null;
      this.cheque_date = this.edit?.other_data?.cheque?.cheque_date ?? null;
      this.chequeList = this.chequeList?.concat({ id: this.edit?.other_data?.collected_cheque_detail_id, displayContent: this.edit?.other_data?.cheque?.bank_name + ' | ' + this.edit?.other_data?.cheque?.cheque_no + ' | Rs. ' + this.edit?.other_data?.total_amount });
      this.collected_cheque_detail_id = this.edit?.other_data?.collected_cheque_detail_id ?? '';
      this.discount_by_id = this.edit?.other_data?.discount_by_id;
      if(this.edit?.payOnDate){
        this.nextPayOnDate = this.changeDateFormat(this.edit.payOnDate);
      }
      const editPaymentMode = this.edit.other_data.payment_mode;
      if(!this.payment_modes.find(item=>item.id == editPaymentMode.id)){
        editPaymentMode.edit_only = true;
        this.payment_modes.push(editPaymentMode);
      }

    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }

  mergeObjects(obj1: any[], obj2: any[]) {
    obj2.forEach((itemToMerge) => {
        let existingIndex = obj1.findIndex((item) => item.id === itemToMerge.id);
        if (existingIndex !== -1) {
            let existingChildren = obj1[existingIndex].children;
            itemToMerge.children.forEach((childToMerge) => {
                let childIndex = existingChildren.findIndex((child) => child.id === childToMerge.id);
                if (childIndex !== -1) {
                    existingChildren[childIndex] = childToMerge;
                }
            });
            obj1[existingIndex].children = existingChildren;
        } else {
            obj1.push(itemToMerge);
        }
    });
  }

  changeDateFormat(dateString: any, format:any = 'YYYY-MM-DD') {
    try {
        const parsedDate = moment(dateString);
        return parsedDate.format(format);
    } catch (error) {
        return 'Invalid Date';
    }
  }

  isEmpty(obj:any = {}){
    return Object.keys(obj)?.length === 0;
  }

  decodeString(string:any) {
    return this.sanitizer.bypassSecurityTrustHtml(string);
  }

  editHistory(fees:any){
    if(fees?.payment_mode?.is_online == 1) {
      return
    }
    const modalRef = this.modalService.open(FeesEditHistoryComponent,{
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.fees = fees;
  }

  selectionChange(event) {
    this.bank_name_id = event?.id??null
  }

  createAndUpdateData(event) {
    if(!event?.id && !event?.name ){
      // this.toastr.showInfo("Enter the name ","Name not Found")
      alert("Please add Bank name in search")
      return
    }
    this.feeSerivce.createBank(event).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        this.bank_names.push(resp.data)
        this.bank_name_id = resp.data.id;
        this.getPermissionsList(resp.data.id)
      }else{
        this.toastr.showError(resp.message)
      }
       
    })
  }

  deleteData(event) {
    let confirm = window.confirm('Are you sure you want to delete this bank name?')
    if(confirm){
      this.feeSerivce.deleteBank(event).subscribe((res:any)=>{
        if(res.status){
          this.toastr.showSuccess(res?.message)
          this.getPermissionsList()
        }else{
          this.toastr.showError(res?.message)
        }
     })
    }
  }

  currentDate():string {
    const date = moment(new Date()).format('YYYY-MM-DD');
    return date;
  }

  clearChequeDetails(){
    this.cheque_no = null; 
    this.bank_name_id = null;
    this.cheque_date = null;
    this.adjust_amount = null;
    this.remarks = null;
    this.collected_cheque_detail_id = null;
    this.cheque_status = null;
  }
}
