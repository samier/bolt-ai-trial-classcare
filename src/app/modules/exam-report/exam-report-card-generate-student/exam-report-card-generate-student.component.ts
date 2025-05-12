import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamReportService } from '../exam-report.service';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-exam-report-card-generate-student',
  templateUrl: './exam-report-card-generate-student.component.html',
  styleUrls: ['./exam-report-card-generate-student.component.scss']
})
export class ExamReportCardGenerateStudentComponent {

  public studentDetails:any = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  symfonyHost = enviroment.symfonyHost;
  examTypes: any = [];
  selectedExamType: any = null;
  studentId: any = null;
  branchID: any = null;
  academicYear: any = null;

  login_id:any = null;
  profile_image:any;
  username:any;
  mobile_number:any;
  batch:string = "-";
  public institute_modules:any = [];
  private API_URL = enviroment.apiUrl;

  constructor( 
      private toastr: Toastr,
      private fb: FormBuilder,
      private examReportService: ExamReportService,
      private httpRequest: HttpClient
  ) {
    const studentDetailsDecodedData = decodeURIComponent(this.studentDetails);
    var keyValuePairs = studentDetailsDecodedData.split('|');
    var studentidValue = "";
    var studentbranchidValue = "";    

    for (var i = 0; i < keyValuePairs.length; i++) {
      var keyValue = keyValuePairs[i].split('=');
      if (keyValue[0] === 'studentid') {
        studentidValue = keyValue[1];
      } else if (keyValue[0] === 'studentbranchid') {
        studentbranchidValue = keyValue[1];
      }
    }
    this.studentId = studentidValue;
    this.login_id = studentidValue;
    this.branchID = studentbranchidValue;

    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
    });
  }  

  ngOnInit(): void {
    this.examReportService.getExamTypeListForStudent(this.studentId).subscribe((res:any) => {
      this.examTypes = res?.data;
    });
  }

  form = this.fb.group({
    exam_type: ['',[Validators.required]]
  });

  changeExamType(exam_type_id:any) {
  }

  submit() {
    Object.assign(this.form.value, {student_id:this.studentId});
    this.examReportService.generateExamReportCardForStudent(this.form.value, this.studentId).subscribe((res:any) => {  
      //console.log("response data : ", res);
      if(res?.body?.type == 'application/json') {
        this.toastr.showError("Data Not Available!");
      } else {
        this.downloadFile(res,'exam-report-card', "pdf");
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      console.log("error : ", err);
    });
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  setsymfonyUrl(url:string) {
    console.log("url", this.symfonyHost+url);
  }
}
