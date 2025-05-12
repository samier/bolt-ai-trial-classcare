import { Component, OnInit, QueryList, ElementRef, HostListener, ViewChildren, AfterViewInit  } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/core/services/common.service';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { AcademicService } from '../academics.service';
import { Toastr } from 'src/app/core/services/toastr';
import { AttachmentsComponent } from 'src/app/modules/academics/attachments/attachments.component';
import { AddAttachmentComponent } from 'src/app/modules/academics/add-attachment/add-attachment.component';
import { ViewAttachmentsComponent } from 'src/app/modules/academics/view-attachments/view-attachments.component';
import { GenerateDiscountReceiptComponent } from 'src/app/modules/academics/generate-discount-receipt/generate-discount-receipt.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeesService } from 'src/app/modules/fees/fees.service';

@Component({
  selector: 'app-academics',
  templateUrl: './academics.component.html',
  styleUrls: ['./academics.component.scss']
})
export class AcademicsComponent implements OnInit {

  tbody:any;
  login_id:any=4;
  p: number = 1;
  profile_image:any;
  username:any;
  mobile_number:any;
  branch_id:any;
  batch:string = "-";
  admission_date = null;
  student:any = null
  courseFees:any = null;
  studentFees:any = null;
  discountType:any = null;
  errors:any = [];
  tab:any = 1;
  academicYear:any;
  discountReasons:any = []
  filteredReasons:any = [];
  isDropdownOpen:any = [];
  selectedReasonText:any = [];
  selectedReasonId:any = [];
  editReasonId:any = [];
  searchTerm:any = [];
  permissions:any = [];
  system_settings:any = [];
  @ViewChildren('dropdowns') dropdowns!: QueryList<ElementRef>;
  @ViewChildren('dropdownInput') dropdownInputs!: QueryList<ElementRef>;
  public institute_modules:any = [];
  private API_URL = enviroment.apiUrl;
  saving:boolean = false;
  constructor(
    public datePipe: DatePipe,
    public route:ActivatedRoute,
    private feeSerivce:FeesService,
    private httpRequest: HttpClient,
    public CommonService: CommonService,
    private leaveManagementSerivce:LeaveManagmentService,
    private AcademicService: AcademicService,
    private modalService: NgbModal,
    private toastr: Toastr,
    private router: Router
  ){
    this.login_id = this.route.snapshot.paramMap.get('unique_id');
    this.branch_id = window.localStorage.getItem("branch");
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
  }
  academic_year = null;
  URLConstants=URLConstants;
  symfonyHost = enviroment.symfonyHost;
  
  ngOnInit(): void {
    this.discountReasonList();
    this.getPermissionsList();
    this.leaveManagementSerivce.getStudentProfileDetail(this.login_id).subscribe((resp:any) => {   
      if(resp.status == false && !resp.id){
        this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        return;
      }        
      this.router.navigate([this.setUrl(URLConstants.ACADEMICS+resp.unique_id)]);  
      this.profile_image = resp?.image;
      this.username = resp?.full_name;
      this.profile_image = resp?.profile_url;
      this.mobile_number = resp?.phone_number;
      this.batch = resp?.batch;
      this.admission_date = resp?.admission_date;
      this.academic_year = resp?.academic_year?.slice(0, 4)
      this.student = resp

      if(!this.profile_image){
        this.profile_image = this.symfonyHost + resp?.profile
      }

      this.getStudentFeesDetail();
    }); 
  }

  getStudentFeesDetail(){
    let data = {
      student_id : this.student.id,
      course_id: this.student.course_id
    }
    this.AcademicService.getStudentFeesDetail(data).subscribe((resp:any) => {
        if(resp.status){
          this.courseFees = resp.data.course_fees;
          this.system_settings = resp.data.system_settings;
          this.studentFees = resp.data.student_fees.map((el:any) => {
            this.selectedReasonText.push(el.discount_reason?.discount_reason);
            this.selectedReasonId.push(el.discount_reason?.id);
            el.remaining_amount = el.amount - (el.paid_amount + el.applied_discount);
            el.discount_type_amount = null;
            el.old_discount = Number(el.discount)
            return {...el, file: el.attachment ?? null, file_attachment: el.file_attachment ?? null,  discount_type: 'amount', inc_dec_type : 'increment' }
          });
          this.discountType = resp.data.discount_type
          this.academicYear = resp.data.academicYear
          
        }
    })
  }

  getPermissionsList(){
    this.feeSerivce.getPermissionsList({permission:true}).subscribe((response:any) => {
      this.permissions = response.data;
    });
  }

  save(){
    var error = false;
    this.studentFees.forEach((item:any,index:any) => {
      const paid = item.paid_amount + item.applied_discount;
      const label = (item.month??"")+' '+(item.category ? item.category.type_name : 'School Fees');
      if(item.amount < paid){
        this.toastr.showError(label+' amount can not be less than '+paid);
        error = true;
      }else if(this.discountType == 1 && item.discount < item.applied_discount){
        this.toastr.showError(label+' discount can not be less than '+item.applied_discount);
        error = true;
      }else if(this.discountType == 1 && (item.discount - item.applied_discount) > (item.amount - paid)){
        this.toastr.showError(label+' discount can not be higher than '+(item.amount - item.paid_amount));
        error = true;
      }
    });
    if(error){
      return;
    }
    const formData = new FormData();
    formData.append('student_id', this.student.id)
    formData.append('course_id', this.student.course_id)
    this.studentFees.forEach((item:any, index:any) => {
      formData.append('student_fees['+index+'][id]', item.id)
      formData.append('student_fees['+index+'][course_id]', item.course_id ?? "")
      formData.append('student_fees['+index+'][student_id]', item.student_id ?? "")
      formData.append('student_fees['+index+'][category_id]', item.category_id ?? "")
      formData.append('student_fees['+index+'][amount]', item.amount ?? "")
      formData.append('student_fees['+index+'][discount]', item.discount ?? "")
      formData.append('student_fees['+index+'][remark]', item.remark ?? "")
      formData.append('student_fees['+index+'][month]', item.month ?? "")
      formData.append('student_fees['+index+'][discount_type]', item.discount_type ?? "")
      formData.append('student_fees['+index+'][discount_type_amount]', item.discount_type_amount ?? "")
      formData.append('student_fees['+index+'][inc_dec_type]', item.inc_dec_type ?? "")
      for(var i = 0; i < item.files?.length; i++){
        formData.append('student_fees['+index+'][files][]', item.files[i].file ?? "")
        formData.append('student_fees['+index+'][file_names][]', item.files[i].file_name ?? "")
      }
      formData.append('student_fees['+index+'][discount_reason_id]', item.discount ? (this.selectedReasonId[index] || '') : "")
    }) 
    this.saving = true;
    this.AcademicService.updateStudentFeesDetail(formData).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message)
        this.getStudentFeesDetail();
        this.errors = [];
      }else{
        if(resp.message){
          this.toastr.showError(resp.message)
        }else{
          this.errors = resp.data;
        }
      }
      this.saving = false;
    }, (error:any) => {
      this.saving = false;
      this.toastr.showError('Something went wrong.')
      console.log('error' + error.message);
    })
  }

  handleDiscount(item:any){ 
    if(item.discount_type_amount == ''){
      item.discount = item.old_discount;
      return;
    }

    let dis:any;
    if(item.discount_type == 'amount'){
      dis = Number(item.discount_type_amount)
    }else{
      dis = Number((item.amount * item.discount_type_amount) / 100)
    }
    if(item.inc_dec_type == 'decrement'){
      dis = item.old_discount - dis;
      if(dis < 0){
        this.toastr.showError('Invalid Discount');
        item.discount = item.old_discount;
        item.discount_type_amount = null;
        return
      }
    }else{
      dis = item.old_discount + dis;
    }
    if(parseFloat(dis) > parseFloat(item.amount)){
      this.toastr.showError('Discount Value can not be greater then Fees')
      setTimeout(() => {
        item.discount_type = 'amount';
        item.discount = null;
        item.discount_type_amount = null;
      }, 20);
    }else{
      item.discount = dis
    }
  }

  handleValidation(item:any){
    if( isNaN(item.discount_type_amount)){
      item.discount_type_amount = null;
      item.discount = null;
      return this.toastr.showInfo('Discount type amount must be numeric','INFO')

    }

    if( isNaN(item.amount)){
      return this.toastr.showInfo('Fees must be numeric','INFO')

    }
  }

  handleDiscountChange(e:any, item:any){
    if(e == 'null'){
      setTimeout(() => {
        item.discount_type = null;
        item.discount = null
      }, 20);
    }else{
      let discount = this.discountType.find((el:any) => el.id == e) 
      let dis:any;
      if(discount.discount_in == 1){
        dis = discount.discount_value
      }else{
        dis = ((item.amount * discount.discount_value) / 100)
      }
      if(dis > item.amount){
        this.toastr.showInfo('Discount Value can not be greater then Fees','INFO')
        setTimeout(() => {
          item.discount_type = null;
          item.discount = null
        }, 20);
      }else{
        item.discount = dis
      }
    }
  }

  onFileSelected(event: any, item:any) {
    item.files = event.target.files;
  }

  discountReasonList(){
    this.AcademicService.discountReasonList().subscribe((resp:any) => {
      if(resp.status){
        this.discountReasons = resp.data;
      }
    })
    
  }

  removeFile(item:any){
    item.file = null;
    item.attachment = null;
    item.file_attachment = null;
    let file:any = document.querySelector('input[type=file]');
    file.value = ''
    
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  setsymfonyUrlAdmin(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  } 
  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url+'/'+this.login_id;
  }

  getInstituteModule(module_name:string){
    return this.institute_modules.includes(module_name);
  }

  // reason selector 
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    let clickedInsideDropdown = false;

    this.dropdowns.forEach((dropdown, index) => {
      if (dropdown.nativeElement.contains(event.target)) {
        clickedInsideDropdown = true;
      }
    });

    if (!clickedInsideDropdown) {
      this.isDropdownOpen = this.isDropdownOpen.map(() => false);
    }
  }

  toggleDropdown(i:number) {
    this.isDropdownOpen[i] = !this.isDropdownOpen[i];
    this.searchTerm[i] = this.editReasonId[i] = '';
    Object.keys(this.isDropdownOpen).forEach((j) => {
      if (j != i.toString()) {
        this.isDropdownOpen[j] = false;
      }
    });
    this.filterOptions(i);
    this.focusOnInput();
  }
  
  focusOnInput(){
    setTimeout(()=>{
      this.dropdownInputs.forEach((input) => {
        input.nativeElement.focus();
      });
    },100)
  }

  filterOptions(i:number) {
    this.filteredReasons[i] = this.discountReasons?.filter((reason:any) => {
        reason.reason_toggle = false;
        if(this.selectedReasonId[i] == reason?.id){
          this.selectedReasonText[i] = reason?.discount_reason;
        }
        return reason?.discount_reason?.toLowerCase().includes(this.searchTerm[i]?.toLowerCase()||"")
      }
    );
  }

  selectReason(row:any,i:number){
    this.selectedReasonText[i] = row.discount_reason;
    this.selectedReasonId[i] = row.id;
    this.searchTerm[i] = this.editReasonId[i] = "";
    this.toggleDropdown(i);
  }

  toggleReasonAction(row: any, event: Event, i:number) {
    row.reason_toggle = !row.reason_toggle;
    this.filteredReasons[i]?.filter((reason:any)=>{
      if(row.id != reason.id){
        reason.reason_toggle = false;
      }
      return;
    })
    event.stopPropagation(); 
  }

  editReason(row: any, event: Event, i:number) {
    event.stopPropagation();
    this.searchTerm[i] = row.discount_reason;
    this.editReasonId[i] = row.id;
    row.reason_toggle = false;
    this.filterOptions(i);
    this.focusOnInput();
  }

  deleteReason(id: number, event: Event, i:number) {
    event.stopPropagation();
    this.AcademicService.deleteDiscountReason(id,{ student_id: this.student.id }).subscribe((resp:any)=>{
      if(resp.status){
        this.toastr.showSuccess(resp.message);
        this.discountReasons = resp.data;
        this.resetAfterDelete(i);
        this.focusOnInput();
      }else if(resp.message){
        this.toastr.showError(resp.message);
      }
    },(error:any)=>{
      this.toastr.showError(error?.error?.message??error?.error?.error);
    })
  }

  createNew(event: Event, i:number) {
    event.stopPropagation();
    let data = {
      discount_reason: this.searchTerm[i],
    };
    if(this.searchTerm[i]){
      this.AcademicService.discountReasonUpdateOrCreate(data,this.editReasonId[i]).subscribe((resp:any) => {
        if(resp.status){
          this.discountReasons = resp.data;
          this.toastr.showSuccess(resp.message);
          this.resetAllSelected(i);
          this.focusOnInput();
        }else if(resp.message){
          this.toastr.showError(resp.message);
        }
      },(error:any)=>{
        this.toastr.showError(error?.error?.message??error?.error?.error);
      })
    }
  }

  resetAllSelected(i:number){
    this.isDropdownOpen[i] = !this.isDropdownOpen[i];
    if(!this.editReasonId[i]){
      const recentlyCreated = this.discountReasons.find(item=>item.discount_reason == this.searchTerm[i]);
      this.selectedReasonText[i] = recentlyCreated?.discount_reason;
      this.selectedReasonId[i] = recentlyCreated?.id;
    }
    Object.keys(this.isDropdownOpen).forEach((j) => {
      this.searchTerm[j] = this.editReasonId[j] = '';
      this.filterOptions(Number(j));
    });
  }

  resetAfterDelete(i:number){
    this.filterOptions(i);
    Object.keys(this.isDropdownOpen).forEach((j) => {
      this.searchTerm[j] = this.editReasonId[j] = '';
      const reason = this.discountReasons?.find(item=>item.id == this.selectedReasonId[j]);
      if(this.selectedReasonId[j] && !reason){
        this.selectedReasonText[j] = this.selectedReasonId[j] = '';
      }
    });
  }

  clearSelection(event: Event, i:number) {
    event.stopPropagation();
    this.selectedReasonText[i] = this.selectedReasonId[i] = this.searchTerm[i] = this.editReasonId[i] = '';
    this.filterOptions(i);
    this.focusOnInput();
  }

  addAttachment(row){
    const modalRef = this.modalService.open(AddAttachmentComponent,{
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.scf = row;
  }

  viewAttachment(row){
    const modalRef = this.modalService.open(ViewAttachmentsComponent,{
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.scf = row;
  }

  generateDiscountReceipt(){
    var remaining_discount = 0;
    var total_discount = 0;
    this.studentFees.forEach((scf:any)=>{
      total_discount += scf.discount;
      remaining_discount += scf.remaining_discount;
    });
    if(remaining_discount == 0 && total_discount > 0){
      this.toastr.showError('Discount receipt already generated.');
      return;
    }else if(remaining_discount == 0){
      this.toastr.showError('No discount available.');
      return;
    }
    const modalRef = this.modalService.open(GenerateDiscountReceiptComponent,{
      size: 'md',
      centered: true,
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
    modalRef.componentInstance.student_category_fees = this.studentFees;
    modalRef.componentInstance.student = this.student;
    modalRef.componentInstance.backDate = this.permissions?.back_date;
    modalRef.result?.then((response:any) => {
      if(response){
        this.getStudentFeesDetail();
      }
    });
  }

  hasAccess(mode:any){
    if(this.system_settings?.zero_fee_receipt && this.discountType){
      return this.permissions?.zero_fee_receipt_mode.find((item:any)=>{return item.mode == mode});
    }
  }
}
