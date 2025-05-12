import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { StudentLeavingCertificateService } from '../../student-leaving-certificate/student-leaving-certificate.service';

@Component({
  selector: 'app-exam-report-card',
  templateUrl: './exam-report-card.component.html',
  styleUrls: ['./exam-report-card.component.scss']
})
export class ExamReportCardComponent {

  constructor(
      private router: Router,
      private activatedRouteService: ActivatedRoute,      
      private toastr: Toastr,
      private datePipe: DatePipe,
      private fb: FormBuilder,
      private leavingCertificateService: StudentLeavingCertificateService,
  ) {}

  URLConstants = URLConstants;
  classes: any = [];
  batches: any = [];
  examTypes: any = [];
  templates: any = [];
  selectedClass: any = null;
  selectedBatch: any = null;
  selectedExamType: any = null;
  selectedTemplate: any = null;
  branch_id: any = null;
  id: any = null;

  ngOnInit(): void {

    this.leavingCertificateService.getClassesList().subscribe((res:any) => {  
      this.classes = res.data;
    });    
  }

  form = this.fb.group({
    class: ['',[Validators.required]],
    batch: ['',[Validators.required]],
    exem_type: ['',[Validators.required]],
    template: ['',[Validators.required]],  
  });

  changeClass(class_id:any) {
    this.selectedBatch = null;
    this.leavingCertificateService.getBatchesListByClassId(class_id).subscribe((res:any) => {  
      this.batches = res.data;
    });
    console.log("class : ", class_id);
  }
  
  changeBatch(batch_id:any) {
    console.log("batch : ", batch_id);
  }

  changeExamType(exam_type_id:any) {
    console.log("Exam type : ", exam_type_id);
  }

  changeTemplate(template_id:any) {
    console.log("template_id : ", template_id);
  }

  submit(): void {
    console.log(this.form.value);
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
