import { Component, OnInit } from '@angular/core';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TemplateService } from '../template-management.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-section-template',
  templateUrl: './not-section-template.component.html',
  styleUrls: ['./not-section-template.component.scss']
})
export class NotSectionTemplateComponent implements OnInit {
  URLConstants  = URLConstants;
 section_id:any = 0;

  constructor(
    private TemplateService: TemplateService,
    private toastr: Toastr,
    private modalService: NgbModal, private route : ActivatedRoute
  ) {
    this.section_id=this.route.snapshot.paramMap.get("id");
  }

  loading:boolean = false;
  reports:any = []
  image= ''
  template_name= null

  ngOnInit() {
    this.getReportTemplates();
  }

  getReportTemplates(){
    this.loading = true;
    this.TemplateService.getReportTemplates({section_id:this.section_id}).subscribe((resp:any) => {
      this.reports = resp.data.reports;
      this.loading = false;
    })
  }

  save(){
    let reports = this.reports.filter((el:any) => {
      return el.pdf_template_id != null;
    })
    const data = {
      reports : reports,
      section_id:this.section_id,
    }
    this.TemplateService.updateReportTemplates(data).subscribe((resp:any) => {
      if(resp.status){
        this.getReportTemplates();
        this.toastr.showSuccess(resp.message)
      }
      else{
        this.toastr.showError(resp.message)
      }
    })
  }
  

  open(content:any, index:any, image_id:any) {
    let image = this.reports[index].template.find((el:any) => el.id == image_id);
    this.image = image.template_image
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' })		
	}

  downloadSampleTemplate(index:any, template_id:any, report:any){
    let image = this.reports[index].template.find((el:any) => el.id == template_id);
    this.template_name = image.name
    const data = {
      template : this.template_name,
      report: report
    }
    this.TemplateService.downloadSamplePdf(data).subscribe((resp:any) => {
      this.downloadFile(resp, 'sample-template')
    })

  }

  downloadFile(res: any,file: any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let a = document.createElement('a');
    a.download = fileName;
    a.href =  window.URL.createObjectURL(blob) 
    a.click();
  }
}
