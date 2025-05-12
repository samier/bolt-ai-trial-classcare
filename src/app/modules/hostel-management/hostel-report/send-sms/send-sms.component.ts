import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HostelManagementService } from '../../hostel-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {

  @ViewChild('createwingMdl') createwingMdl: ElementRef | undefined;
  @Output() reload = new EventEmitter<void>();
  @Input() mdlData: any;
  hostelSms:FormGroup = new FormGroup({})

  // send_type:any=1;
  templates = [];
  whatsappTemplates = [];
  templateDetail:any;
  whatsappTemplateDetail:any;
  students: any;
  msgProvider: any;
  isSmsSend: boolean = false;
  isSubmited: boolean = false;
  send_type:any=1;
  constructor(
    private HostelManagementService: HostelManagementService,
    private formValidationService: FormValidationService,
    private toastr: Toastr,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.isSmsSend = false;
    this.formInit();
    this.getTemplateList();
  }

  formInit(){
    this.hostelSms = this.fb.group({
      sms_template_id : [null,[Validators.required]],
      whatsapp_template_id : [null],
      message : [null],  
      whatsappMessage : [null],
      send_type :["1"],
      is_father_message : [false],
      is_mother_message : [false],
      is_student_message : [false],
    })
  }

  getTemplateList()
  {
    this.HostelManagementService.getTemplateList().subscribe((resp:any) => {
      if(resp.status){
        this.templates = resp?.data?.hostel
        this.msgProvider = resp?.data?.branch?.messge_provider
      }
    })
  }

  templateChange(event)
  {
    this.hostelSms.controls['message'].reset();
    this.getTemplateDetail();
  }

  getTemplateDetail()
  {    
    this.HostelManagementService.getTemplateDetail(this.hostelSms.value.sms_template_id).subscribe((resp: any) => {
      if (resp.status) {
        this.templateDetail = resp?.data?.template
        this.hostelSms.controls['message'].patchValue(resp?.data?.template)
      }
    })
  }

  getWhatsappTemplateList()
  {
    this.HostelManagementService.getWhatsappTemplateList().subscribe((resp:any) => {
      if(resp.status){
        this.whatsappTemplates = resp?.data
      }
    })
  }

  whatsappTemplatesChange(event)
  {
    this.hostelSms.controls['whatsappMessage'].reset();
    this.getWhatsappTemplateDetail();
  }

  getWhatsappTemplateDetail()
  {
    this.HostelManagementService.getWhatsappTemplateDetail(this.hostelSms.value.whatsapp_template_id).subscribe((resp: any) => {
      if (resp.status) {
        this.whatsappTemplateDetail = resp?.data?.template
        this.hostelSms.controls['whatsappMessage'].patchValue(resp?.data?.template)
      }
    })
  }

  sendMessage()
  {
    if (this.hostelSms.invalid) {
      this.formValidationService.getFormTouchedAndValidation(this.hostelSms);
      // this.isSubmited = true;
      return
    }else
    {
      this.isSmsSend = true;
      this.students = Object.values(this.mdlData);    
      this.hostelSms.value.message = this.hostelSms.value.whatsappMessage
      const payload = {
        ...this.hostelSms.value,
        studentIds : this.students,
      }
      this.HostelManagementService.sendSms(payload).subscribe((resp: any) => {
        if (resp?.status == true) {        
          this.toastr.showSuccess(resp?.message);
          this.modalService.dismissAll()
          this.isSmsSend = false;
        }
      })
    }    
  }

  sendType(value:any)
  {
    this.hostelSms.controls['sms_template_id'].reset();
    this.hostelSms.controls['message'].reset();
    this.hostelSms.controls['whatsapp_template_id'].reset();
    this.hostelSms.controls['sms_template_id'].reset();
    this.hostelSms.controls['whatsappMessage'].reset();
    this.hostelSms.controls['is_father_message'].reset();
    this.hostelSms.controls['is_mother_message'].reset();
    this.hostelSms.controls['is_student_message'].reset();
    if(value == 1){
      this.hostelSms.controls['sms_template_id'].setValidators([Validators.required])
      this.hostelSms.controls['whatsappMessage'].clearValidators()
      this.getTemplateList();    
      this.send_type=1;
    }else if(value == 2){
      this.hostelSms.controls['whatsappMessage'].setValidators([Validators.required])
      this.hostelSms.controls['sms_template_id'].clearValidators()
      this.getWhatsappTemplateList();
      this.send_type=2;
    }else if(value==3){
      this.hostelSms.controls['sms_template_id'].setValidators([Validators.required])
      this.hostelSms.controls['whatsappMessage'].setValidators([Validators.required])
      this.getTemplateList();
      this.getWhatsappTemplateList(); 
      this.send_type=3;
    }
    this.hostelSms.controls['sms_template_id'].updateValueAndValidity();
    this.hostelSms.controls['whatsappMessage'].updateValueAndValidity();
  }

  close() {
    this.modalService.dismissAll()
  }
}
