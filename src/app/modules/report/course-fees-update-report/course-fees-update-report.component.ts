import { Component, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ReportService } from '../report.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';

@Component({
  selector: 'app-course-fees-update-report',
  templateUrl: './course-fees-update-report.component.html',
  styleUrls: ['./course-fees-update-report.component.scss']
})
export class CourseFeesUpdateReportComponent implements OnInit {

  constructor(
    private reportService: ReportService,  
    private fb: FormBuilder,  
  ) { }

  classes: any = [];
  selectedClass: any = null;
  sections = [{ id: '', name: 'All' }];
  selectedSection: any = null;
  generate = false;
  ngOnInit(): void {
    let data = {
      branches : this.reportService.getBranch()
    }
    this.reportService.getSections(data).subscribe((res:any) => {  
      this.sections = this.sections.concat(res.data);
    });
  }

  form = this.fb.group({
    section: ['',[Validators.required]],
    class: [''],    
  });

  changeSection(section_id?:any){  
    let sections = section_id == '' ? this.sections.filter((el:any) => el.id != '').map((x:any) => x.id) : [section_id];
    this.selectedClass = null;
    this.reportService.getCourseList({'section_id':sections}).subscribe((res: any) => {
      this.classes = res.data;
    });
  }

  changeClass(class_id:any){   
      
  }

  downloadExcel(format: string) {
    this.generate = true;
    let param = {
      'section_id' : this.selectedSection,
      'class_id' : this.selectedClass
    }
    this.reportService.getExcel(format,param).subscribe((res: any) => {
      this.downloadFile(res,'course-fees-update-report', format);
      this.generate = false;
    });
  }

  downloadFile(res: any,file: any, format:any) {   
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.contentWindow?.print();
      },200);
      //iframe.contentWindow?.print();
    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
    this.generate = false;
  }

}
