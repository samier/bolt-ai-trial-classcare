import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { HomeworkService } from '../homework.service';
import { FormControl, FormBuilder, FormGroup, Validators, FormArray, } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-add-notice',
  templateUrl: './add-notice.component.html',
  styleUrls: ['./add-notice.component.scss']
})
export class AddNoticeComponent implements OnInit {

  //#region Public | Private Variables
  branch_id      : any = window.localStorage.getItem('branch');
  user_id        : any = window.localStorage.getItem('user_id');
  user:any = window.localStorage.getItem('me');
  
  currentYear_id : any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  addNoticeForm  : FormGroup = new FormGroup({})
  attachmentType : string="";
  id : any
  is_sendNewL : boolean  = false
  is_sendL    : boolean  = false
  is_send     : boolean  = false

  $destroy: Subject<void> = new Subject<void>();

  notice : any[] = [
    {name:"School Notice"       , id:1 },
    {name:"Notice for Employee" , id:2 },
    {name:"Notice for Class"    , id:3 },
  ]
  roles    : any[] = [];
  faculty  : any[] = [];
  sections : any[] = []
  classes  : any[] = [];
  batches  : any[] = [];
  students : any[] = [];
  faculties: any[] = [];
  users    : any[] = [];
  showData : any
  uploadedFiles : any
  deleted_id : any = []
  // flag: boolean = false;
  message = {
    send_father   : false,
    send_mother   : false,
    send_student  : false
  }

  flag  : boolean = false;
  type2 : boolean = false
  type3 : boolean = false
  
  renderDataF : any
  renderDataS : any 

  NOTICE_SMS_TEMPLATE_IDS :any[] = [
    '1707172482855233056',
    '1707172311856327768',
  ];
  template :any
  is_send_sms : boolean = true

  nav     : any
  payload : any
  userDetail:any;
  
  // searchText : any

  @ViewChild('file') fileSelect!: ElementRef;


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private route: ActivatedRoute,
    public homeworkService : HomeworkService,
    private formBuilder: FormBuilder,
    private validationService: FormValidationService,
    private toastr: Toastr,
    private router: Router,
    private _modalService: NgbModal,
  ) 
  {
    this.id = this.route?.snapshot?.paramMap?.get('id');

    if(this.id){
      const params = this.route?.snapshot?.routeConfig?.path;
      let parts = params?.split('/')[0].split('-')[1];
      this.attachmentType = parts ?? ''
    }
    else{
      const params = this.route?.snapshot?.routeConfig?.path;
      let parts = params?.split('-')[1];
      this.attachmentType = parts ?? ''
    }
  }
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.flag =true
    this.userDetail = JSON.parse(this.user);
    this.formInit()
    this.getSectionList()
    // this.getClass()
    this.getFacultyList()
    // this.getRoleList()
    if(this.id){
      this.getNoticeById(this.id)
    } else {
      this.getClass()
    }
    this.getTemplate()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  // HTML => BTN => SEND & NEW

  // region SEND BTN
  send_New(modalName:any = null){
    this.apiPayLoad(false,modalName)
  }
  send(modalName:any = null){
    this.apiPayLoad(true,modalName)
  }
  async apiPayLoad( nav : boolean ,modalName : any){

    if(this.addNoticeForm.invalid){
      this.validationService.getFormTouchedAndValidation(this.addNoticeForm)
      this.is_sendNewL = false
      this.is_sendL    = false
      return
    }

    const fileSize: number = this.getTotalSize()
    if (fileSize > 8) {
      this.toastr.showError('Total file size cannot exceed more than 8 MB.')
      return 
    }

    nav ? this.is_sendL = true : this.is_sendNewL = true
    
    const payload : any = {

      branchId       : this.branch_id ,
      academicYear   : this.currentYear_id ,
      attachmentType : this.attachmentType ,

      title          : this.addNoticeForm?.value?.tittle ,
      description    : this.addNoticeForm?.value?.description  ,
      file           : [],

      noticeType     : this.addNoticeForm?.getRawValue()?.noticeType,

      deleted_id     : this.deleted_id?.length > 0 ? this.deleted_id : [] ,

      send_student_sms : 0  // sms will send or not
    }

    let facultyId = []
    if( this.addNoticeForm?.getRawValue()?.noticeType == 2){
      // facultyId = this.getID(this.addNoticeForm?.value?.facultyId) ?? []

      facultyId = this.renderDataF.filter(data=>data.checked == true).map(data=>data.id) ?? []
      
      // if(this.addNoticeForm?.value?.roleId?.length > 0 && facultyId.length == 0 ){
      //   this.toastr.showError("Please Select the Employees")
      // }
    }

    let classId = []
    if(this.addNoticeForm?.getRawValue()?.noticeType == 3){
      classId = this.getID(this.addNoticeForm?.value?.classId) ?? []
    }

    let batchId = []
    if(this.addNoticeForm?.getRawValue()?.noticeType == 3){
      batchId = this.getID(this.addNoticeForm?.value?.batchId) ?? []
    }
    
    let studentId = []
    if(this.addNoticeForm?.getRawValue()?.noticeType == 3){
      // studentId = this.getID(this.addNoticeForm?.value?.studentId) ?? []

      studentId = this.renderDataS?.filter(data=>data.checked == true).map(data=>data.id) ?? []
    }
    
    if(this.addNoticeForm?.getRawValue()?.noticeType == 2){
      payload.role_id   = this.getID(this.addNoticeForm?.value?.roleId); 
      payload.facultyId = facultyId
    }
    else if ( this.addNoticeForm?.getRawValue()?.noticeType == 3) {
      payload.section_id = this.addNoticeForm?.value?.section_id
      payload.classId    = classId
      payload.batchId    = batchId
      payload.studentId  = studentId
    }

    const file = this.addNoticeForm?.value?.upload;
    
    if (file) {
      for (let index = 0; index < file?.length; index++) {
        const element = file[index];
        const imagebase64 = await this.convertToBase64(element);
        const data = {
          fileName    : element?.name,
          imagebase64 : imagebase64,
        }
        payload?.file?.push(data);
      }
    }

    if(this.addNoticeForm?.getRawValue()?.noticeType == 2){
      if(this.renderDataF?.length == 0){

        const roleName = this.roles?.find(
          (r: any) => r?.id == this.addNoticeForm.value?.roleId,
          // (r: any) => r?.id == this.addNoticeForm?.value?.roleId
        )?.name;

        this.toastr.showInfo("No Employee Found for Perticular roll","Employee not Found",)
        this.is_sendNewL = false
        this.is_sendL    = false
        
        return
      }
    }
    else if(this.addNoticeForm?.getRawValue()?.noticeType == 3){
      if(this.addNoticeForm?.value?.batchId?.length == 1){
        if(this.renderDataS?.length == 0){
          this.toastr.showInfo("Student not Found for Perticular Batch","Student not Found")
          this.is_sendNewL = false
          this.is_sendL    = false
          return
        }
      }
    }
    
    !this.id && this.addNoticeForm?.getRawValue()?.noticeType != 2 && this._modalService.open(modalName);
    
    this.payload = payload 
    this.nav     = nav
    this.addNoticeForm?.getRawValue()?.noticeType == 2 && this.addNotice(payload, nav)

    this.id && this.addNotice(payload, nav)
  }
  
  sendNotice(){

    const payload = {
      send_student_sms: (this.message.send_student || this.message.send_father || this.message.send_mother) ? 1 : 0,           // will send sms or not
      student_send_on_sms: 1,       // only type sms will send
      send_student: this.message.send_student ? 1 : 0,
      send_father: this.message.send_father ? 1 : 0,
      send_mother: this.message.send_mother ? 1 : 0,
      student_sms_template_id: this.template[1].id,
      parent_sms_template_id: this.template[0].id,
    }
    
    this.addNotice( {...this.payload, ...payload} , this.nav  )
  }

  addNotice(payload: any, nav: boolean) {
    this.is_send = true

    this.homeworkService.addUpdateNotice(payload,this.id).subscribe((res: any) => {

      if (res?.status) {
        this.closeModel()
        if (this.id) {
          this.toastr.showSuccess(`${this.attachmentType.charAt(0).toUpperCase() + this.attachmentType.slice(1).toLowerCase()} updated Successfully`);
        }
        else {
          this.toastr.showSuccess(`${this.attachmentType.charAt(0).toUpperCase() + this.attachmentType.slice(1).toLowerCase()} created Successfully`);
        }
        if (nav) {
          this.is_sendNewL = false
          this.is_sendL = false
          this.is_send = false
          this.router.navigate([this.homeworkService.setUrl(4, this.attachmentType)]);
        }
        else {
          this.reset()
        }
        this.is_sendL = false
        this.is_sendNewL = false
        this.is_send = false
      }
      else {
        this.closeModel()
        this.is_sendL = false
        this.is_send = false
        this.is_sendNewL = false
        this.toastr.showError(res?.message);
      }
    },(error)=>{
      this.is_sendL = false
      this.is_send = false
      this.is_sendNewL = false
      this.toastr.showError("We don't have found any employee or students to send notice.");
    })
    // this.is_sendL    = false
    // this.is_send     = false
    // this.is_sendNewL = false
  }
  reset() {
    this.addNoticeForm.reset()

    if(this.userDetail.user_type != 0 && this.userDetail.user_type != 2){
      this.addNoticeForm.controls['noticeType'].patchValue(3)
    }else{
      this.addNoticeForm.controls['noticeType'].patchValue(1)
    }
    this.addNoticeForm.controls['tittle'].patchValue("")
    this.addNoticeForm.controls['description'].patchValue("")
    this.addNoticeForm.controls['upload'].patchValue(null)

    this.addNoticeForm.controls['roleId'].patchValue("")
    // this.addNoticeForm.controls['facultyId'].patchValue([])

    this.addNoticeForm.controls['classId'].patchValue(null)
    this.addNoticeForm.controls['batchId'].patchValue([])
    // this.addNoticeForm.controls['studentId'].patchValue([])

    this.getFacultyList()

    this.is_sendL = false
    this.is_sendNewL = false
    this.is_send     = false
  }
  getNoticeById(id:number){
    this.homeworkService.showNotice(id).subscribe((res:any)=>{
      if(res.status){

        this.showData = res?.data

        const faculty = this.showData?.faculty?.map( (obj:any) => {
          return {
            ...obj,
            name:obj?.full_name
          }
        })

        if(this.showData?.notice_type == null || this.showData?.notice_type == "" ){
          this.showData.notice_type = 3
        }

        this.showData.faculty = faculty
        this.uploadedFiles    = this.showData?.notes_attachments

        if(this.showData?.payload){
          this.addNoticeForm.patchValue({
  
            tittle         : this.showData?.payload?.title ,
            description    : this.showData?.payload?.description,
            noticeType     : this.showData?.payload?.noticeType ,
          })
        }
        
        if( this.showData?.notice_type == 2){
          this.type2 = true

          this.addNoticeForm?.controls['roleId']?.setValidators([Validators.required]);
          this.addNoticeForm?.controls['roleId']?.updateValueAndValidity();

          // this.addNoticeForm?.controls['classId'].clearValidators();
          // this.addNoticeForm?.controls['classId'].updateValueAndValidity();
          
          // if( this.showData?.role_id == null){
          //     this.showData.role_id = ""
          //     this.showData.payload.role_id = "" 
          // }
          this.getRoleList()
        }
        
        else if (this.showData?.notice_type == 3) {
          this.type3 = true

          // this.addNoticeForm?.controls['classId'].setValidators([Validators.required]);
          // this.addNoticeForm?.controls['classId'].updateValueAndValidity();

          this.addNoticeForm?.controls['roleId']?.clearValidators();
          this.addNoticeForm?.controls['roleId']?.updateValueAndValidity();

          if (this.showData?.payload?.section_id == null) {
            this.showData.payload.section_id = ""
          }else if(typeof(this.showData?.payload?.section_id) == 'number'){
            let section = this.sections.filter((el:any) => el.id == this.showData?.payload?.section_id).map((x:any) => {
              return {id:x.id, name:x.name}
            });
            this.addNoticeForm.controls['section_id'].patchValue(section)
          }else{
            this.addNoticeForm.controls['section_id'].patchValue(this.showData?.payload?.section_id)
          }
          // this.getClass()
        }
      }
    })
  }
  download(url: string) {
    window.open(url, '_blank')
  }

  onNoticeChange(){

    this.renderDataF = []
    this.renderDataS = []

    // 2 => FACULTY , 
    // 3 => CLASS

    // this.flag = true

    if(this.addNoticeForm?.value?.noticeType == 2){
      // this.addNoticeForm?.controls['section_id'].clearValidators();
      // this.addNoticeForm?.controls['section_id'].updateValueAndValidity();
      this.addNoticeForm?.controls['roleId']?.setValidators([Validators.required]);
      this.addNoticeForm?.controls['roleId']?.updateValueAndValidity();

      // this.addNoticeForm?.controls['classId'].clearValidators();
      // this.addNoticeForm?.controls['classId'].updateValueAndValidity();
      this.getRoleList()
      // this.getUserList()

    }
    else if(this.addNoticeForm?.value?.noticeType == 3){
      // this.addNoticeForm?.controls['section_id'].setValidators([Validators.required]);
      // this.addNoticeForm?.controls['section_id'].updateValueAndValidity();

      // this.addNoticeForm?.controls['classId'].setValidators([Validators.required]);
      // this.addNoticeForm?.controls['classId'].updateValueAndValidity();
      this.getClass()
      this.onBatchChange()

      this.addNoticeForm?.controls['roleId']?.clearValidators();
      this.addNoticeForm?.controls['roleId']?.updateValueAndValidity();
      
    }
  }
  onFacultyChange(){
  }

  onSectionChange(){
    this.classes     = []
    this.batches     = []
    this.renderDataS = []

    this.addNoticeForm.controls['classId'].patchValue([])
    this.addNoticeForm.controls['batchId'].patchValue([])
    this.addNoticeForm?.value?.section_id.length > 0 ? this.getClass() : null
    // this.getClass()
  }

  onClassChange(){
    this.batches  = []
    this.addNoticeForm?.controls['batchId']?.patchValue([])
    this.renderDataS = []
    // this.addNoticeForm?.controls['studentId']?.patchValue([])
    if(this.addNoticeForm.value.classId?.length > 0) {
      this.getBatchList()
    }
  }
  onBatchChange(){
    // this.students = []
    this.renderDataS = []
    // this.addNoticeForm?.controls['studentId']?.patchValue([])
    this.getStudent()
  }
  
  onStudentChange(){
  }

  // HTML => ROLE SELECT FUNCTION 
  onRoleChange(){
    this.renderDataF = []
    
    // this.addNoticeForm?.controls['facultyId'].setValidators([Validators.required]);
    // this.addNoticeForm?.controls['facultyId'].updateValueAndValidity();

    if( this.addNoticeForm?.value?.roleId == "" ){

      // this.addNoticeForm?.controls['facultyId'].clearValidators();
      // this.addNoticeForm?.controls['facultyId'].updateValueAndValidity();

      this.flag = true
    }

    // this.addNoticeForm?.controls['facultyId']?.patchValue([])
    if(this.addNoticeForm.value.roleId?.length > 0 ){ 
      this.getUserList() 
    }
  }

  // HTML => USER SELECT FUNCTION 
  onUserChange(){
  }

  // EDIT TIME DELETE FILES
  
  deleteFile(id:number){
    this.deleted_id.push(id)
    this.uploadedFiles = this.uploadedFiles?.filter( item => item.id != id)
  }

  // HTML => FILE SELECT FUNCTION 
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input?.files as FileList;
  
    if (files && files?.length > 0) {
      let fileListArray: File[] = [];
      Array.from(files).forEach(file => {
        fileListArray.push(file);
      });
  
      // Ensure that 'upload' form control is not null
      const uploadControl = this.addNoticeForm?.get('upload');
      if (!uploadControl) {
        console.error('Form control "upload" is not available.');
        return;
      }
  
      // Handle file array logic
      if (fileListArray?.length > 0 && this.addNoticeForm.value?.upload?.length > 0) {
        const existingFiles = this.addNoticeForm.value.upload as File[];
        const combinedArray = fileListArray.concat(existingFiles);
  
        // Create a unique file list
        const uniqueFiles = Array.from(new Set(combinedArray.map(file => file.name)))
          .map(name => combinedArray.find(file => file.name === name) as File);
  
        // Update form control
        uploadControl.patchValue(uniqueFiles);
      } else {
        uploadControl.patchValue(fileListArray);
      }
  
      // Clear file input
      this.fileSelect.nativeElement.value = "";
  
      // Check file size
      const fileSize: number = this.getTotalSize();
      if (fileSize > 8) {
        return this.toastr.showError('Total file size cannot exceed more than 8 MB.');
      }
    }
  }

  removeSelectedFile(index) {
    this.addNoticeForm?.value?.upload?.splice(index,1)
    this.addNoticeForm?.controls?.['upload']?.patchValue(this.addNoticeForm.value.upload)
    const fileSize:number  = this.getTotalSize()
    if (fileSize > 8) {
      return  this.toastr.showError('Total file size cannot exceed more than 8 MB.')
    }
  }
  
  selectAll(event){
    let noticeType = this.addNoticeForm?.getRawValue()?.noticeType
    let isSelAll = this.isSelectAll
    if(noticeType == 2) {
      this.renderDataF = this.renderDataF.map(data => {
        return { ...data, checked: !isSelAll};
      });
    }
    if(noticeType == 3) {
      this.renderDataS = this.renderDataS.map(data => {
        return { ...data, checked: !isSelAll };
      });
    }
  }

  get isSelectAll() {
    let noticeType = this.addNoticeForm?.getRawValue()?.noticeType

    if(noticeType == 2) {
      return this.renderDataF?.filter(item => item.checked)?.length === this.renderDataF?.length;
    } else if(noticeType == 3) {
      return this.renderDataS?.filter(item => item.checked)?.length === this.renderDataS?.length;
    } else {
      return false
    }
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getID(obj:any){
    if(!obj || obj?.length ==0 ){
      return
    }
    const ids = obj?.map(obj => obj.id) ?? []
    return ids
  }

  // 8MB CHECKING 
  getTotalSize() {
    if (this.addNoticeForm?.value?.upload?.length > 0) {
      const size = this.addNoticeForm?.value?.upload?.map((item: any) => item?.size)?.reduce((acc: number, item: any) => acc + item);
      return size / 1000 / 1000 
    } else {
      return 0
    }
  }

  // FILE => BASE64
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader?.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader?.result?.toString().split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64.'));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
  
  // FORM INIT 
  formInit(){
    this.addNoticeForm = this.formBuilder.group({

      tittle         : [ "", [ Validators.required ] ],
      description    : [ "", [ Validators.required ] ],
      upload         : [ null ] ,

      noticeType     : [ 1,  [ Validators.required ] ],

      roleId         : [ [] ],
      // facultyId      : [ [] ],
      section_id      : [ "" ] ,
      classId        : [ null ],
      batchId        : [ [] ] , 
      // studentId      : [ [] ],
      searchText     : [ "" ]
    })

    // this.addNoticeForm?.valueChanges?.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
    //   this.addNoticeForm?.controls['facultyId']?.markAsPristine();
    //   this.addNoticeForm?.controls['facultyId']?.markAsUntouched();
    // })

    this.addNoticeForm?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
      this.addNoticeForm?.controls['roleId']?.markAsPristine();
      this.addNoticeForm?.controls['roleId']?.markAsUntouched();

      this.addNoticeForm?.controls['classId']?.markAsPristine();
      this.addNoticeForm?.controls['classId']?.markAsUntouched();
      
      this.addNoticeForm?.controls['batchId']?.markAsPristine();
      this.addNoticeForm?.controls['batchId']?.markAsUntouched();
    })
    // this.addNoticeForm?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
    //   this.addNoticeForm?.controls['studentId']?.markAsPristine();
    //   this.addNoticeForm.controls['studentId']?.markAsUntouched();
    // })

    
    if(this.userDetail.user_type != 0 && this.userDetail.user_type != 2){
      this.notice = [
        {name:"Notice for Class"    , id:3 },
      ]
    }
    this.addNoticeForm.controls['noticeType'].patchValue(3)
  }

  getSectionList(){
    this.homeworkService.getSectionList({ branch: this.branch_id }).subscribe((res:any)=>{
      if(res?.status){
        this.sections = res?.data;
        if(!this.id){
          const sections = this.sections.map((el:any) => {
            return {id: el.id, name: el.name}
          })
          this.addNoticeForm?.controls['section_id']?.patchValue(sections);
        }
        setTimeout(() => {
          this.getClass()
        }, 500);
      }
    })
  }

  // CLASS DROPDOWN API
  getClass(){
    const payload = {
      academic_year_id  : this.currentYear_id ,
      branch_id         : this.branch_id ,
      user_id           : this.user_id ,
      section_id : this.addNoticeForm?.value?.section_id ? this.addNoticeForm?.value?.section_id.map((el) => el.id) : []
    }
    this.homeworkService.getClassV2(payload,this.user_id).subscribe((res: any) => { 
      if(res?.status){
        this.classes =  res?.data
        if(!this.id && this.classes?.length > 0){
          this.addNoticeForm?.controls['classId']?.patchValue(this.classes)
          this.getBatchList()
        }else if(this.id && !this.type3 && this.classes?.length > 0){
          this.addNoticeForm?.controls['classId']?.patchValue(this.classes);
          this.getBatchList()
        }
        else if(this.id && this.showData?.payload?.classId && this.type3){
          const classIds = this.showData?.payload?.classId?.map((c: any)=> {
            const cls = this.classes?.find((f: any)=> f?.id==c);
            return {id: cls?.id, name: cls?.name};
          })
          this.addNoticeForm.controls['classId'].patchValue( classIds ?? [] )
          this.showData?.payload?.batchId ? this.getBatchList() : this.type3 = false
          // // if(this.id && !this.type3){
          //   // this.addNoticeForm.controls['noticeType'].disable()
          // }
        }
        // if( this.addNoticeForm?.value?.classId?.length > 0) {
        //   this.getBatchList()
        // }
      }
    } )
  }
  getBatchList(){
    // const payload = { 
    //   academic_id       : this.currentYear_id,
    //   academic_year_id  : this.currentYear_id,
    //   branch_id         : this.branch_id,
    //   class_id          : this.getID( this.addNoticeForm?.value?.classId ) ?? [],
    //   user_id           : this.user_id
    // }
    const payload = { 
      academic_year_id : this.currentYear_id,
      branchId: this.branch_id ,
      branch_id: this.branch_id ,
      classes:this.getID( this.addNoticeForm?.value?.classId ) ?? [],
    }
    // this.homeworkService.getBatchList(payload).subscribe((res:any)=>{
    this.homeworkService.getBatchOnClass(payload).subscribe((res:any)=>{
      if(res?.status){
        this.batches = res.data
        if(!this.id && this.batches?.length != 0){
          this.addNoticeForm?.controls['batchId']?.patchValue(this.batches)
        }
        else if(this.id && !this.type3){
          this.addNoticeForm?.controls['batchId']?.patchValue(this.batches)
        }else{
          const filteredObjects = this.batches.filter(obj => this.showData?.payload?.batchId?.includes(obj.id));
          this.addNoticeForm?.controls['batchId']?.patchValue(filteredObjects ?? [])
          this.showData?.payload?.studentId?.length >  0 ? this.type3 = true : this.type3 = false
        }

        if(this.addNoticeForm?.value?.batchId?.length  == 1){
          this.getStudent()
        }

        // if(this.id && this.showData?.payload?.batchId && this.type3 ){
        
        //   // this.showData?.payload?.studentId ? this.getStudent() : this.type3 = false
        //   if(this.showData?.payload?.studentId){
        //   }
        //   if(this.id && !this.type3){
        //     // this.addNoticeForm.controls['noticeType'].disable()
        //   }
        // }
      }
    })
   }
  getStudent(){
    if(this.addNoticeForm?.value?.batchId?.length > 1 ){
      return
    }
    const ids = this.getID(this.addNoticeForm?.value?.batchId)
    const payload = {
      branchId : this.branch_id ?? "",
      batches  : ids ?? []
    }
    this.homeworkService.getStudent(payload).subscribe((res:any)=>{
      // this.students = res?.data ?? []
      this.renderDataS = res?.data ?? []
      this.renderDataS = this.renderDataS?.map(data => {
        return { ...data, full_name : data?.name ,checked: true };
      });
      if(this.id && this.showData?.payload?.studentId &&  this.type3){
        // const filteredObjects = this.students.filter(obj => this.showData?.payload?.studentId?.includes(obj.id));
        // this.addNoticeForm?.controls['studentId'].patchValue(filteredObjects ?? [])
        this.renderDataS.forEach(obj => {
          if (this.showData?.payload?.studentId?.includes(obj.id)) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
        this.type3 = false

        // if( this.id && !this.type3){
          // this.addNoticeForm.controls['noticeType'].disable()
        // }
      }
    })
  }

  // FACULTY DROPDOWN API   ??
  getFacultyList() {
    this.homeworkService.getFacultyList().subscribe((res: any) => {
        this.faculty = res.data;
    });
  }

  // ROLE DROPDOWN API
  
  getRoleList(){

    this.homeworkService.getRoleList().subscribe((resp:any) => {
      if(resp.status){
        // this.roles = [...[{ id: "", name: 'All' }] , ...resp.data]
        this.roles = resp?.data
        if( !this.id && this.flag){
          this.addNoticeForm?.controls['roleId']?.patchValue(this.roles)
          this.getUserList()
        }
        else if(this.id && this.type2){
          const role = this.roles.filter((ele)=> this.showData?.payload?.role_id?.includes(ele.id))
          this.addNoticeForm?.controls['roleId']?.patchValue(role)
          this.getUserList()
          if(this.id && !this.type2){
            // this.addNoticeForm.controls['noticeType'].disable()
          }
        } else if (this.addNoticeForm.value.noticeType == 2) {
          this.addNoticeForm?.controls['roleId']?.patchValue(this.roles)
          this.getUserList()
        }

      }
    })
  }
  getUserList(){
    const payload = {
      branch_id : this.branch_id ,
      role_id   : this.getID(this.addNoticeForm?.value?.roleId) ,
    }
    this.homeworkService.getEmployeeList(payload).subscribe((res:any) => {
      if(res?.status){
        
        const data = res?.data?.map((obj:any)=>{
          return {
            ...obj,
            name: obj?.full_name
          }
        })
        this.faculties = data
        this.renderDataF = data

        this.renderDataF = this.renderDataF.map(data => {
          return { ...data, checked: true };
        });


        if(this.addNoticeForm?.value?.roleId == ""){
          this.addNoticeForm?.controls['facultyId']?.patchValue(this.faculties) // no need
        }

        if(this.flag){
          this.addNoticeForm?.controls['facultyId']?.patchValue(this.faculties)
          this.flag = false
        }
        if(this.id && this.type2 ){
          const filteredObjects = this.faculties.filter(obj => this.showData?.payload?.facultyId?.includes(obj.id));
          this.addNoticeForm?.controls['facultyId']?.patchValue(filteredObjects)

          this.renderDataF.forEach(obj => {
            if (this.showData?.payload?.facultyId?.includes(obj.id)) {
              obj.checked = true;
            } else {
              obj.checked = false;
            }
          });

          this.type2 = false
        }
        if(this.id && !this.type2){
            // this.addNoticeForm.controls['noticeType'].disable()
          }
      }
    });
  }

  closeModel() {
    this.is_sendNewL = false
    this.is_sendL    = false
    this.is_send     = false
    this._modalService.dismissAll()
  }
  openPublishModal(modalName) {
    this._modalService.open(modalName);
  }
  getTemplate(){
    const payload = {
      branch_id   : this.branch_id,
      template_id : this.NOTICE_SMS_TEMPLATE_IDS,
    };
    this.homeworkService.getTemplate(payload).subscribe((res:any)=>{
      if(res?.status){
        this.template = res?.data
      }
    })
  }


  //#endregion Private methods
}
