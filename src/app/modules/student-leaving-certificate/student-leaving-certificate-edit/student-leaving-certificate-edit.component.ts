import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { StudentLeavingCertificateService } from '../student-leaving-certificate.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-student-leaving-certificate-edit',
  templateUrl: './student-leaving-certificate-edit.component.html',
  styleUrls: ['./student-leaving-certificate-edit.component.scss']
})
export class StudentLeavingCertificateEditComponent {

  constructor(
    private fb: FormBuilder, 
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    private datePipe: DatePipe,
    private leavingCertificateService: StudentLeavingCertificateService,
    public CommonService: CommonService
  ) {}


  URLConstants = URLConstants;
  id: any = null;
  classes: any = [];
  batches: any = [];
  students: any = [];
  studentLc: any = null;
  branch_id: any = "";
  selectedClass: any = null;
  selectedBatch: any = null;
  selectedStudent: any = null;

  class: string = "";
  batch: string = "";
  student: string = "";
  section: string = "";

  lc_type:any = '1';
  errors:any = [];

  files:any = []
  readonly:boolean = false;
  
  ngOnInit(): void {
    this.addAttechment()
    this.readonly = this.activatedRouteService?.snapshot?.data?.['readonly'];
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id) {      
      this.leavingCertificateService.editLeavingCertificate(this.id).subscribe((res:any) => {  
        this.studentLc = res?.data;
        console.log("response : ", res.data);
        this.selectedClass = this.studentLc?.batch_detail?.class.id;
        this.selectedBatch = this.studentLc?.batch_detail?.id;
        this.selectedStudent = this.studentLc?.id;

        this.form.patchValue({
            leaving_date: this.studentLc?.leaving_date,
            progress: this.studentLc?.progress,
            conduct: this.studentLc?.conduct,
            working_days_school: this.studentLc?.working_days_school,
            reason_leaving_school: this.studentLc?.reason_leaving_school,
            result_last_examination: this.studentLc?.result_last_examination,
            lc_book_no: this.studentLc?.lc_book_no,
            class: this.studentLc?.batch_detail?.class.name,
            batch: this.studentLc?.batch_detail?.name,
            student: this.studentLc?.full_name,
            student_gr_no: this.studentLc?.gr_number,
            section: this.studentLc?.batch_detail?.class?.section?.name,
            lc_remark: this.studentLc?.lc_remark,
            lc_type: this.studentLc?.lc_type.toString(),
            generated_by: this.studentLc?.lc_generated_by?.full_name,
            generated_datetime: this.studentLc?.lc_generated_date_time ? this.changeDateFormat(this.studentLc?.lc_generated_date_time,'DD-MM-yyyy, h:mm a') : '',
            generated_academic_year: this.studentLc?.lc_generated_academic_year?.year,
        });
        this.lc_type = this.studentLc?.lc_type.toString();
        this.files = this.studentLc?.lc_attachment
        this.files.forEach((file:any)=>{
          this.previousAttachmentArray.push(this.createAttechment(file));
        })
      });      
    } else {
      this.setUrl(URLConstants.LEAVING_CERTIFICATE_LIST);
    }
  }

  changeDateFormat(dateString: any, format:any = 'yyyy-MM-DD') {
    try {
        const parsedDate = moment(dateString);
        return parsedDate.format(format);
    } catch (error) {
        return 'Invalid Date';
    }
  }

  form = this.fb.group({
    class: [''],
    batch: [''],
    student: [''],
    student_gr_no: [''],
    generated_by: [''],
    generated_datetime: [''],
    generated_academic_year: [''],
    leaving_date: ['',[Validators.required]],
    progress: new FormControl(''),
    conduct: new FormControl(''),
    working_days_school: new FormControl(''),
    reason_leaving_school: new FormControl(''),
    result_last_examination: new FormControl(''),
    lc_book_no: new FormControl(''),
    section: new FormControl(''),
    lc_remark: new FormControl(''),
    lc_type: new FormControl(''),
    attachment:this.fb.array([]),
    previous_attachment:this.fb.array([]),
  });


  changeClass(class_id:any) {
    //
  }  
  changeBatch(batch_id:any) {
    //
  }  
  changeStudent(student_id:any) {
    //
  }

  submit(): void {
    const formData = this.convertToFormData(this.form.value);
    let leaving_date = this.form.value.leaving_date;
    if(leaving_date && this.studentLc?.admission_date && leaving_date > this.studentLc?.admission_date) {
      this.leavingCertificateService.updateStudentLcDetail(this.id, formData).subscribe((res:any) => {  
        //console.log("form res : ", res);
        if(res.status) {
          this.toastr.showSuccess(res.message);
          this.router.navigate([this.setUrl(URLConstants.LEAVING_CERTIFICATE_LIST)]);
        } else {
          this.errors = res.data
          this.toastr.showError(res.message);
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });
    }  else {
      this.toastr.showError("Leaving date must be after the admission date");
    }
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
        formData.append(parentKey, data);
      }
    }
    return formData;
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  handleLcTypeChange(lc_type:any){

  }
  
  get attechmentArray() {
    return this.form.get('attachment') as FormArray;
  }

  get previousAttachmentArray() {
    return this.form.get('previous_attachment') as FormArray;
  }

  selectAttechment(event,item) {
    const file = event.target.files[0]
    item.controls.attachment.patchValue(file);
  }

  createAttechment(file): FormGroup {
    return this.fb.group({
      name: [file.file_name],
      id: [file.id],
    });
  }

  createAttachment(ele?:any): FormGroup {
    return this.fb.group({
      attachment_name: [ele?.attachment_name ?? null],
      attachment: [null],
    });
  }

  addAttechment() {
    this.attechmentArray.push(this.createAttachment())
  }

  removeAttechment(i) {
    this.attechmentArray.removeAt(i);
  }

  deleteAttechment(i){
    this.attechmentArray.controls[i].setValue(null)  
  }

  attachmentDelete(file:any){
    let confirm = window.confirm('Are you sure you want to delete this attachment?')
    if(confirm){
      this.leavingCertificateService.deleteAttachment(file.id).subscribe((resp:any) => {
        if(resp.status){
          this.files?.splice(this.files?.indexOf(file), 1);
          this.toastr.showSuccess(resp.message)
        }else{
          this.toastr.showError(resp.message)
        }
      }), (error:any) => {
        this.toastr.showError(error?.error?.message)
      }
    }
    
  }

}
