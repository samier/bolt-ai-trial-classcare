import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamReportService } from '../exam-report.service';

@Component({
  selector: 'app-exam-report-card-generate-faculty',
  templateUrl: './exam-report-card-generate-faculty.component.html',
  styleUrls: ['./exam-report-card-generate-faculty.component.scss']
})
export class ExamReportCardGenerateFacultyComponent {

  public userDetails:any = ('; '+document.cookie)?.split(`; user=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  examTypes: any = [];
  selectedExamType: any = null;
  userId: any = null;
  branchID: any = null;
  academicYear: any = null;
  batchID: any = null;

  constructor(     
      private toastr: Toastr,
      private fb: FormBuilder,
      private examReportService: ExamReportService
  ) {
    const userDetailsDecodedData = decodeURIComponent(this.userDetails);
    const userDetailsJsonData = JSON.parse(userDetailsDecodedData);
    this.userId = (userDetailsJsonData) ? userDetailsJsonData?.userid : "";
  }

  ngOnInit(): void {
    const userParams = {
      user_id: this.userId
    }
    this.examReportService.getExamTypeListForFaculty(userParams, this.userId).subscribe((res:any) => {
      //console.log("response : ", res);
      this.examTypes = res?.data?.examTypeList;
      this.batchID = res?.data?.batch_id;
    });
  }

  form = this.fb.group({
    exam_type: ['',[Validators.required]], 
  });

  changeExamType(exam_type_id:any) {
  }

  submit(): void {
    Object.assign(this.form.value, {user_id:this.userId});
    Object.assign(this.form.value, {batch_id:this.batchID});
    this.examReportService.generateExamReportCardForFaculty(this.form.value, this.userId).subscribe((res:any) => {  
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
}
