import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { RouterModule, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../../transport-management/transport.service';
import { ExamReportService } from '../exam-report.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-exam-report-card-generate',
  templateUrl: './exam-report-card-generate.component.html',
  styleUrls: ['./exam-report-card-generate.component.scss']
})
export class ExamReportCardGenerateComponent {

  constructor(
      private toastr: Toastr,
      private fb: FormBuilder,
      private transportService: TransportService,
      private examReportService: ExamReportService,
      private router: Router,
      public CommonService: CommonService,
      private modalService: NgbModal
  ) {}

  URLConstants = URLConstants;
  reportList: boolean = false
  classes: any = [];
  results: any = [];
  batches: any = [];
  examTypes: any = [];
  templates: any = [];
  selectedClass: any = null;
  selectedBatch: any = null;
  selectedExamType: any = null;
  selectedTemplate: any = null;
  branch_id: any = null;
  id: any = null;
  academicYearId: any = null;
  tbody: any;
  editable: any;
  reportDetail: any = [];
  templateName = null
  generate = false;
  fees_status = 0;

  ngOnInit(): void {
    this.reportList = false
    this.transportService.getAcademicYear().subscribe((res: any) => {
      this.academicYearId = res?.data?.id;

      const classParams = {
        academic_id: this.academicYearId
      }
      this.examReportService.getClassList(classParams).subscribe((res: any) => {
        this.classes = res.data;
      });

      this.examReportService.getTemplateList(classParams).subscribe((res: any) => {
        this.templates = res?.data?.template_type?.template;
      });
    });

    const ExamTypeParams = {
      temp_id: null
    }
    this.examReportService.getExamTypeList(ExamTypeParams).subscribe((res: any) => {
      this.examTypes = res?.data;

    });
    this.verifyExamReport()
  }

  form = this.fb.group({
    class: ['', [Validators.required]],
    batch: ['', [Validators.required]],
    exam_type: ['', [Validators.required]],
    exam_type_id: [''],
    //template: ['',[Validators.required]],
  });

  changeClass(class_id: any) {
    this.selectedBatch = null;
    this.selectedExamType = null
    const params = {
      academic_id: this.academicYearId,
      classes_id: class_id
    }
    this.examReportService.getBatchList(params).subscribe((res: any) => {
      this.batches = res.data;
    });
  }

  changeBatch(batch_id: any) {
    this.selectedExamType = null
  }

  changeExamType(exam_type_id: any) {

    this.examReportService.getTemplateName({ exam_type_id: exam_type_id }).subscribe((resp: any) => {
      this.templateName = resp.data
      let exam_type = this.examTypes.find((x: any) => {
        return x.name == exam_type_id
      });
      this.form.value.exam_type_id = exam_type.id
    })
  }

  changeTemplate(template_id: any) {

  }

  submit(): void {
    this.generate = true;
    if (this.templateName == 'annual-report-template') {
      let data: any = this.form.value;
      data.academic_id = this.academicYearId
      this.router.navigate([this.examReportService.getBranch() + '/exam-report-card/edit'], {
        queryParams: data,
      });
      return;
    }
    Object.assign(this.form.value, { academic_id: this.academicYearId });
    this.examReportService.generateExamReportCard(this.form.value).subscribe(async (res: any) => {
      if (res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if (data.status == false) {
          this.toastr.showError(data.message);
        }
      } else {
        this.downloadFile(res, 'exam-report-card', "pdf");
      }
      this.generate = false;
    }, (err: any) => {
      this.toastr.showError(err.error.message);
      this.generate = false;
    });
  }

  open(content:any){
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result
  }

  handleFeesStatus(value:any){
    this.fees_status = value;
  }

  publish(): void {
    Object.assign(this.form.value, {academic_id:this.academicYearId});
    Object.assign(this.form.value, {is_publish:1});
    Object.assign(this.form.value, {pdf_template:this.templateName });
    Object.assign(this.form.value, {fees_status:this.fees_status });
    const userConfirmed = confirm('Are you sure you want to publish all exam of above exam type, first generate result check it then go to publish? Please keep in mind, once result is published after that not able to modify result data.');
    if (userConfirmed) {
      console.log(this.form.value);
      this.examReportService.publishExamReportCard(this.form.value).subscribe(async(res:any) => {
        if(res.status){
          this.toastr.showSuccess(res.message);
        }
        this.modalService.dismissAll()
        this.fees_status = 0;
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        console.log("error : ", err);
        this.modalService.dismissAll()
        this.fees_status = 0;
      });
    }
  }

  generateReport(type: any) {
    this.reportList = false
    Object.assign(this.form.value, { academic_id: this.academicYearId });
    Object.assign(this.form.value, { type: type });
    Object.assign(this.form.value, { subjects: true });
    Object.assign(this.form.value, { length: -1 });
    this.examReportService.getStudentMarksForReport(this.form.value).subscribe((resp: any) => {
      this.downloadFile(resp, 'exam-report-card', type);
    })
  }

  examReportData: any;

  verifyExamReport(flag: boolean = false) {
    console.log(flag);
    this.reportList = flag
    if (this.reportList) {
      Object.assign(this.form.value, { academic_id: this.academicYearId });
      Object.assign(this.form.value, { type: 'verify' });
      Object.assign(this.form.value, { subjects: true });
      Object.assign(this.form.value, { length: -1 });
      this.examReportService.getStudentMarks(this.form.value).subscribe((resp: any) => {
        this.examReportData = resp;
      })
    }
  }

  grace() {
    let data: any = this.form.value;
    data.academic_id = this.academicYearId
    this.router.navigate([this.examReportService.getBranch() + '/exam-report-card/grace'], {
      queryParams: data,
    });
    return;
  }

  downloadFile(res: any, file: any, format: any) {
    let fileName = file;
    let blob: Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if (format == 'pdf' || format == 'pdf2') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href = pdfSrc
      a.click();
    }
    this.generate = false;
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
