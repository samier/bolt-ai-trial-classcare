import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormControl, FormBuilder, FormGroup, Validators, FormArray, } from '@angular/forms';
import { HomeworkService } from '../homework.service';
import { IDropdown } from 'src/app/types/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import moment from 'moment';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-add-homework',
  templateUrl: './add-homework.component.html',
  styleUrls: ['./add-homework.component.scss']
})
export class AddHomeworkComponent implements OnInit {
  //#region Public | Private Variables

  branch_id: any = window.localStorage.getItem('branch');
  user_id : any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  sections: any = [{ id: "", name: 'All Section' }];
  classes: any =  [];
  batches: any = [];
  students : any = []
  subjects: IDropdown[] = [];
  faculty: any = []

  URLConstants = URLConstants;

  $destroy: Subject<void> = new Subject<void>();

  addhomeworkForm: FormGroup | any;

  fileName: any
  imagebase64: any  

  sendNewL :boolean = false
  sendL : boolean = false

  attachmentType:string = ""
  id : any  
  showData: any;
  time: string | undefined;
  @ViewChild('file') fileSelect!: ElementRef;
  uploadedFiles: any;
  currentTime : any
  minDate: string | undefined;
  files : any
  delete_array: any[] = []; 
  studentEdit : boolean = false
  message = {
    send_father   : false,
    send_mother   : false,
    send_student  : false
  }
  is_send_sms : boolean = true
  payload : any = {}
  nav : boolean  = false
  is_modalLoading : boolean  = false
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(public CommonService: CommonService,
    private formBuilder: FormBuilder,
    public homeworkService: HomeworkService,
    private router: Router,
    private toastr: Toastr,
    private route: ActivatedRoute,
    private validationService: FormValidationService,
    private _modalService: NgbModal,
  ) { 
    
    this.id = this.route.snapshot.paramMap.get('id');

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
    this.currentTime = this.setNow(null)
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.minDate = new Date().toISOString().split('T')[0];

    this.initForm();
    if(this.id){
      this.showHomeWork(this.id)
    }
    else{

    }
    // this.getSectionList()
    this.getClass()
    // this.getClassList("")
    this.getFacultyList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  // Section Change
  onSectionChange() {
    this.classes = []
    this.batches = []
    this.subjects = []
    this.addhomeworkForm.controls.class_id.patchValue([])
    this.addhomeworkForm.controls.batch_id.patchValue([])
    this.addhomeworkForm.controls.subject_id.patchValue([])
    // this.getClassList(this.addhomeworkForm.value.section_id)
  }

  // Class Change
  onClassChange() {
    this.batches = []
    this.students = []
    this.subjects = []
    this.addhomeworkForm.controls.batch_id.patchValue([])
    this.addhomeworkForm.controls.student_ids.patchValue([])
    this.addhomeworkForm.controls.subject_id.patchValue([])
    this.getBatchList(this.addhomeworkForm.value.class_id)
    this.addhomeworkForm.controls['batch_id'].markAsPristine();
    this.addhomeworkForm.controls['batch_id'].markAsUntouched();
    this.addhomeworkForm.controls['student_ids'].markAsPristine();
    this.addhomeworkForm.controls['student_ids'].markAsUntouched();
  }

  // Batch Change
  onBatchChange() {
    this.students = []
    this.subjects = []
    this.addhomeworkForm.controls.student_ids.patchValue([])
    this.addhomeworkForm.controls.subject_id.patchValue(null)
    this.addhomeworkForm.controls['student_ids'].markAsPristine();
    this.addhomeworkForm.controls['student_ids'].markAsUntouched();
    const ids = this.addhomeworkForm.value.batch_id?.length > 0 ? this.addhomeworkForm.value.batch_id.map(ele => ele.id) : []
    if(ids.length > 0 ){
      this.getStudentList(ids)
      this.getSubjectList(ids)
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input?.files as FileList;
    if (files && files?.length > 0) {
      let fileListArray: any = []
      Array.from(files).forEach(file => {
        fileListArray.push(file)
      });
      
      if(fileListArray?.length > 0 && this.addhomeworkForm.value?.upload?.length > 0){
        const combinedArray = fileListArray?.concat(this.addhomeworkForm?.value?.upload);

        const uniqueFiles = Array.from(new Set(combinedArray?.map(file => file.name))).map(name => {
          return combinedArray.find(file => file.name === name);
        });
    
        this.addhomeworkForm.get('upload').patchValue(uniqueFiles);
      } else {
        this.addhomeworkForm.get('upload').patchValue(fileListArray);
      }
      this.fileSelect.nativeElement.value = "";

      const fileSize: number = this.getTotalSize()
      if (fileSize > 8) {
        return this.toastr.showError('Total file size cannot exceed more than 8 MB.')
      }
    }
  }

  // Section dropdown data
  getSectionList() {
    this.homeworkService
      .getSectionList({ branch: this.branch_id })
      .subscribe((res: any) => {
        if (res.status) {
          this.sections = [...this.sections, ...res.data ] ;
        }
      });
  }
  // Class dropdown data

  getClass(){
    const payload = {
      academic_year_id: this.currentYear_id ,
      branch_id: this.branch_id ,
      user_id: this.user_id
    }
    this.homeworkService.getClass(payload,this.user_id).subscribe((res: any) => { 
      if(res?.status){
        this.classes = res?.data;
        if(this.id){
          this.addhomeworkForm.controls.class_id.patchValue(this.showData?.batch[0]?.classes_id)
        }
      }
    } )
  }
  // getClassList(params: any) {
  //   this.homeworkService
  //     .getClassList(params)
  //     .subscribe((res: any) => {
  //       this.classes = res.data ;
  //       if(this.id){
  //         this.addhomeworkForm.controls.class_id.patchValue(this.showData?.batch[0]?.classes_id)
  //       }
  //     });
  // }

  // Batch dropdown data
  getBatchList(id: number) {
    this.homeworkService
      .getBatchesList({ classes: [id] })
      .subscribe((res: any) => {
        this.batches = res.data;

      });
  }
  getStudentList(id : number) {
    const payload = {
      batches : id
    }
    this.homeworkService.getStudentListByBatch(payload).subscribe((res:any)=>{
      if(res?.status){
        this.students = res?.data?.map((obj:any)=>{
          return {
            ...obj ,
            name : obj?.full_name
          }
        })
  
        if(this.studentEdit){
          this.studentEdit = false
        }
        else{
          this.addhomeworkForm.controls.student_ids.patchValue(this.students)
        }
      }
    })
  }
  // Subject DropDown data
  getSubjectList(ids: any) {
    const payload = {
      branchId: this.branch_id,
      academicYear: this.currentYear_id,
      batchId: ids
    }
    this.homeworkService
      .getSubjectList(payload)
      .subscribe((res: any) => {
        if (res.data) {
          this.subjects = res.data.map((ele) => {
            return { id: ele.subject_id, name: ele.subject_name }
          })
        }
      })
  }
  // Faculty dropdown data
  getFacultyList() {
    this.homeworkService
      .getFacultyList()
      .subscribe((res: any) => {
        this.faculty = res.data;
      });
  }
  draftChange(event){
    if(event.target.checked){
      this.addhomeworkForm.controls.release_time.enable()
      this.addhomeworkForm.controls.send_date.enable()
    } else {
      this.addhomeworkForm.controls.release_time.disable()
      this.addhomeworkForm.controls.send_date.disable()
    }
  }

  deleteFile(id:any){
    this.delete_array = [...this.delete_array, id];
    this.uploadedFiles = this.uploadedFiles?.filter( item => item.id != id )
  }

  removeSelectedFile(index) {
    this.addhomeworkForm?.value?.upload?.splice(index,1)
    this.addhomeworkForm?.controls?.upload?.patchValue(this.addhomeworkForm.value.upload)
    const fileSize:number  = this.getTotalSize()
    if (fileSize > 8) {
      return  this.toastr.showError('Total file size cannot exceed more than 8 MB.')
    }
  }

  download(url:string){
    window.open(url,'_blank')
  }

  getTotalSize() {
    if (this.addhomeworkForm.value.upload?.length > 0) {
      const size = this.addhomeworkForm.value.upload?.map((item: any) => item?.size)?.reduce((acc: number, item: any) => acc + item);
      return size / 1000 / 1000 
    } else {
      return 0
    }
  }

  closeModel(){
    this.sendL = false
    this.is_modalLoading = false
    this.message.send_father  = false,
    this.message.send_mother  = false,
    this.message.send_student = false
    this._modalService.dismissAll()
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    this.addhomeworkForm = this.formBuilder.group({
      class_id        : [ null ,[Validators.required]],
      batch_id        : [  [], [Validators.required] ], // null => []
      student_ids     : [ [] , [Validators.required] ],
      subject_id      : [  null, [Validators.required] ],
      tittle          : [  "",   [Validators.required] ],
      // send_date       : [ this.getDate(null), [Validators.required] ],
      send_date       : [ { value: this.getDate(null), disabled: true } , Validators.required ],
      submission_date : [ this.getDate(null,1), [Validators.required] ],
      draft           : [ false ],
      release_time    : [{ value: this.setNow(null), disabled: true }],
      description     : [ "", [Validators.required]],
      upload          : [ null ],
      video_link      : [ "" , [ ClassCareValidatores.pattern(urlRegex,'Invalid URL')] ],
      homework_type    :[1]
    });

    if (this.attachmentType == 'videolink') {
      this.addhomeworkForm.controls['video_link'].setValidators([Validators.required]);
      this.addhomeworkForm.controls['video_link'].updateValueAndValidity();
    }
    // if (this.attachmentType == 'videolink' || this.attachmentType == 'notes' || this.attachmentType == 'syllabus') {
    //   this.addhomeworkForm.controls['subject_id'].clearValidators();
    //   this.addhomeworkForm.controls['subject_id'].updateValueAndValidity();
    // }
  }
  showHomeWork(id: any) {
    this.homeworkService
      .showHomeWork(id)
      .subscribe( (res: any) => {
        if (res.status) {
          this.showData =  res?.data
          const newArray = this.showData?.batch?.map(item => ({
            id: item?.id,
            name: item?.name
          }));
          const student_ids =this.showData?.students_notes_status?.map((obj:any)=>({
            id   : obj?.id,
            name : obj?.full_name
          }))
          
          // this.getClassList("")
          this.getClass()
          this.getBatchList(this.showData?.batch[0]?.classes_id)
          
          const batches = newArray.map(item => item.id)
          this.studentEdit = true
          this.getStudentList(batches)
          this.getSubjectList(batches)

          this.addhomeworkForm.patchValue({
            class_id        : this.showData?.batch[0]?.classes_id,
            batch_id        : newArray ,
            student_ids     : student_ids , 
            subject_id      : this.showData?.subject?.id ,
            tittle          : this.showData?.title ,
            send_date       : this.getDate(this.showData?.work_date) ,
            submission_date : this.getDate(this.showData?.submission_date) ,
            draft           : this.showData?.is_draft ? true : false ,
            release_time    : this.setNow(this.showData?.work_date) ,
            description     : this.showData?.description ?? '' ,
            upload          : this.showData?.notes_attachments ?? null ,
            video_link      : this.showData?.link ?? '',
            homework_type   : this.showData?.homework_type ?? 1
          })
          if(this.addhomeworkForm.value.draft == true){
            this.addhomeworkForm.controls.release_time.enable()
            this.addhomeworkForm.controls.send_date.enable()
          }
          this.uploadedFiles = this.addhomeworkForm.value.upload
          this.addhomeworkForm.controls.upload.patchValue(null)
          if(this.uploadedFiles){
          }
        }
      });
  }
  
  send_New(modalName:any = null ) {
    this.apiPayLoad(false , modalName )
  }
  send(modalName:any = null) {
    this.apiPayLoad(true , modalName )
  }

  async apiPayLoad(nav: boolean , modalName:any = null) {
    const workDate = this.addhomeworkForm.getRawValue().send_date

    // const workDate = this.addhomeworkForm.value.send_date
    const subDate = this.addhomeworkForm.value.submission_date
    if(workDate > subDate){
      this.toastr.showError("Submission date cannot be earlier than work date")
      return 
    }
    else{
    }

    if (this.addhomeworkForm.invalid) {
      this.validationService.getFormTouchedAndValidation(this.addhomeworkForm)
      this.sendL = false 
      this.sendNewL = false
      return;
    }

    const fileSize: number = this.getTotalSize()
    if (fileSize > 8) {
      this.toastr.showError('Total file size cannot exceed more than 8 MB.')
      return 
    }

    nav ? this.sendL = true : this.sendNewL = true

    let batches = this.getID(this.addhomeworkForm?.value?.batch_id);
    let student_ids = this.getID(this.addhomeworkForm?.value?.student_ids);

    const payload:any = {
      branchId       : this.branch_id,
      academicYear   : this.currentYear_id,
      attachmentType : this.attachmentType,
      title          : this.addhomeworkForm?.value?.tittle,
      homework_type  : this.addhomeworkForm?.value?.homework_type,
      description    : this.addhomeworkForm?.value?.description,
      workDate       : this.formatDate( this.addhomeworkForm.getRawValue().send_date + " " + this.addhomeworkForm.getRawValue().release_time ),
      submissionDate : this.addhomeworkForm?.value?.submission_date,
      subjectId      : this.addhomeworkForm?.value?.subject_id,
      batchId        : batches,
      student_ids    : student_ids,
      isDraft        : this.addhomeworkForm?.value?.draft ? 1 : 0 ,
      videoLink      : this.addhomeworkForm?.value?.video_link,
      file           : [],
      send_father    : 0,
      send_mother    : 0,
      send_student   : 0,
      ...(this.id && {deleted_id: this.delete_array?.length > 0 ? this.delete_array: [] })
    }
    const file = this.addhomeworkForm?.value?.upload;
    if (file) {
      for (let index = 0; index < file?.length; index++) {
        const element = file[index];
        const imagebase64 = await this.convertToBase64(element);
        const data = {
          fileName    : element.name,
          imagebase64 : imagebase64,
        }
        payload.file.push(data);
      }
    }
    this.payload = payload
    this.nav = nav


    if(this.id){
      this.addHomework(payload, nav)
    }
    else{
      this._modalService.open(modalName);
    }
  }

  sendHomeWork(){
    const payload = {
      send_father  : this.message.send_father ? 1 : 0 ,
      send_mother  : this.message.send_mother ? 1 : 0 ,
      send_student : this.message.send_student ? 1 : 0 ,
    }
    this.is_modalLoading = true

    this.addHomework( { ...this.payload , ...payload } , this.nav )
  }

  addHomework(payload: any, nav: boolean) {

    this.homeworkService
      .addUpteHomeWork(payload,this.id)
      .subscribe((res: any) => {
        if (res?.status) {
          if(this.id){
            this.toastr.showSuccess(`${this.attachmentType.charAt(0).toUpperCase() + this.attachmentType.slice(1).toLowerCase()} updated Sucessfully` );
          }
          else{
            this.toastr.showSuccess(`${this.attachmentType.charAt(0).toUpperCase() + this.attachmentType.slice(1).toLowerCase()} created Sucessfully` );
          }
          if (nav) {
            this.closeModel()
            this.sendL = false
            this.router.navigate([this.homeworkService.setUrl(4,this.attachmentType)]);
          }
          else {
            this.closeModel()
            this.reset()
            // this.addhomeworkForm.controls.batch_id.patchValue([])
            // this.addhomeworkForm.controls.batch_id.patchValue([])
          }
          this.sendL = false
        }
        else{
          this.sendL = false
          this.sendNewL = false
          this.is_modalLoading = false
          this.toastr.showError(res?.message);
        }
      })
  }
  reset() {
    this.addhomeworkForm.reset()
    this.addhomeworkForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
      this.addhomeworkForm.controls['batch_id'].markAsPristine();
      this.addhomeworkForm.controls['batch_id'].markAsUntouched();

      this.addhomeworkForm.controls['student_ids'].markAsPristine();
      this.addhomeworkForm.controls['student_ids'].markAsUntouched();
    })
    this.classes = []
    this.getClass()
    // this.getClassList("")
    this.addhomeworkForm.controls.class_id.patchValue(null)

    this.batches = []
    this.addhomeworkForm.controls.batch_id.patchValue([])

    this.students = []
    this.addhomeworkForm.controls.student_ids.patchValue([])

    this.subjects = []
    this.addhomeworkForm.controls.subject_id.patchValue(null)
    this.addhomeworkForm.controls.tittle.patchValue("")

    this.addhomeworkForm.controls.send_date.patchValue(this.getDate(null))
    this.addhomeworkForm.controls.submission_date.patchValue(this.getDate(null))
    this.addhomeworkForm.controls.release_time.patchValue(this.setNow(null))
    this.addhomeworkForm.controls.draft.patchValue(false)

    this.addhomeworkForm.controls.description.patchValue("")
    this.addhomeworkForm.controls.video_link.patchValue("")
    this.addhomeworkForm.controls.upload.patchValue(null)
    this.addhomeworkForm.controls.homework_type.patchValue(1);
    this.getFacultyList()

    this.sendNewL = false
  }

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

  getID(array: any) {
    if (array == null || array.length == 0) {
      return []
    }
    return array.map((item) => item.id)
  }

  // date
  getDate(data:any, mode = 0) {
    let date

    if (data == null) {
      if(mode==0){
        date = new Date()
      }else{
        date = new Date(new Date().setDate(new Date().getDate()+1));
      }
    } else if (moment(data, 'DD-MM-YYYY hh:mm:ss A', true).isValid()) {
      date = moment(data, 'DD-MM-YYYY hh:mm:ss A').toDate();
    } else if (moment(data, 'YYYY-MM-DD', true).isValid()) {
      date = moment(data).toDate();
    } else {
      date = new Date(data);
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    
    return formattedDate
  }

  // time 
  setNow(data:any){
    let now;
    if (data == null) {
      now = new Date();
    } else {
      now = moment(data, 'DD-MM-YYYY hh:mm:ss A').toDate();
    }
    let hours = ("0" + now.getHours()).slice(-2);
    let minutes = ("0" + now.getMinutes()).slice(-2);
    let str = hours + ':' + minutes;
    this.time = str;
    return this.time
  }

  // Date and Time 
  formatDate(inputDateStr) {
    const inputDate = new Date(inputDateStr);
    const day = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();
    let hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
  
    const period = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12;
  
    const formattedDate = `${('0' + day).slice(-2)}-${('0' + month).slice(-2)}-${year} ${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)} ${period}`;

    return formattedDate;
  }
  compareTimes(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;

    if (totalMinutes1 < totalMinutes2) {
        // console.log(`${time1} is earlier than ${time2}`);
    } else if (totalMinutes1 > totalMinutes2) {
        // console.log(`${time1} is later than ${time2}`);
    } else {
        // console.log(`${time1} is the same time as ${time2}`);
    }
}

onDateChange(event) {
  console.log('event: ', event);

}
  //#endregion Private methods
}
