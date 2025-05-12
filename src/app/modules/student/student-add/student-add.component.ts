import {Component, OnInit} from '@angular/core';
import {URLConstants} from 'src/app/shared/constants/routerLink-constants';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {StudentService} from '../student.service';
import {Toastr} from 'src/app/core/services/toastr';
import {HttpClient} from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
// import { CommonService } from '../../common-components/common.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../report/report.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { CommonService } from 'src/app/core/services/common.service';
import { TransportService } from '../../transport-management/transport.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddAttachmentComponent } from '../../academics/add-attachment/add-attachment.component';
import { WebcamModalComponent } from '../webcam-modal/webcam-modal.component';
import { studentShifts } from 'src/app/common-config/static-value';
import { DateFormatService } from 'src/app/service/date-format.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedUserService } from 'src/app/shared/componets/header/shared-user.service';

@Component({
  selector: 'app-student-add',
  templateUrl: './student-add.component.html',
  styleUrls: ['./student-add.component.scss']
})
export class StudentAddComponent implements OnInit {
  //#region Public | Private Variables

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  branchId: any = localStorage.getItem("branch");
  userId:any = localStorage.getItem('user_id')


  apiYear = {
    current_branch_id: [this.branchId]
  }

  apiClass = {
    branch_id: [this.branchId],
    academic_id: 36
  }

  apiBatch = {
    branch_id: this.branchId,
    academic_id: 1,
    class_id: 1,
    user_id: 1
  }

  yearList = []
  yearselected: any

  classList: any[] = []
  classSelected: any

  batchList: any[] = []
  batchSelected: any

  lastShoolList: any[] = []

  lastschoolSelected: any

  academicYearId: any

  submitted: boolean | undefined;
  valid: boolean | undefined;

  addStudent:FormGroup = new FormGroup({})

  academicOpenState :boolean = true
  studentOpenState :boolean = true
  guardianOpenState :boolean = true
  addressOpenState :boolean = true
  profileOpenState :boolean = true
  admissionOpenState :boolean = true
  documentOpenState: boolean = true
  customFieldOpenState :boolean = true

  bloodGroup = [ 
    {id: "A+" ,  name: "A+" },
    {id: "A-" ,  name: "A-" },
    {id: "B+" ,  name: "B+" },
    {id: "B-" ,  name: "B-" },
    {id: "AB+" , name: "AB+" },
    {id: "AB-" , name: "AB-" },
    {id: "O+" ,  name: "O+" },
    {id: "O-" ,  name: "O-" },
  ]
  category :any
  smsNoti = [
    {id: 1, name: "Father's SMS"},
    {id: 2, name: "Mother's SMS"},
    {id: 3, name: "Both"},
  ]
  custom_fields            : any
  type_of_school           : any 
  admission_year           : any
  previous_school_category : any
  oldSchool                : any
  previewUrls: { [key: string]: string | ArrayBuffer | null | undefined } = {};
  controlName: any;
  maxDate: string | undefined;
  is_save : boolean = false
  id : string | null = null
  studentDetail : any

  image       : any
  fatherImage : any
  motherImage : any
  preSchoolId : any
  // is_edit : boolean = false
  inquiryID : string | null = null
  height_types : any = [];
  areaList: any = []
  areaId : any
  admissionTypeField : any
  assignTransport:any = [];
  studentShifts:any = studentShifts

  documentList:any = []
  document_name:any = null
  document_file:any = null
  studentFields : any
  currentUserData : any

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    // public CommonService: CommonService,
    public CommonService: CommonService,
    private studentService: StudentService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: Toastr,
    private httpRequest: HttpClient,
    private validationService: FormValidationService,
    private route: ActivatedRoute,
    private ReportService: ReportService,
    private transportService: TransportService,
    private modalService: NgbModal,
    public  dateFormateService : DateFormatService,
    private sanitizer: DomSanitizer,
    private _sharedUserService : SharedUserService
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.id = this.route.snapshot.paramMap.get('id');
    this.inquiryID = this.route.snapshot.paramMap.get('inquiryID');
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getCurrentUserData()
    this.initForm();
    this.getAcadamicList(this.apiYear)
    this.schoolList()
    this.getAreaList();
    this.getClassList()
    this.getOldSchoolName()
    this.getCategoryList();
    this.studentFieldSettingData();
    if(this.id){
      setTimeout(() => {
        this.getStudentDetails(this.id)
      }, 1000);
    } else if (this.inquiryID) {
      this.getStudentDetailsFromInquiry(this.inquiryID)
    }
    // else{
    //   this.is_edit = true
    // }

    let temp = {
      branch_id: this.branchId
    }
    this.getLastSchool(temp)
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  middleName(event: Event): void {
    const inputElement = event?.target as HTMLInputElement;
    const value = inputElement?.value;
    this.addStudent?.controls['father_name']?.patchValue(value)
    this.addStudent?.controls['middle_name']?.patchValue(value)
  }

  createAndUpdateData(event) {
    if(!event?.id && !event?.name ){
      // this.toastr.showInfo("Enter the name ","Name not Found")
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

  selectionChange(event) {
    this.addStudent?.controls['school']?.patchValue(event?.name)
    this.addStudent?.controls['previous_school_name']?.patchValue(event?.name)
  }
  selectionAreaChange(event) {
    this.addStudent?.controls['area_id']?.patchValue(event?.id)
  }

  onFileSelected(event: Event, controlName: string): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const image64 = e.target?.result as string;

        if(controlName == 'image'){
          this.image = image64 
        }
        else if(controlName == 'fatherImage'){
          this.fatherImage = image64
        }
        else if(controlName == 'motherImage'){
          this.motherImage = image64
        }

        this.addStudent.controls[controlName].patchValue(image64);
      };

      reader.readAsDataURL(file);
    }
  }

  handleChange(event){
    if(this.addStudent.value.sameAddress == 1){ 
      this.addStudent?.controls['permanentAddress']?.patchValue( this.addStudent?.value?.address )
      this.addStudent?.controls['permanentCity']?.patchValue( this.addStudent?.value?.currentCity )
    }
    else if(this.addStudent.value.sameAddress== 0){
      this.addStudent?.controls['permanentAddress']?.patchValue( "" )
      this.addStudent?.controls['permanentCity']?.patchValue( "" )
    }
  }

  calculateAge(): void {
    
    const dob = this.addStudent?.value?.date_of_birth 

    if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        this.addStudent.controls['age'].setValue(age);
    }
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  saveStudent(){
    if (this.addStudent.invalid) {
      this.validationService.getFormTouchedAndValidation(this.addStudent)
      this.toastr.showError("Please fill all the required field")
      this.academicOpenState = true
      this.studentOpenState = true
      this.guardianOpenState = true
      this.admissionOpenState = true
      this.documentOpenState = true
      this.customFieldOpenState = true
      return;
    }

    this.studentCreate()
  }
  studentCreate() {
    this.is_save = true
    const payload = this.addStudent.value

    if(payload?.batch_id?.length > 0) {
      payload.batch_id = payload.batch_id.map(ele => ele.id)
    }
   
    if(this.id){
      payload.academic_year = this.addStudent.getRawValue().academic_year
      // payload.academic_year = this.addStudent.value.admission_year
      payload.class_id      = this.addStudent.getRawValue().class_id 
    }

    if (this.custom_fields && this.custom_fields.length > 0) {
      this.custom_fields.forEach((field, index) => {
        delete payload[field];
      })

      const custom_field_data = {};
      this.custom_fields.forEach(field => {

        const keyName = `extra_${field.field_name}`;
        const value = this.addStudent.value[field.field_name];

        custom_field_data[keyName] = value;
      });
      payload.custom_field_data = custom_field_data
    }
    this.id && (payload.id = this.id)

    this.inquiryID && (payload.inquiry_id = this.inquiryID);

    const adm_year = payload.admission_year
    const year = Number(this.admission_year?.find((year:any)=> year.id == adm_year )?.name)
    payload.admission_year = year
    payload.documents = this.documentList
    

    this.studentService.studentCreate(payload,this.id).subscribe((res: any) => {
      if (res?.status) {

        this.id ? this.toastr.showSuccess('Student Updated successfully') : this.toastr.showSuccess('Student created successfully')

        this.is_save = false
        this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
      }
      else {
        this.toastr.showError(res.message ?? res.errors.studentId[0] )
        this.is_save = false
        if(this.id){
          this.getStudentDetails(this.id)
        }
      }
    },(error:any)=>{
      this.is_save = false
      this.toastr.showError(error.error.message || error.message )
    })
  }

  yearChanged(event: any) {
    this.classList = []
    this.batchList = []
    this.addStudent.controls['class_id'].patchValue(null)
    this.addStudent.controls['batch_id'].patchValue(null)
    this.getClassList()
  }

  classChanged(event: any) {
    this.batchList = []
    this.addStudent.controls['batch_id'].patchValue(null)
    this.addStudent.controls['batch_id'].markAsPristine()
    this.addStudent.controls['batch_id'].markAsUntouched()
    this.getBatchList({
      // academic_year_id: this.addStudent.getRawValue().academic_year,//this.addStudent.value.academic_year,  
      selected_academic_year_id: this.addStudent.getRawValue().academic_year,//this.addStudent.value.academic_year,
      class_id: event.id,
      branch_id: this.branchId,
      user_id: this.userId
    });
  }

  batchChanged(event: any) {
    this.batchSelected = event;
  }

  // Acadamic Year data

  getAcadamicList(param: any) {
    this.studentService.getAcadamicYearList(param).subscribe((res: any) => {
      if (res.status) {
        this.yearList = res.data.map(ele => {
          return {id : ele.id , name:ele.year}
        })
      }
    });
  }

  // ClassList function
  getClassList() {
    const payload = {
      branch_id        : this.branchId,
      // academic_year_id : this.currentYear_id,
      // academic_year_id : this.addStudent.getRawValue().academic_year ,//this.addStudent?.value?.academic_year,
      selected_academic_year_id: this.addStudent.getRawValue().academic_year ,//this.addStudent?.value?.academic_year,
      user_id          : this.userId,
    }
    this.studentService.getClass(payload).subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      }
    });
    // this.getSectionList();
  }

  // Batch List Function
  getBatchList(apiBatch: any) {
    this.studentService.getBatch(apiBatch).subscribe((res: any) => {
      this.batchList = res.data;
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }
  getCategoryList(){
    this.ReportService.getCategoryList().subscribe((res: any) => {
      this.category = res?.data.map((item:any)=>{return {name:item.category, id:item.id}});
    });
  }

  getLastSchool(param) {
    this.studentService.getlastSchool(param).subscribe((res: any) => {
      if (res.status) {
        this.lastShoolList = res.data
      }
    });
  }

  createAndUpdateArea(event) {
    if(!event?.id && !event?.name ){
      alert("Please add Area name in search")
      return
    }
   this.studentService.createUpdateArea( event?.id , event?.name ).subscribe((res:any)=>{
     if(res.status == true){
      event?.id ?  this.toastr.showSuccess("Updated Successfully") : this.toastr.showSuccess("Created Successfully")
       this.getAreaList( event?.name ,event?.id)
     }else{
      alert(res.message);
     }
   },(err:any)=>{
    this.toastr.showError(err.error.message);
  })
  }

  deleteArea(event) {
    this.studentService.deleteArea( event ).subscribe((res:any)=>{
      if(res?.status){
        this.toastr.showSuccess(res?.message)
        this.getAreaList()
      }
   },(err:any)=>{
    this.toastr.showError(err.error.message);
  })
  }

  getFileType(url: string): string {
    if (!url) return 'unknown';
  
    const extension :any= url.split('.').pop()?.toLowerCase();
  
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    } else {
      return 'other';
    }
  }

  deleteDocument(item:any, index:any){
    const wantToDelete = confirm(`Are You Sure ,You want to delete ${item?.document_name} Document`)
    if(!wantToDelete) return 
    if(item.id){
      this.studentService.deleteDocument(item?.id).subscribe((res:any)=>{ 
      } ,(error:any)=>{
        console.log(error);
      })
    }
    this.documentList.splice(index, 1);
  }

  close(){
    this.document_file = null
    this.document_name = null
    this.modalService.dismissAll()
  }

  onFileSelect(event:any){
    let file = event.target.files[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
      if (!allowedTypes.includes(file.type)) {
        this.toastr.showError('Invalid file type! Please select a PDF, JPG, or PNG file.');
        event.target.value = ''; 
        return;
      }
  
      if (file.size > 1048576) {
        this.toastr.showError('File size should not exceed 1MB.');
        event.target.value = '';
        return;
      }
    }
    this.document_file = file;
  }

  handleSave(){
    if(this.document_name == null){
      return this.toastr.showError("Please enter document name")
    }

    if(this.document_file == null){
      return this.toastr.showError("Please select document file")
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const image64 = e.target?.result as string; // Base64 string

      const url = URL.createObjectURL(this.document_file); // Blob URL
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url); // Safe URL for Angular

      this.documentList.push({
        document_name: this.document_name, 
        attachment_url: safeUrl,
        base64: image64,
        file_name: this.document_file.name,
        create_date: new Date().toLocaleString()
      });

      this.close();
    };

    reader.readAsDataURL(this.document_file);
  }


  openVerticallyCentered(filterMdl: any) {
    this.modalService.open(filterMdl, { centered: true, windowClass: "filter-modal" });
  }

  studentFieldSettingData()
  {
    this.studentService.studentFieldSettingData().subscribe((res:any)=>{      
        this.studentFields = res?.data
        this.studentFieldValidator();
    });
  }

  studentFieldValidator() {
    Object.keys(this.studentFields.format_data_details).forEach((value: any) => {
      if (this.studentFields.format_data_details[value].required) {
        this.addStudent.controls[value]?.setValidators([Validators.required]);
        this.addStudent.controls[value]?.updateValueAndValidity();        
      }
    });
    if(this.id){
      this.addStudent.controls['admission_form_number'].clearValidators();
      this.addStudent.controls['admission_form_number'].updateValueAndValidity();
    }
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addStudent = this.fb.group({
      // name: [null],
      academic_year:[ this.currentYear_id ,  [] ],
      class_id:[null , [] ],
      batch_id:[null , [] ],
      studentId:[null],
      uidNo:[null],
      rollno : [null],
      hall_ticket_SID_number:[null],
      first_name:[ "" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter your first name" ) ] ] ,
      middle_name : ["" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter your middle name" ) ]],
      last_name: [ "" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter your last name" ) ] ],

      // secondary_first_name  : [ "" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter valid Name" ) ] ] ,
      // secondary_middle_name : [ "" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter valid Name" ) ] ] ,
      // secondary_last_name   : [ "" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter valid Name" ) ] ] ,

      secondary_first_name  : [ "" ] ,
      secondary_middle_name : [ "" ] ,
      secondary_last_name   : [ "" ] ,

      student_display_name: ["", [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter valid Student Name" ) ]],
      // phone_number : [ null, [ ClassCareValidatores.pattern(/^\d{10}$/ , "Please enter minimum 10 digits number") ] ],
      phone_number :      [ null, [ ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
      studentWhatsappNo : [ null, [ ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
      email:[null , [ Validators.email ]],
      date_of_birth :[null],
      age: [null],
      bloodGroup : [null],
      birthPlace : [null ],
      birth_taluka : [null],
      birth_district : [null],
      religion : [null],
      nationality : [null],
      categories : [null],
      cast : [null],
      sub_cast : [null],
      // adhaar_number : [null , [ ClassCareValidatores.pattern(/^\d{12}$/ , "Please enter minimum 12 digits number") ] ],
      adhaar_number : [null , [ ClassCareValidatores.pattern(/^\d{12}$/,"Please enter valid  Aadhaar card Number") ,ClassCareValidatores.min(100000000000, "Please enter minimum 12 digits number") ,ClassCareValidatores.max(999999999999, "Please enter maximum 12 digits number") ] ],
      gender : ["", [ Validators.required ] ],
      // mother_tongue : [null],
      father_name : [ "" , [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u,'Please enter valid Father Name') ] ],
      father_number: [null , [ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number")] ],
      father_occupation : [null],
      father_education : [null],
      mother_name : [null ,   [ ClassCareValidatores.pattern(/^[\p{L}\p{M} ]*$/u , "Please enter valid Mother Name" ) ] ],
      mother_number : [null , [ ClassCareValidatores.pattern(/^\d{10}$/,"Please enter valid Number") , ClassCareValidatores.min(1000000000, "Please enter minimum 10 digits number") ,ClassCareValidatores.max(9999999999, "Please enter maximum 10 digits number") ] ],
      mother_occupation: [null],
      mother_education : [null],
      parentEmail : [null , [ Validators.email ] ],
      mother_email : [null , [ Validators.email ] ],
      send_sms_number: [null],
      parentWhatsappNo : [null ],
      address:[null],
      currentCity: [null],
      permanentAddress : [null],
      sameAddress : [ 0 ],
      permanentCity : [null],
      student_fees_date : [null],
      create_at : [ new Date().toISOString().substring(0, 10),[] ],
      admission_date:[ new Date().toISOString().substring(0, 10),[] ],
      admission_year : [this.currentYear_id ],
      previous_school_name : [null],
      previous_school_category : [null],
      school: [null],
      previous_school_city_village : [null],
      type_of_school : [null],
      type_of_old_school : [""],
      percentage:[null],
      reference : [null],
      siblingInfo : [null],
      remark : [null],
      old_new : [ 1 ],
      rightToEducation : [ 0 ],
      status :[ 1 ],
      image : [null],
      fatherImage : [null],
      motherImage : [null],
      pen_no : [null,[ ClassCareValidatores.pattern('^[a-zA-Z0-9]+$',"Invalid PEN Number") ]],
      apaar_id:[null],
      weight : [null,[ ClassCareValidatores.pattern('^[0-9.]+$',"Invalid weight") , ClassCareValidatores.min(0, "Invalid weight")]],
      height : [null,[ Validators.pattern('^[0-9.]+$') , Validators.min(0)]],
      height_type : ['1'],
      ews : [false],
      area_id : [null],
      transport_facility : [false],
      student_shift: [0,[Validators.required]],
      admission_form_number:['',[ClassCareValidatores.pattern('^0*[1-9][0-9]*$', "Please enter a valid number")] ]
      // is_web_request : 1
    })
    if(this.id){
      this.addStudent.controls['academic_year'].disable()
      this.addStudent.controls['class_id'].disable()

      this.addStudent.controls['admission_form_number'].clearValidators();
      this.addStudent.controls['admission_form_number'].updateValueAndValidity();
    }
  }
  schoolList(){
    this.studentService.getSchoolDetails().subscribe((res:any)=>{
      this.admission_year = res?.data?.admission_year
      this.custom_fields =  res?.data?.custom_fields
      this.previous_school_category = res?.data?.previous_school_category
      this.type_of_school = res?.data?.type_of_school
      this.height_types = res?.data?.height_types

      this.admission_year = this.admission_year.map(res=>{
        return{
          ...res,
          name : res?.year
        }
      })
      this.custom_fields = this.custom_fields.map(res=>{
        return{
          ...res,
          name : res?.field_title
        }
      })
      if(this.custom_fields){
        this.custom_fields.forEach((field, index) => {
          // if(field.field_name == 'Admission_Type')
          // {
          //   this.admissionTypeField = field;
          // }
          let defaultValue = '';          
          if (field?.field_type === 'dropdown' && field?.values?.length > 0) { 
            defaultValue = field.values[0];
          }          
          this.addStudent.addControl( field?.field_name, new FormControl(defaultValue, field?.required == 1 ? [Validators.required] : [] ) );
        })
      }
    })
  }
  getOldSchoolName( name:any = "" ){
    this.studentService.getOldSchoolName().subscribe((res:any)=>{ 
      this.oldSchool = res?.data
      if(name){
        this.preSchoolId = this.oldSchool?.find(ele=>ele.name == name )?.id
        this.addStudent.controls['school'].patchValue(name)
        this.addStudent.controls['previous_school_name'].patchValue(name)
      }
    })
  }
  getStudentDetails(id:any){
    this.studentService.getStudentDetails(id).subscribe((res: any) => {
      if (res.status) {
        // this.studentDetail = res.data

        if(res?.data){

          this.getBatchList({
            academic_year_id: this.addStudent.getRawValue().academic_year , // this.addStudent.value.academic_year,
            class_id: res?.data?.student_data?.class_id,
            branch_id: this.branchId,
            user_id: this.userId
          });
          res.data.student_data.academic_year =  res.data.student_data.academic_year_id
          if(this.currentUserData?.isMultipleBatchAllow == 1) {
            res.data.student_data.batch_id = res.data.multiple_batch.map(ele => {
              return {
                name : ele.name, 
                id : ele.batch_id
              }
            })
          } else {
            res.data.student_data.batch_id = res.data.batch.batch_id
          }
          res.data.student_data.previous_school_name =  res.data.student_data.school
          res.data.student_data.parentWhatsappNo =  Number( res.data.student_data.parentWhatsappNo)
          res.data.student_data.old_new          =  Number( res.data.student_data.old_new)
          res.data.student_data.rightToEducation =  Number( res.data.student_data.rightToEducation)

          res.data.student_data.admission_year   = Number( res?.data?.student_data?.admission_year )
          if(res.data.student_data.admission_year.toString()?.length >= 4 ){
            const yearID = this.admission_year?.find((year:any)=> year.name == res.data.student_data.admission_year )?.id
            res.data.student_data.admission_year = yearID
          }
          this.addStudent.controls['admission_year'].setValue(res?.data?.student_data?.admission_year)

          res.data.student_data.rollno = res.data.student_data.student_roll_number.rollno
          if(res?.data?.student_data?.custom_field_data){
            for (let key in res?.data?.student_data?.custom_field_data) {
              if (key.startsWith("extra_")) {
                  const newKey = key.replace("extra_", "");
                  res.data.student_data[newKey] = res?.data?.student_data?.custom_field_data[key];
              }
            }
          }
          // if(res?.data?.student_data?.admission_year){
          //   res.data.student_data.admission_year = this.admission_year?.find(ele => ele?.name == res?.data?.student_data?.admission_year)?.id
          // }

          if(res?.data?.student_data?.sameAddress == 1){
            res.data.student_data.permanentAddress = res.data.student_data.address
            res.data.student_data.permanentCity = res.data.student_data.currentCity
          }

          if(res?.data?.student_data?.image){
            this.image = res?.data?.student_data?.image
            res.data.student_data.image = null
          }
          if (res?.data?.student_data?.fatherImage){
            this.fatherImage = res?.data?.student_data?.fatherImage
            res.data.student_data.fatherImage = null
          }
          if (res?.data?.student_data?.motherImage){
            this.motherImage = res?.data?.student_data?.motherImage
            res.data.student_data.motherImage = null
          }
          if (!res?.data?.student_data?.admission_date && !this.id){
            res.data.student_data.admission_date = new Date().toISOString().substring(0, 10);
          }
           
          this.preSchoolId = this.oldSchool?.find(ele => ele?.name == res?.data?.student_data?.school)?.id
          this.areaId      = this.areaList?.find(ele => ele?.id == res?.data?.student_data?.area_id)?.id
          // this.is_edit = true
          if(res.data.student_data?.height_type){
            res.data.student_data.height_type = res.data.student_data?.height_type.toString();
          }
          res.data.student_data.student_shift   = Number( res?.data?.student_data?.student_shift )
          this.documentList = res?.data?.student_data?.documents
          
          this.setStudentDetail(res?.data?.student_data)
        }
      }
    });
  }

  setStudentDetail(data:any){
    data.transport_facility = data?.transport_facility ?? data?.transportation_requirment
    this.addStudent.patchValue(data)

  }

  getStudentDetailsFromInquiry(inquiryID) {
    this.studentService.getInquiryStudentData(inquiryID).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      if (res.status) {
        res.data.father_name = res.data.parent_name;
        res.data.father_number = res.data.parent_mobile;
        res.data.parentWhatsappNo = res.data.watsapp_number;
        res.data.parentEmail = res.data.parent_email;
        res.data.status = 1
        res.data.academic_year =  res.data.academic_year_id
        const dateObject = new Date( res.data.date_of_birth )
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        res.data.date_of_birth = formattedDate


        res.data.email        = res?.data?.student_email
        res.data.phone_number = Number(res?.data?.student_mobile ) || null

        res.data.sameAddress = +res?.data?.address_type

        res.data.currentCity = res.data.current_city
        res.data.address = res.data.address;

        if(res?.data?.address_type == 0){
          res.data.permanentCity = res.data.permanent_city
          res.data.permanentAddress = res.data.permanent_address;
        }

        res.data.create_at = new Date().toISOString().substring(0, 10)

        if (res?.data?.custom_field_data) {
          for (let key in res?.data?.custom_field_data) {
            if (key.startsWith("extra_")) {
              const newKey = key.replace("extra_", "");
              res.data[newKey] = res?.data?.custom_field_data[key];
            }
          }
        }

        this.getBatchList({
          academic_year_id : this.addStudent.getRawValue().academic_year, // this.addStudent.value.academic_year,
          class_id: res?.data?.class_id,
          branch_id: this.branchId,
          user_id: this.userId
        });

        res.data.transport_facility = res?.data?.transport_facility ?? res?.data?.transportation_requirment 
        res.data.religion = res?.data?.religion
        res.data.sub_cast = res?.data?.sub_cast
        res.data.cast = res?.data?.cast
        this.addStudent.patchValue(res.data);
        const previousSchool = this.oldSchool?.find(ele => ele?.name == res?.data?.present_school);
        this.preSchoolId = previousSchool?.id
        this.addStudent?.controls['previous_school_name']?.patchValue(previousSchool?.name)
        this.addStudent?.controls['school']?.patchValue(previousSchool?.name)
      }
    })
  }

  getAreaList(name:any="" , id : any = null){
    let data = {
      student_id : this.id
    }
    this.studentService.getAreaList(data).subscribe((resp: any) => {
      this.assignTransport = resp.data.transport
      this.areaList = resp.data.transportAreaList
      
      if(name){
        this.areaId = this.areaList?.find(ele=>ele?.name == name )?.id
        
        this.addStudent?.controls['area_id']?.patchValue(this.areaId)
      }
    });
  }

  openWebcamModal(controlName){
    const modalRef = this.modalService.open(WebcamModalComponent,{
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.controlName = controlName;
    modalRef.result.then((response: any) => {
      if(response?.image64) {
        if(controlName == 'image'){
          this.image = response?.image64 
        }
        else if(controlName == 'fatherImage'){
          this.fatherImage = response?.image64
        }
        else if(controlName == 'motherImage'){
          this.motherImage = response?.image64
        }
        this.addStudent.controls[controlName].patchValue(response?.image64);
      }
    })
  }

  getCurrentUserData () {
    this._sharedUserService.getSubscriptionDetails().subscribe((res)=>{
      this.currentUserData = res
    })
  }
  
  getCustomFieldOrder(item:any, type:any){   
    return this.studentFields?.format_data_details[item.field_name]?.group_name == type;
  }

  getCustomFieldsWithoutOrder(item:any){
      const keys = Object.keys(this.studentFields?.format_data_details);
      return !keys.includes(item.field_name)
  }
}
