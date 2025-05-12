import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { InquiryService } from '../inquiryservice';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import {Toastr} from 'src/app/core/services/toastr';
import moment from 'moment';
import { InquiryFeesModelComponent } from '../inquiry-fees-model/inquiry-fees-model.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentService } from '../../student/student.service';

@Component({
  selector: 'app-inquiry-add',
  templateUrl: './inquiry-add.component.html',
  styleUrls: ['./inquiry-add.component.scss']
})
export class InquiryAddComponent implements OnInit {

  //#region Public | Private Variables

  personalOpenState : boolean = true
  academicOpenState : boolean = true
  addressOpenState  : boolean = true
  inquiryOpenState  : boolean = true
  customOpenState   : boolean = true

  $destroy: Subject<void> = new Subject<void>();
  inquiryForm : FormGroup = new FormGroup({})

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants : any = URLConstants;

  minDate: string | undefined;
  maxDate: string | undefined;

  branch_id : any = window.localStorage.getItem('branch');
  user_id   : any = window.localStorage.getItem('user_id');
  currentYear_id : any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  id : any
  yearList : any = []
  classList : any = []
  customInquiry : any = []
  oldSchoolList : any = []
  employeeList : any = []

  apiYear = {
    current_branch_id: [this.branch_id]
  }

  is_addNotice : boolean = false

  statusList :any = [
    { id : 0 , name : "New"},
    { id : 1 , name : "Qualified"},
    { id : 2 , name : "In-Process"},
    { id : 3 , name : "Confirm"},
    { id : 4 , name : "Rejected"},
  ]
  inquiryFor = [
    { id : 1 , name : "Admission"},
    { id : 2 , name : "Transport"},
    { id : 3 , name : "Hostel"},
  ]
  inquiryFieldData: any
  preSchoolId : any  
  isInquirySetting : any
  feesAmount : number | null = null
  feesDetails 
  systemSettingFees : any

  isNumberSame : boolean = false

  relationList : any = [
    {id:'siblings',name:'Siblings'},
    {id:'cousin',name:'Cousin'},
  ]

  responsibleUserData : any
  sameNumber ={
    father : false,
    mother : false,
    student : false,
  }
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private inquiryService: InquiryService,
    private route: ActivatedRoute,
    private validationService: FormValidationService,
    private toastr: Toastr,
    private router: Router,
    private studentService: StudentService,
    private _modalService :NgbModal
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = today.toISOString().split('T')[0];
    this.id = this.route.snapshot.paramMap.get('id');
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.getSystemSettingInfo()
    this.initForm()
    this.getNotificationSetting();
    this.getAcademicDropdown()
    this.customList()
    // this.getClassesList()
    this.getClassList()
    this.getEmployeeList()
    this.getOldSchoolName()
    if(this.id){
      this.viewInquiry()
    }
    this.getShowFieldData();
    this.getAllEmployee();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  handleSave() {

    if (this.inquiryForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.inquiryForm)
      this.toastr.showError("Please fill all the required field")
      return
    }

    if (this.systemSettingFees && this.isInquirySetting && !this.feesAmount){
      this.toastr.showError('Please Add Inquiry Fees in Apropreate Course or Class..');
      return;
    }

    if (this.systemSettingFees && this.isInquirySetting && this.inquiryForm.value.payment_status == 1 && !this.id) {
      this.openFeesPaymentModel(this.inquiryForm.value);
    } else {
      this.processInquirySubmission();
    }

  }
  viewInquiry(){
    this.inquiryService.viewInquiry(this.id).subscribe((res:any)=>{
      if(res.status){
        let inquiryData = cloneDeep(res.data);
        // let inquiryData = cloneDeep(res.data[0]);
        
        inquiryData.custom_field_data = JSON.parse(inquiryData.custom_field_data)
        this.classChange({id : inquiryData.class_id}) 
        inquiryData.date_of_birth   = inquiryData?.date_of_birth?.split(' ')[0]
        // inquiryData.follow_up       = inquiryData?.follow_up?.split(' ')[0]
        // inquiryData.present_school  = +inquiryData?.present_school_name
        inquiryData.discussion_with = +inquiryData?.discussion_with
        inquiryData.address_type    = ""+inquiryData?.address_type
        inquiryData.who_adhar    = inquiryData?.who_adhaar
        
        
        setTimeout(()=>{
          if (this.customInquiry?.length > 0) {

            this.customInquiry.forEach(element => {
              inquiryData[element.field_name] = inquiryData.custom_field_data["extra_"+element.field_name];
            });
          }
          this.inquiryForm.patchValue(inquiryData);
          this.inquiryForm.controls['present_school'].setValue(inquiryData?.present_school)
          this.preSchoolId = this.oldSchoolList?.find(ele => ele?.name == inquiryData?.present_school)?.id
          this.calculateAge();
        },500)

      }

    },(error:any)=>{
      this.toastr.showError(error.message)
    })
  }

  customList(){
    this.inquiryService.getCustomDetail()?.subscribe((res:any)=>{
      if(res.status){
        this.customInquiry = res.data?.custom_fields_inquiry
        // this.yearList      = res.data?.admission_year

        this.customInquiry = this.customInquiry?.map(res=>{
          return{
            ...res,
            name : res?.field_title
          }
        })
        this.yearList = this.yearList.map(res=>{
          return{
            ...res,
            name : res?.year
          }
        })
      }
      
      if(this.customInquiry){
        this.customInquiry.forEach((field, index) => {
          let defaultValue = '';          
          if (field?.field_type === 'dropdown' && field?.values?.length > 0) { 
            defaultValue = field.values[0];
          }   
          this.inquiryForm.addControl( field?.field_name, new FormControl(defaultValue, field?.required == 1 ? [Validators.required] : [] ) );
        })
      }
 
    })
  }
  getAcademicDropdown(){
    const payload = {
      academic_year_id : this.currentYear_id ,
      current_branch_id : [this.branch_id],
      branch_id : 1
    }
    this.inquiryService.getAcadamicYearList(payload).subscribe((res:any)=>{ 
      this.yearList = res?.data?.map((obj:any) => ( { ...obj , name : obj.year } ) )
    })

  }
  getOldSchoolName( name:any = "" ){
    this.inquiryService.getOldSchoolName().subscribe((res:any)=>{ 
      this.oldSchoolList = res?.data
      if(name){
        this.preSchoolId = this.oldSchoolList?.find(ele=>ele.name == name )?.id
        this.inquiryForm.controls['present_school'].patchValue(name)
      }
    })
  }

  handleAddress(event){

    if(this.inquiryForm.value.address_type == 1){ 
      this.inquiryForm?.controls['permanent_address']?.patchValue( this.inquiryForm?.value?.address )
      this.inquiryForm?.controls['permanent_city']?.patchValue( this.inquiryForm?.value?.current_city )
    }
    else if(this.inquiryForm.value.address_type == 0){
      this.inquiryForm?.controls['permanent_address']?.patchValue( "" )
      this.inquiryForm?.controls['permanent_city']?.patchValue( "" )
    }
  }

  getClassesList(){

    const payload = {
      academic_year_id : this.currentYear_id ,
      branch_id        : this.branch_id ,
      ...(this.inquiryForm?.value?.standard && { standard : this.inquiryForm?.value?.standard || ""}) ,
    }
    this.inquiryService.getClass(payload).subscribe((res: any) => { 
      if(res?.status){
        this.classList =  res?.data 
      }
    } )
   
  }

  getClassList(){
    const payload = {
      academic_year_id : this.inquiryForm.value.academic_year_id || this.currentYear_id ,
      branch_id        : this.branch_id ,
      section : null
    }

    this.inquiryService.getClass(payload).subscribe((res: any) => { 
      if(res?.status){
        this.classList = []
        this.classList =  res?.data 
      }
    } )
  }

  getEmployeeList(){
    const payload = {
      branch_id : this.branch_id ,
    }

    this.inquiryService.getEmployeeList(payload).subscribe((res:any)=>{
      this.employeeList = res?.data?.map((obj : any) => ({...obj,name: obj.full_name}))

    },(error:any)=>{
      this.toastr.showError(error)
    })
  }

  selectionChange(event) {
    this.inquiryForm?.controls['present_school']?.patchValue(event?.name)
  }

  createAndUpdateData(event) {
    if(!event?.id && !event?.name ){
      alert("Please add school name in search")
      return
    }
   this.studentService.createUpdate( event?.id , event?.name ).subscribe((res:any)=>{
     if(res?.status){
       event?.id ?  this.toastr.showSuccess("Updated Successfully") : this.toastr.showSuccess("Created Successfully")
       this.getOldSchoolName( event?.name )
      }
      else if(res?.status == false){
        alert(res?.message?.name)
      }
   })
  }

  deleteData(event) {
    this.studentService.deleteField( event ).subscribe((res:any)=>{
      if(res?.status){
        this.toastr.showSuccess(res?.message)
        this.getOldSchoolName()
      }
   })
  }

  classChange(event) {
    if(this.systemSettingFees && this.isInquirySetting) {
      this.inquiryService.getInqiryFeesOnClass({class_id : event.id}).pipe(takeUntil(this.$destroy)).subscribe((res: any)=>{
        if (res.status) {
          this.feesDetails = res.data
          this.feesAmount = res.data.map(ele => ele.amount).reduce((av:any,pv:any)=> av + (pv ?? 0))
        } else {
          this.feesAmount = null
          this.toastr.showError(res.message);
        }
      },(error)=>{
        this.feesAmount = null
        this.toastr.showError(error?.error?.message ?? error?.message)
      })
    }
  }

  getSystemSettingInfo(){
    const payload ={
      // keys : ["collect_inquiry_form_fees"]
      keys : ["collect_inquiry_fees"]
    }
    this.inquiryService.systemSetting(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any)=>{
      if(res.status){
        this.systemSettingFees = res.data[0]?.value ===1 ? true : false
      }
    })
  }

  onNumberInput(event: Event , who:string=''){
    const value = (event?.target as HTMLInputElement)?.value;
    if (value?.length == 10) {
      const payload = {
        student_mobile: this.inquiryForm.value.student_mobile ,
        parent_mobile: this.inquiryForm.value.parent_mobile ,
        mother_mobile: this.inquiryForm.value.mother_number,
      }
      this.inquiryService.checkMobileNumber(payload).subscribe((res:any)=>{
        if(res?.status){
          this.isNumberSame = true
          this.sameNumber[who] = true
        }
        else{
          this.sameNumber[who] = false
          this.isNumberSame = false
        }
      },(error:any)=>{
        this.toastr.showError(error.error.message || error.message )
      })
    }

  }

  getAllEmployee() {
    this.inquiryService.getAllEmployee().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.responsibleUserData = res.data.map((ele:any) => {
          return {
            id: ele.id,
            name: ele.full_name
          }
        })
      }
    })
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

    initForm() {
      this.inquiryForm = this._fb.group({
        first_name:  ['',[ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter text only" ) ]] ,
        middle_name: ['',[ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter text only" ) ]] ,
        last_name:   ['',[ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter text only" ) ]] ,
        secondary_first_name  : [''],
        secondary_middle_name : [''],
        secondary_last_name   : [''],
        date_of_birth : [ ''],
        age : [ null ],
        gender: [ '' ],
        student_mobile : [ '' , [ ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
        student_email  : [ '' , [ Validators.email ]],
        parent_name: [ '' , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter text only" ) ] ] ,
        mother_name: [ '' , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter text only" ) ]] ,
        parent_mobile:  [ null , [ ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
        mother_number:  [ null , [ ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
        watsapp_number: [ null ],
        parent_email:   [ '' , [ Validators.email ]],
        academic_year_id: [this.currentYear_id  ],
        class_id: [ null  ],
        previous_class: [ '' ],
        present_school: [ null ],
        address: [''],
        permanent_address: [''],
        current_city: [''],
        permanent_city: [''],
        transportation_requirment: [ false ],
        hostel_requirement: [ false ],
        discussion_with: [ null ],
        inquiry_discription: [''],
        remark: [''],
        // follow_up: [''],
        status : [ 0 ],
        // inquiry_for: [null , [ Validators.required ] ],
        inquiry_for: [1 ],
        // name: [''],
        address_type : ['0'],
        adhaar_number : [null,[ ClassCareValidatores.pattern(/^\d{12}$/,"Please enter valid  Aadhaar card Number") ,ClassCareValidatores.min(100000000000, "Please enter minimum 12 digits number") ,ClassCareValidatores.max(999999999999, "Please enter maximum 12 digits number") ] ],
        who_adhar : [null],
        payment_status : [null],
        relation : [null],
        assign_user_id : [null],
      })

      // this.inquiryForm.get('inquiry_fees')?.disable()

      this.inquiryForm.get('parent_name')?.valueChanges.subscribe(value => {
        if (value !== this.inquiryForm.get('middle_name')?.value) {
          this.inquiryForm.get('middle_name')?.patchValue(value, { emitEvent: false });
        }
      });
    
      this.inquiryForm.get('middle_name')?.valueChanges.subscribe(value => {
        if (value !== this.inquiryForm.get('parent_name')?.value) {
          this.inquiryForm.get('parent_name')?.patchValue(value, { emitEvent: false });
        }
      });
    }

    // setUrl(url: string) {
    //   return '/' + window.localStorage.getItem("branch") + '/' + url;
    // }

  calculateAge(): void {

    const dob = this.inquiryForm?.value?.date_of_birth

    if (dob) {
      let birthDate

      if (this.id) {
        birthDate = moment(dob, 'YYYY-MM-DD')
      } else {
        birthDate = moment(dob);
      }

      const today = moment();

      const ageYears = today.diff(birthDate, 'years');
      const ageMonths = today.diff(birthDate.add(ageYears, 'years'), 'months');

      const formattedAge = `${ageYears} Years ${ageMonths} Months`;

      this.inquiryForm.controls['age'].setValue(formattedAge);
    }
  }

    getShowFieldData () {
      this.inquiryService.getFieldData().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        this.inquiryFieldData = res.data;
        this.inquiryFieldValidator();
      })
    }

    inquiryFieldValidator(){
      Object.keys(this.inquiryFieldData.format_data_details).forEach((value: any) => {
        if (this.inquiryFieldData.format_data_details[value].required) {
          this.inquiryForm.controls[value]?.setValidators([Validators.required]);
          this.inquiryForm.controls[value]?.updateValueAndValidity();        
        }
      });
    }

    getNotificationSetting () {
      this.inquiryService.getInquiryFeesSetting().pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
        if(res.status || res.data){
          this.isInquirySetting = res.data.collect_inquiry_fees
          // this.isInquirySetting = 0
          if(this.systemSettingFees && this.isInquirySetting && !this.id){
            this.inquiryForm.get('payment_status')?.setValidators([Validators.required]);
            this.inquiryForm.get('payment_status')?.updateValueAndValidity();
          }
        }
      })
    }

  async openFeesPaymentModel(item) {
    const modalRef = this._modalService.open(InquiryFeesModelComponent, {
      // centered: true,
      size: 'lg',
      backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop'
    });

    // Pass data to the modal component
    const data = {
      type : 'add-edit',
      class_id: item.class_id,
      student_name: `${item.last_name} ${item.first_name}`,
      total_fees : this.feesAmount,
      feesDetails : this.feesDetails
    }

    modalRef.componentInstance.inquiryData = data;

    await modalRef.result.then((response: any) => {
      if (response.status) {
        this.processInquirySubmission(response.data);
      }
    })
  }

  processInquirySubmission(paymentData?) {
    this.is_addNotice = true

    let payload = cloneDeep(this.inquiryForm.value);

    if (paymentData) {
      payload = {...payload, ...paymentData}
    } else {
      payload = {...payload, category_fees : []}
    }

    if (this.customInquiry && this.customInquiry.length > 0) {
      this.customInquiry.forEach((field, index) => {
        delete payload[field];
      })

      const custom_field_data = {};
      this.customInquiry.forEach(field => {

        const keyName = `extra_${field.field_name}`;
        const value = this.inquiryForm.value[field.field_name];

        custom_field_data[keyName] = value;
      });
      payload.custom_field_data = custom_field_data
      payload.id = this.id ?? null
    }

    this.inquiryService.saveandUpdate(payload, this.id).subscribe((res: any) => {

      if (res.status) {
        this.is_addNotice = false
        this.toastr.showSuccess(res.message)
        this.router.navigate([this.CommonService.setUrl(URLConstants.INQUIRY_LIST)])
      } else {
        this.toastr.showSuccess(res.message)
        this.is_addNotice = false
      }
    }, (error: any) => {
      this.is_addNotice = false
      this.toastr.showError(error.error.message || error.message)
    })
  }

  //#endregion Private methods
// }

}
